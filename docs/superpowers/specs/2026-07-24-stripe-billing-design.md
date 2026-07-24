# Assinatura via Stripe — Design

Data: 2026-07-24
Status: aprovado (design), aguardando revisão da spec

## Objetivo

Cobrar assinatura mensal recorrente (R$ 19,90/mês, plano único) de quem se
cadastrar no TapGym a partir de agora, via Stripe Checkout. Contas que já
existem hoje (beta gratuito) ficam isentas para sempre.

## Decisões (fechadas no brainstorming)

1. **Modelo de cobrança:** assinatura recorrente, plano único, só mensal —
   sem tiers, sem anual, sem trial.
2. **Preço:** R$ 19,90/mês (comparável a apps de treino como Strong/Hevy).
3. **Migração do beta:** contas existentes na data da migração ficam com
   `is_legacy_free = true` e nunca são cobradas. Só cadastros novos, daqui
   pra frente, entram no fluxo de cobrança.
4. **Momento da cobrança:** paywall logo após o cadastro — cria-se a conta
   (Supabase Auth já precisa existir para associar o customer da Stripe),
   e o usuário é redirecionado direto para o Stripe Checkout antes de
   acessar qualquer parte do app.
5. **Vínculo usuário ↔ pagamento:** por `client_reference_id` (o `id` do
   usuário no Supabase), não por e-mail — evita problemas de e-mail trocado
   ou mismatch de maiúsculas/minúsculas. `customer_email` é passado só para
   pré-preencher o campo na tela do Checkout.
6. **Abordagem técnica:** Stripe Checkout (hospedado) + Webhooks + Customer
   Portal (hospedado), em vez de Stripe Elements (formulário embutido) ou
   Payment Links. Menos código, PCI compliance e retentativa de cobrança
   ficam por conta da Stripe.
7. **Chaves já configuradas na Vercel são LIVE mode.** Product/Price e
   webhook de produção só serão criados em modo live com confirmação
   explícita do usuário no momento da implementação — depois de validar o
   fluxo inteiro em test mode primeiro.

## Modelo de dados

Migração `supabase/migrations/0008_stripe_billing.sql`, adiciona colunas em
`public.profiles`:

```sql
alter table public.profiles
  add column stripe_customer_id text,
  add column stripe_subscription_id text,
  add column subscription_status text,       -- 'active' | 'past_due' | 'unpaid' | 'canceled' | null
  add column is_legacy_free boolean not null default false;

-- Grandfathering: quem já tem conta na data da migração fica isento pra sempre.
update public.profiles set is_legacy_free = true;
```

Sem tabela `subscriptions` separada — um plano único, um registro de
assinatura por usuário, não precisa de histórico normalizado (YAGNI).

**Regra de acesso** (usada no gate e em qualquer checagem futura): usuário
tem acesso se `is_legacy_free = true` **ou** `subscription_status = 'active'`.

A policy de RLS existente (`profiles: owner can read own token`, `for select
using (auth.uid() = id)`) já cobre as colunas novas — não precisa de policy
adicional.

## Fluxo: cadastro → checkout

1. Fluxo de "Criar conta" em `src/app/login/page.tsx` continua igual (cria
   o `auth.users` + `profiles` via trigger existente).
2. Em vez de ir para `/dashboard`, o cadastro novo é redirecionado para uma
   página nova **`/assinar`**: nome do plano, preço, botão "Assinar" — um
   `<form method="POST" action="/api/stripe/checkout">` simples, sem Stripe.js
   no client.
3. `POST /api/stripe/checkout` (rota nova, `src/app/api/stripe/checkout/route.ts`):
   - Pega o usuário logado via `src/lib/supabase/server.ts` (cookie de sessão).
   - Sem sessão → 401.
   - Lê o `profile`; se já tiver `stripe_customer_id` (ex.: reabrindo o
     checkout depois de cancelar), reaproveita via `customer`; senão passa
     `customer_email`.
   - Cria a Checkout Session: `mode: "subscription"`, `client_reference_id:
     user.id`, `line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }]`,
     `success_url: <origin>/dashboard`, `cancel_url: <origin>/assinar`. Os
     query params opcionais que a Stripe pode anexar (`?session_id=...`) não
     são usados pela lógica de acesso — quem decide se o dashboard é
     acessível é sempre o gate no middleware, lendo `subscription_status` do
     profile, nunca a URL de retorno.
   - Responde com redirect (307) para `session.url`.

## Webhook — `POST /api/stripe/webhook`

