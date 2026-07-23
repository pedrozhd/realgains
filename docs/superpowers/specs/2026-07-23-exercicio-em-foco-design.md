# Exercício em foco (dashboard) — Design

Data: 2026-07-23
Status: aprovado (design), aguardando revisão da spec

## Objetivo

Substituir, quando há um treino agendado para hoje, o card "Maior Evolução"
do dashboard por um card de **exercício em foco**: mostra o exercício atual
do treino de hoje (o primeiro, na ordem do treino, que ainda não bateu sua
meta de séries), com um **gráfico de barras** do histórico de sessões
(inspirado no mockup 3D da landing page). Quando o usuário registra séries
suficientes para bater a meta (`num_series`) daquele exercício **hoje**, o
foco avança automaticamente para o próximo exercício pendente do treino.

Motivação: o mockup ilustrativo do palco 3D da LP (tela do iPhone) mostra
esse conceito (exercício destacado + gráfico de barras), mas ele não existe
de verdade no app hoje — só o card "Maior Evolução" (texto puro, sem
gráfico, baseado em evolução histórica, não no treino do dia).

## Decisões (fechadas no brainstorming)

1. **Escopo:** feature real no dashboard do app (não é só um ajuste visual
   na LP).
2. **Dado do gráfico:** histórico de sessões (tendência) — cada barra é a
   melhor carga de uma sessão passada do exercício, última barra destacada.
   Não é "séries de hoje" (isso é só um contador textual, não o gráfico).
3. **Posição:** substitui o `ExercicioMaisEvoluidoCard` na mesma posição do
   dashboard, só quando há treino hoje.
4. **Casos de borda:**
   - Sem treino hoje (descanso) → mantém o `ExercicioMaisEvoluidoCard` atual
     (histórico geral, sem depender do treino do dia).
   - Treino hoje, mas todos os exercícios já bateram a meta de séries hoje →
     mensagem de "treino concluído".
   - Treino hoje, com pelo menos um exercício pendente → novo card, focado
     no primeiro exercício (por `ordem`) que ainda não bateu `num_series`
     séries registradas **hoje**.

## Modelo de dados (`src/lib/dashboard.ts`)

Novo tipo:

```ts
export interface ExercicioEmFoco {
  exercicioId: string;
  nome: string;
  cargaAtual: number | null; // última carga conhecida (hoje ou histórico)
  seriesHoje: number; // quantas séries já foram registradas hoje
  numSeries: number; // meta configurada no treino (TreinoExercicio.num_series)
  historico: { data: string; carga: number }[]; // até 8 sessões mais recentes, mais antiga primeiro
}
```

`DashboardVM` ganha o campo `exercicioEmFoco: ExercicioEmFoco | null`.

### Regra de seleção

Dado `treinoDeHoje` (já calculado hoje via `getTreinoDeHoje`) e
`exerciciosDoTreino` (já ordenados por `ordem`):

1. Para cada exercício do treino de hoje, contar quantas `Serie` desse
   `exercicio_id` têm `data` cuja data local (fuso do app, mesma função
   `getDataLocalISO`/`APP_TIMEZONE` já usada em `getTreinoDeHoje`) é igual a
   hoje. Esse é `seriesHoje`.
2. O **primeiro** exercício (na ordem do treino) com `seriesHoje < num_series`
   é o exercício em foco.
3. Se nenhum exercício atender esse critério (todos bateram a meta),
   `exercicioEmFoco` é `null` — mas `dashboard.treino` continua preenchido,
   o que já distingue esse caso ("treino concluído") de "sem treino hoje"
   (onde `treino` é `null`). Não é necessária nenhuma flag extra.
4. Quando há um exercício em foco:
   - `cargaAtual`: reaproveita `getUltimaSerie` sobre as séries desse
     exercício (última série conhecida, hoje ou histórica).
   - `historico`: reaproveita `melhorSeriePorSessao` (já existe, usada por
     `getTendencia`/`getExercicioMaisEvoluido`) sobre as séries desse
     exercício, pega as últimas 8 sessões, mapeia para
     `{ data: sessao.data, carga: sessao.carga }`.

