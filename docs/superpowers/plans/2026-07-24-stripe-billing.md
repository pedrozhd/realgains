# Assinatura via Stripe — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cobrar assinatura mensal recorrente (R$ 19,90/mês, plano único) via Stripe Checkout de quem se cadastrar no TapGym a partir de agora, mantendo as contas do beta atual isentas para sempre.

**Architecture:** Stripe Checkout (hospedado) + webhook + Customer Portal (hospedado). Cadastro novo → `/assinar` → Checkout Session → webhook grava o estado da assinatura em `profiles` → o middleware existente (`src/lib/supabase/middleware.ts`) passa a gatear as rotas do app também pela assinatura, não só pela sessão.

**Tech Stack:** Next.js 16 App Router, `stripe` (Node SDK oficial), Supabase (`@supabase/ssr` + `@supabase/supabase-js`), TypeScript.

## Global Constraints

- Spec completa: `docs/superpowers/specs/2026-07-24-stripe-billing-design.md`.
- Plano único, mensal, R$ 19,90 — sem tiers, sem anual, sem trial (fora de escopo).
- Contas que já existem antes da migração 0008 ficam com `is_legacy_free = true` e nunca são cobradas.
- Vínculo usuário ↔ pagamento é por `client_reference_id` (o `id` do usuário no Supabase), nunca por e-mail.
- As chaves `STRIPE_SECRET_KEY`/`STRIPE_PUBLISHABLE_KEY` já configuradas na Vercel são **live mode**. Nenhum comando deste plano deve rodar contra a conta live sem confirmação explícita do usuário no momento — todo o desenvolvimento e teste usa chaves de **test mode** (Task 11).
- **Este projeto não tem framework de testes automatizados** (sem `jest`/`vitest`, sem script `test` no `package.json`). Os passos de verificação usam `npx tsc --noEmit`, `npm run lint`, `npm run build` e teste manual (curl / navegador / Stripe CLI) — não pytest/jest. Siga esse padrão em vez de escrever testes unitários novos.
- Todo texto voltado ao usuário é em português (pt-BR), seguindo o resto do app.
- Commits frequentes, um por task, seguindo o estilo dos commits existentes (mensagem curta em português, sem emoji).

---

### Task 1: Instalar o SDK da Stripe e extrair o admin client compartilhado

**Files:**
- Modify: `package.json`, `package-lock.json` (via `npm install`)
- Create: `src/lib/supabase/admin.ts`
- Modify: `src/app/api/hoje/route.ts`
- Modify: `src/app/api/registrar/route.ts`

**Interfaces:**
- Produces: `createAdminClient(): SupabaseClient` exportado de `src/lib/supabase/admin.ts` — cliente Supabase com a service-role key (ignora RLS). Tasks 5 (webhook) e 4/6 (se precisarem) consomem essa função.

Hoje `src/app/api/hoje/route.ts` e `src/app/api/registrar/route.ts` têm cada um sua própria cópia idêntica de `createAdminClient()`. A Task 5 (webhook) precisa da mesma função — em vez de criar uma terceira cópia, extrai pra um módulo compartilhado agora.

- [ ] **Step 1: Instalar o pacote `stripe`**

Run: `npm install stripe`
Expected: `package.json` ganha `"stripe": "^<versão>"` em `dependencies`; `package-lock.json` atualizado.

- [ ] **Step 2: Criar o admin client compartilhado**

`src/lib/supabase/admin.ts`:
```ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
```

- [ ] **Step 3: Usar o helper em `src/app/api/hoje/route.ts`**

Remova a função local `createAdminClient` (linhas 6-8 hoje) e adicione o import:
```ts
import { createAdminClient } from "@/lib/supabase/admin";
```
(logo abaixo do import de `@supabase/supabase-js` — que também deixa de ser necessário nesse arquivo e pode ser removido).

- [ ] **Step 4: Usar o helper em `src/app/api/registrar/route.ts`**