Rota nova, `src/app/api/stripe/webhook/route.ts`. Valida a assinatura do
header `stripe-signature` contra `STRIPE_WEBHOOK_SECRET`
(`stripe.webhooks.constructEvent`, usando o corpo bruto da requisição).
Assinatura inválida → 400, não processa.

Usa a service-role key (sem sessão de usuário aqui — é a Stripe chamando).

Eventos tratados:
- `checkout.session.completed` → grava `stripe_customer_id`,
  `stripe_subscription_id` e `subscription_status = "active"` no profile
  identificado por `client_reference_id`.
- `customer.subscription.updated` → sincroniza `subscription_status` com o
  `status` do evento (`active`, `past_due`, `unpaid`, etc.), localizando o
  profile por `stripe_subscription_id`.
- `customer.subscription.deleted` → `subscription_status = "canceled"`.
- Qualquer outro evento é ignorado, respondendo 200 (evita retry
  desnecessário da Stripe).

Updates são sempre "sobrescreve com o estado mais atual do evento" —
reentrega ou entrega fora de ordem não corrompe o estado (idempotente por
natureza).

## Gate de acesso

`src/lib/supabase/middleware.ts` (onde já mora hoje o redirect de auth)
ganha mais uma checagem, depois de resolver `user`:
- Rotas isentas do gate: `/login`, `/` (landing) e `/assinar` (senão o
  próprio paywall vira inacessível).
- Usuário logado, fora dessas rotas, sem `is_legacy_free` nem
  `subscription_status = "active"` → redireciona para `/assinar`.
- Usuário logado **com** acesso que tentar abrir `/assinar` diretamente →
  redireciona para `/dashboard` (espelha a regra já existente para
  `/login`/`/` com usuário já autenticado).

## Customer Portal (gerenciar assinatura)

Link "Gerenciar assinatura" no menu do avatar (`src/components/layout/app-header.tsx`,
ao lado do dialog do atalho do Shortcut), que aciona
`POST /api/stripe/portal` (rota nova): cria uma
`stripe.billingPortal.sessions.create({ customer: profile.stripe_customer_id,
return_url: <origin>/dashboard })` e redireciona para lá. Cancelamento e
troca de cartão acontecem inteiramente na tela hospedada pela Stripe.

## Configuração / ambientes

Novo arquivo `src/lib/stripe.ts`: client do Stripe com inicialização lazy
(mesmo padrão de `src/lib/ratelimit.ts`), usando `STRIPE_SECRET_KEY`.

Env vars novas necessárias (além de `STRIPE_SECRET_KEY`/`STRIPE_PUBLISHABLE_KEY`,
que já existem na Vercel):
- `STRIPE_PRICE_ID` — Price do plano mensal.
- `STRIPE_WEBHOOK_SECRET` — assinatura do endpoint de webhook.

Sequência de implementação, dado que as chaves já configuradas são live:
1. Validar o fluxo inteiro em **test mode**: Price de teste, `.env.local`
   com chaves de teste, `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   (gera um `whsec_...` de teste), cartão `4242 4242 4242 4242`.
2. Só depois de validado ponta a ponta, criar o Price e o webhook em modo
   live e configurar `STRIPE_PRICE_ID`/`STRIPE_WEBHOOK_SECRET` na Vercel —
   com confirmação explícita do usuário nesse momento.

## Erros e casos de borda

- Usuário fecha o Checkout sem pagar → nenhum webhook chega →
  `subscription_status` continua `null` → gate manda de volta para
  `/assinar` na próxima navegação. Sem estado inconsistente.
- Cartão recusado na renovação → Stripe manda `customer.subscription.updated`
  com `past_due`/`unpaid` → perde acesso automaticamente pelo gate.
- `/api/stripe/checkout` chamado sem sessão → 401.
- `/api/stripe/webhook` com assinatura inválida → 400.
- Conta antiga (`is_legacy_free = true`) nunca vê `/assinar`.

## Testes

- Fluxo local completo: cadastro → `/assinar` → Checkout (cartão de teste) →
  webhook via `stripe listen` → acesso liberado no dashboard.
- Cancelamento via Customer Portal → confirma que o gate bloqueia de novo
  após `customer.subscription.deleted`.
- Conta com `is_legacy_free = true` não vê `/assinar` em nenhum momento.
- `npm run lint`, `npx tsc --noEmit` e `npm run build`.

## Fora de escopo (por enquanto)

- Múltiplos planos/tiers, cobrança anual, período de trial.
- Tela de billing customizada (usa o Customer Portal hospedado).
- Pix/boleto (Checkout Session pode habilitar depois, sem mudar a arquitetura).