`getDashboardData` passa a aceitar opcionalmente `data: Date = new Date()`
(mesmo padrão de `getTreinoDeHoje`), para permitir computar "hoje" de forma
determinística se algum dia houver testes.

## Componentes novos

### `src/components/ui/bar-trend.tsx` (`BarTrend`)

Gráfico de barras pequeno, irmão do `Sparkline` existente (mesma convenção
de props: `data: {label?, value}[]`, `height`, `glow?`, `className`), mas
como um componente **separado** — a animação de entrada de barras (crescer
de baixo pra cima, staggered por barra) é suficientemente diferente da
animação de linha (reveal via clip-path da esquerda pra direita) pra não
valer a pena sobrecarregar o `Sparkline` com um "modo barras". Renderiza até
8 `<rect>`, a última (mais recente) em `fill-primary`, as demais num tom
neutro (mesmo espírito de `rgba(237,237,237,0.18)` do mockup, mas usando o
token `text-muted-foreground`/opacidade equivalente do design system).

Se `data.length === 0`, o componente não renderiza nada (o card que o usa
decide se esconde a área do gráfico).

### `src/components/dashboard/exercicio-em-foco-card.tsx` (`ExercicioEmFocoCard`)

Recebe `dados: ExercicioEmFoco`. Estrutura:
- Eyebrow "EM FOCO".
- Nome do exercício + carga atual em destaque (via `formatCarga`).
- Texto leve "`seriesHoje` de `numSeries` séries hoje" (sem widget novo).
- `BarTrend` com `dados.historico` (omitido se `historico.length === 0`).
- Card inteiro envolto num `Link` para `/exercicio/${dados.exercicioId}`,
  igual ao `ExercicioMaisEvoluidoCard` que ele substitui.

## Integração em `src/app/(app)/dashboard/page.tsx`

A linha atual:

```tsx
<ExercicioMaisEvoluidoCard dados={dashboard.exercicioMaisEvoluido} />
```

vira uma decisão de 3 estados:

```tsx
{dashboard.treino ? (
  dashboard.exercicioEmFoco ? (
    <ExercicioEmFocoCard dados={dashboard.exercicioEmFoco} />
  ) : (
    <SoftCard className="flex flex-col items-center gap-1.5 p-6 text-center">
      <TypographyH4>Treino de hoje concluído 💪</TypographyH4>
      <TypographyMuted>Você bateu todas as séries de hoje. Bom trabalho.</TypographyMuted>
    </SoftCard>
  )
) : (
  <ExercicioMaisEvoluidoCard dados={dashboard.exercicioMaisEvoluido} />
)}
```

(Estilo do card "concluído" espelha o card existente de "dia de descanso" já
presente na mesma página.)

## Verificação

O projeto **não tem runner de teste configurado** (`package.json` só tem
`dev`/`build`/`start`/`lint`) — nenhuma função pura existente em
`dashboard.ts` tem cobertura automatizada hoje. Seguindo o padrão já
estabelecido, não será introduzido um framework de testes novo só para esta
feature (seria escopo adicional não pedido).

Critérios de aceite:
- `npx tsc --noEmit`, `npm run lint` e `npm run build` passam.
- Revisão de código cuidadosa da lógica de seleção/contagem (data local,
  ordem, limite de 8 sessões).
- Confirmação visual manual: como o dashboard real depende de dados
  autenticados no Supabase (não há mock-data.ts em uso — está órfão no
  código), a validação visual final é feita pelo usuário rodando o app
  logado, não pelo agente.

## Fora de escopo

- Alterar o mockup estático da LP (já decidido: só a feature real).
- Qualquer lógica de progressão de carga (`shouldSugerirProgressao`) —
  inalterada.
- Introduzir framework de testes automatizados.
- Tornar `mock-data.ts` utilizável novamente (permanece órfão).