Mesma mudança: remove a função local `createAdminClient` (linhas 5-7 hoje), importa de `@/lib/supabase/admin`, remove o import agora não usado de `@supabase/supabase-js`.

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `npm run build`
Expected: build passa, `/api/hoje` e `/api/registrar` continuam aparecendo como rotas dinâmicas (`ƒ`).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/supabase/admin.ts src/app/api/hoje/route.ts src/app/api/registrar/route.ts
git commit -m "Instala SDK da Stripe e extrai admin client Supabase compartilhado"
```

---

### Task 2: Migração do banco — colunas de billing em `profiles`

**Files:**
- Create: `supabase/migrations/0008_stripe_billing.sql`
- Modify: `supabase/schema.sql`

**Interfaces:**
- Produces: colunas `profiles.stripe_customer_id` (text, nullable), `profiles.stripe_subscription_id` (text, nullable), `profiles.subscription_status` (text, nullable), `profiles.is_legacy_free` (boolean, not null, default false). Consumidas pelas Tasks 4, 5, 6, 8.

- [ ] **Step 1: Escrever a migração**

`supabase/migrations/0008_stripe_billing.sql`:
```sql
-- Billing via Stripe: colunas de assinatura em profiles + grandfathering do beta.
alter table public.profiles
  add column stripe_customer_id text,
  add column stripe_subscription_id text,
  add column subscription_status text,
  add column is_legacy_free boolean not null default false;

-- Quem já tem conta na data desta migração fica isento de cobrança para sempre.
update public.profiles set is_legacy_free = true;
```

- [ ] **Step 2: Rodar a migração no Supabase**

Run: `supabase db push` (ou cole o conteúdo do arquivo no SQL Editor do dashboard do Supabase, se `supabase db push` não estiver configurado localmente neste projeto).
Expected: sem erro; `select is_legacy_free, subscription_status from public.profiles limit 5;` mostra `is_legacy_free = true` e `subscription_status = null` para as contas existentes.

- [ ] **Step 3: Atualizar `supabase/schema.sql`**

No bloco `-- profiles ---` de `supabase/schema.sql`, atualize a definição da tabela para incluir as colunas novas, refletindo o estado pós-migração (esse arquivo documenta o schema de um projeto novo/do zero):
```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  api_token text unique not null default encode(gen_random_bytes(24), 'hex'),
  nome text,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  is_legacy_free boolean not null default false
);
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0008_stripe_billing.sql supabase/schema.sql
git commit -m "Adiciona colunas de billing Stripe em profiles e isenta contas do beta"
```

---

### Task 3: Cliente lazy da Stripe

**Files:**
- Create: `src/lib/stripe.ts`

**Interfaces:**
- Produces: `getStripe(): Stripe` — instância única (lazy, criada só na primeira chamada). Consumida pelas Tasks 4, 5, 6.

- [ ] **Step 1: Escrever `src/lib/stripe.ts`**

```ts
import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/lib/stripe.ts
git commit -m "Adiciona cliente lazy da Stripe"
```

---

### Task 4: Rota de Checkout — `POST /api/stripe/checkout`

**Files:**
- Create: `src/app/api/stripe/checkout/route.ts`

**Interfaces:**
- Consumes: `getStripe()` (Task 3) · `createClient()` de `@/lib/supabase/server` (sessão do usuário logado, já existente no projeto) · env `STRIPE_PRICE_ID`.
- Produces: redirect 303 para a URL do Stripe Checkout. Consumida pelo `<form>` da Task 7.

- [ ] **Step 1: Escrever a rota**

`src/app/api/stripe/checkout/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const origin = new URL(request.url).origin;
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: user.id,
    ...(profile?.stripe_customer_id
      ? { customer: profile.stripe_customer_id }
      : { customer_email: user.email }),
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/dashboard`,
    cancel_url: `${origin}/assinar`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "não foi possível criar a sessão de checkout" }, { status: 500 });
  }

  return NextResponse.redirect(session.url, { status: 303 });
}
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit`
Expected: sem erros (o teste end-to-end real acontece na Task 12, depois que `STRIPE_PRICE_ID` existir).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/stripe/checkout/route.ts
git commit -m "Adiciona rota de criacao da Stripe Checkout Session"
```

---

### Task 5: Rota de Webhook — `POST /api/stripe/webhook`

**Files:**
- Create: `src/app/api/stripe/webhook/route.ts`

**Interfaces:**
- Consumes: `getStripe()` (Task 3) · `createAdminClient()` (Task 1) · env `STRIPE_WEBHOOK_SECRET`.
- Produces: atualiza `profiles.stripe_customer_id`, `profiles.stripe_subscription_id`, `profiles.subscription_status` (colunas da Task 2).

- [ ] **Step 1: Escrever a rota**

`src/app/api/stripe/webhook/route.ts`:
```ts
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "assinatura ausente" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.client_reference_id) {
      await admin
        .from("profiles")
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status: "active",
        })
        .eq("id", session.client_reference_id);
    }
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    await admin
      .from("profiles")
      .update({ subscription_status: subscription.status })
      .eq("stripe_subscription_id", subscription.id);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await admin
      .from("profiles")
      .update({ subscription_status: "canceled" })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit`
Expected: sem erros. O teste funcional real (assinatura válida, eventos de verdade) acontece na Task 12 via `stripe listen`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/stripe/webhook/route.ts
git commit -m "Adiciona rota de webhook da Stripe"
```

---

### Task 6: Rota do Customer Portal — `POST /api/stripe/portal`

**Files:**
- Create: `src/app/api/stripe/portal/route.ts`

**Interfaces:**
- Consumes: `getStripe()` (Task 3) · `createClient()` de `@/lib/supabase/server`.
- Produces: redirect 303 para o Customer Portal, ou para `/assinar` se o usuário não tiver `stripe_customer_id`. Consumida pelo `<form>` da Task 10.

- [ ] **Step 1: Escrever a rota**

`src/app/api/stripe/portal/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const origin = new URL(request.url).origin;

  if (!profile?.stripe_customer_id) {
    return NextResponse.redirect(`${origin}/assinar`, { status: 303 });
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/dashboard`,
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/stripe/portal/route.ts
git commit -m "Adiciona rota do Stripe Customer Portal"
```

---

### Task 7: Página `/assinar`

**Files:**
- Create: `src/app/assinar/page.tsx`

**Interfaces:**
- Consumes: `Button` de `@/components/ui/button` · rota `POST /api/stripe/checkout` (Task 4).
- Produces: página em `/assinar`, referenciada pelo redirect do middleware (Task 8) e do cadastro (Task 9).

Fica em `src/app/assinar/`, fora do grupo `(app)` (não precisa do `AppStoreProvider`/`BottomNav` — é uma página isolada, como `/login`).

- [ ] **Step 1: Escrever a página**

`src/app/assinar/page.tsx`:
```tsx
import { Button } from "@/components/ui/button";

export default function AssinarPage() {
  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col justify-center bg-background px-6 text-foreground">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">TapGym</h1>
        <p className="mt-2 text-muted-foreground">Assine para continuar sua progressão.</p>
      </div>

      <div className="shadow-soft-elevated rounded-2xl bg-card p-6 text-center">
        <p className="text-[13px] text-muted-foreground">Plano mensal</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight">R$ 19,90</p>
        <p className="text-[13px] text-muted-foreground">por mês</p>

        <form action="/api/stripe/checkout" method="POST" className="mt-6">
          <Button type="submit" className="h-12 w-full rounded-xl text-[15px] font-bold">
            Assinar
          </Button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar visualmente**

Run: `npm run dev`, abra `http://localhost:3000/assinar` no navegador.
Expected: página renderiza centralizada, com preço e botão "Assinar". (O clique só vai funcionar de ponta a ponta depois da Task 11, quando `STRIPE_PRICE_ID` existir.)

- [ ] **Step 3: Commit**

```bash
git add src/app/assinar/page.tsx
git commit -m "Adiciona pagina /assinar"
```

---

### Task 8: Gate de acesso no middleware

**Files:**
- Modify: `src/lib/supabase/middleware.ts`

**Interfaces:**
- Consumes: colunas `profiles.is_legacy_free`, `profiles.subscription_status` (Task 2).

Adiciona, depois da checagem de auth já existente, a checagem de assinatura — mesmo arquivo, mesmo `supabase` client já criado nesta função.

- [ ] **Step 1: Editar `src/lib/supabase/middleware.ts`**

Substitua o conteúdo do arquivo por:
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refreshes the Supabase session cookie on every request and gates the app routes behind auth e assinatura. */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/login");
  const isLandingPage = pathname === "/";
  const isAssinarRoute = pathname === "/assinar";

  // `getUser()` acima pode ter renovado o cookie de sessão (via `setAll`),
  // o que só foi gravado em `supabaseResponse`. Redirecionar retornando uma
  // `NextResponse.redirect` nova, sem copiar esses cookies, descarta a
  // renovação — o navegador guarda o cookie antigo/expirado e o usuário pode
  // cair deslogado sem aviso na navegação seguinte.
  function redirectPreservingSession(pathname: string) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    const response = NextResponse.redirect(url);
    for (const cookie of supabaseResponse.cookies.getAll()) {
      response.cookies.set(cookie);
    }
    return response;
  }

  if (!user && !isAuthRoute && !isLandingPage) {
    return redirectPreservingSession("/login");
  }

  // Quem já tem conta não precisa ver a LP/waitlist ou a tela de login de
  // novo — manda direto pra Dashboard.
  if (user && (isAuthRoute || isLandingPage)) {
    return redirectPreservingSession("/dashboard");
  }

  if (user && !isAuthRoute && !isLandingPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_legacy_free, subscription_status")
      .eq("id", user.id)
      .maybeSingle();

    const temAcesso = profile?.is_legacy_free || profile?.subscription_status === "active";

    if (!temAcesso && !isAssinarRoute) {
      return redirectPreservingSession("/assinar");
    }

    if (temAcesso && isAssinarRoute) {
      return redirectPreservingSession("/dashboard");
    }
  }

  return supabaseResponse;
}
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `npm run build`
Expected: build passa.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/middleware.ts
git commit -m "Adiciona gate de assinatura no middleware"
```

---

### Task 9: Redirecionar cadastro novo para `/assinar`

**Files:**
- Modify: `src/app/login/page.tsx:58-62`

**Interfaces:**
- Consumes: rota `/assinar` (Task 7).

- [ ] **Step 1: Editar o redirect pós-cadastro**

Em `src/app/login/page.tsx`, dentro de `onSubmit`, no branch de cadastro (`modo === "criar"`), troque:
```ts
    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }
```
por:
```ts
    if (data.session) {
      router.replace("/assinar");
      router.refresh();
      return;
    }
```
(O branch de login/`entrar`, algumas linhas acima, continua indo para `/dashboard` — o middleware já redireciona pra `/assinar` sozinho se essa conta não tiver acesso.)

- [ ] **Step 2: Testar manualmente**

Run: `npm run dev`, cadastre uma conta nova de teste em `http://localhost:3000/login`.
Expected: depois de "Criar conta", cai em `/assinar` (não em `/dashboard`).

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "Redireciona cadastro novo para /assinar"
```

---

### Task 10: Botão "Gerenciar assinatura" no AccountSheet

**Files:**
- Modify: `src/components/layout/account-sheet.tsx:101-105`

**Interfaces:**
- Consumes: rota `POST /api/stripe/portal` (Task 6).

- [ ] **Step 1: Editar o `SheetFooter`**

Em `src/components/layout/account-sheet.tsx`, troque:
```tsx
        <SheetFooter>
          <Button variant="outline" onClick={onSignOut} className="h-11 rounded-xl">
            Sair
          </Button>
        </SheetFooter>
```
por:
```tsx
        <SheetFooter>
          <form action="/api/stripe/portal" method="POST">
            <Button type="submit" variant="outline" className="h-11 w-full rounded-xl">
              Gerenciar assinatura
            </Button>
          </form>
          <Button variant="outline" onClick={onSignOut} className="h-11 rounded-xl">
            Sair
          </Button>
        </SheetFooter>
```

Nota: quem é `is_legacy_free` (sem `stripe_customer_id`) clica e cai em `/assinar` (a rota do Task 6 redireciona pra lá quando não há customer), que por sua vez redireciona de volta pro `/dashboard` já que essa conta tem acesso — um "ricochete" inofensivo, não vale a complexidade extra de esconder o botão condicionalmente pra esse caso específico agora (YAGNI).

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/account-sheet.tsx
git commit -m "Adiciona botao Gerenciar assinatura no AccountSheet"
```

---

### Task 11: Configurar Stripe em test mode (Price + webhook local)

**Files:**
- Modify: `.env.local` (variáveis locais, não commitadas)

Esta task não mexe em código — prepara o ambiente pra rodar o teste end-to-end da Task 12, sem tocar nas chaves live já configuradas na Vercel.

- [ ] **Step 1: Instalar a Stripe CLI**

Run: `winget install stripe.stripe-cli`
Expected: `stripe.exe` instalado e disponível no PATH (abra um novo terminal se o `PATH` não atualizar na sessão atual).

- [ ] **Step 2: Login na CLI (abre o navegador)**

Sugira ao usuário rodar (fora do agente, ou via `!`):
```
stripe login
```
Expected: confirma no navegador, CLI mostra "Done! The Stripe CLI is configured...".

- [ ] **Step 3: Criar o Product/Price de teste**

Run: `stripe products create --name="TapGym Mensal" --description="Assinatura mensal do TapGym"`
Anote o `id` retornado (`prod_...`).

Run: `stripe prices create --product=<prod_...> --unit-amount=1990 --currency=brl --recurring[interval]=month`
Anote o `id` retornado (`price_...`) — esse é o `STRIPE_PRICE_ID` de teste.

- [ ] **Step 4: Pegar as chaves de teste**

No dashboard da Stripe, com o toggle "Test mode" ativado, em Developers → API keys, copie `pk_test_...` e `sk_test_...`.

- [ ] **Step 5: Rodar o listener de webhook local**

Run (em um terminal separado, mantenha rodando durante a Task 12):
```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Expected: imprime `Ready! Your webhook signing secret is whsec_...` — esse é o `STRIPE_WEBHOOK_SECRET` de teste.

- [ ] **Step 6: Atualizar `.env.local`**

Adicione (ou substitua, se `STRIPE_SECRET_KEY`/`STRIPE_PUBLISHABLE_KEY` já existirem como live):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
Não commitar — `.env.local` já está no `.gitignore`.

Nenhum commit nesta task (só configuração local).

---

### Task 12: Teste end-to-end manual + verificação final

**Files:** nenhum (só verificação)

- [ ] **Step 1: Subir o app localmente**

Run: `npm run dev` (com o `stripe listen` da Task 11 rodando em outro terminal).

- [ ] **Step 2: Cadastro → checkout**

No navegador, cadastre uma conta nova em `/login`. Confirme que cai em `/assinar`. Clique "Assinar", confirme que é redirecionado pro Stripe Checkout hospedado.

- [ ] **Step 3: Pagar com cartão de teste**

Preencha o Checkout com o cartão `4242 4242 4242 4242`, validade/CVC/CEP quaisquer. Confirme.
Expected: redireciona pra `/dashboard`. No terminal do `stripe listen`, aparece o evento `checkout.session.completed` encaminhado com sucesso (200).

- [ ] **Step 4: Confirmar o estado no banco**

No SQL Editor do Supabase: `select stripe_customer_id, stripe_subscription_id, subscription_status from public.profiles where id = '<id da conta de teste>';`
Expected: `subscription_status = 'active'`, `stripe_customer_id` e `stripe_subscription_id` preenchidos.

- [ ] **Step 5: Testar o Customer Portal e o cancelamento**

No app, abra a conta (avatar) → "Gerenciar assinatura". Confirme que abre o Customer Portal da Stripe. Cancele a assinatura por lá.
Expected: evento `customer.subscription.deleted` aparece no `stripe listen`; `subscription_status` volta pra `'canceled'` no banco; próxima navegação no app redireciona de volta pra `/assinar`.

- [ ] **Step 6: Confirmar que contas legacy não são afetadas**

Entre com uma conta que já existia antes da migração 0008.
Expected: nunca vê `/assinar`, acessa `/dashboard` normalmente.

- [ ] **Step 7: Verificação final**

Run: `npm run lint`
Expected: sem erros.

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `npm run build`
Expected: build passa, `/api/stripe/checkout`, `/api/stripe/webhook`, `/api/stripe/portal` e `/assinar` aparecem na lista de rotas.

Nenhum commit nesta task (só verificação).

---

### Task 13 (gated — só com confirmação explícita do usuário): corte para produção

**Files:** nenhum (configuração na Stripe e na Vercel)

**Não execute esta task automaticamente.** As chaves em produção são live — confirme com o usuário antes de cada comando abaixo.

- [ ] **Step 1: Criar o Product/Price live**

A Stripe CLI roda em test mode por padrão — modo live exige a flag `--live` explícita em cada comando. Confirme o valor (R$ 19,90/mês) com o usuário antes de rodar:

Run: `stripe products create --live --name="TapGym Mensal" --description="Assinatura mensal do TapGym"`
Run: `stripe prices create --live --product=<prod_...> --unit-amount=1990 --currency=brl --recurring[interval]=month`

- [ ] **Step 2: Criar o webhook endpoint live**

No dashboard da Stripe (live mode), Developers → Webhooks → "Add endpoint": URL `https://www.tapgym.com.br/api/stripe/webhook`, eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Copie o signing secret (`whsec_...`).

- [ ] **Step 3: Configurar env vars na Vercel**

Run: `vercel env add STRIPE_PRICE_ID production` (cole o `price_...` live)
Run: `vercel env add STRIPE_WEBHOOK_SECRET production` (cole o `whsec_...` live)
Repita para `preview` se necessário.

**Não rode `vercel env pull` depois disso sem antes checar `--environment`** — nesta sessão, `vercel env pull` sem esse parâmetro já sobrescreveu `.env.local` duas vezes e apagou variáveis que só existiam num ambiente específico.

- [ ] **Step 4: Deploy e smoke test em produção**

Deploy normal (push pra `master` ou `vercel --prod`, conforme o fluxo já usado no projeto). Repita o teste da Task 12 (Steps 2-5) contra `https://www.tapgym.com.br`, com um cartão real de baixo valor ou pedindo pro usuário confirmar o primeiro pagamento de verdade.
