# Exercício em foco (dashboard) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o card "Maior Evolução" do dashboard, quando há treino agendado para hoje, por um card de "exercício em foco" com gráfico de barras do histórico de sessões, que avança automaticamente pro próximo exercício pendente quando o usuário bate a meta de séries de hoje.

**Architecture:** Lógica pura nova em `src/lib/dashboard.ts` (seleção do exercício em foco + histórico de sessões, reaproveitando funções já existentes). Dois componentes novos: `BarTrend` (gráfico de barras genérico, irmão do `Sparkline` existente) e `ExercicioEmFocoCard` (card do dashboard, consome `BarTrend`). `src/app/(app)/dashboard/page.tsx` passa a decidir entre 3 estados (sem treino hoje / exercício pendente / treino concluído).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 (tokens `--primary`/`--muted-foreground` etc. já definidos em `globals.css`), sem framework de testes automatizado no projeto.

## Global Constraints

- Sem runner de teste no projeto (`package.json` só tem `dev`/`build`/`start`/`lint`) — não introduzir um framework de testes novo. Verificação via `tsc`/`lint`/`build` + revisão de código.
- "Hoje", em qualquer lugar que precise saber a data civil atual, usa sempre `getDataLocalISO(data, APP_TIMEZONE)` de `@/lib/timezone` — nunca `Date.toISOString().slice(0,10)` nem getters locais do `Date` (o runtime da Vercel roda em UTC).
- Regra de seleção do exercício em foco: dado o treino de hoje, percorrer `exerciciosDoTreino` **na ordem** (`ordem` crescente) e escolher o **primeiro** cujo número de séries registradas **hoje** seja menor que `num_series`. Se nenhum atender, o exercício em foco é `null` (mas `dashboard.treino` continua preenchido — isso já distingue "treino concluído" de "sem treino hoje", sem precisar de campo extra).
- Histórico do gráfico: até **8** sessões mais recentes (constante nomeada, não mágica), mais antiga primeiro, cada uma reduzida à melhor série do dia (reaproveitar `melhorSeriePorSessao`, já existe em `dashboard.ts`).
- Todo texto de UI e comentários em pt-BR, seguindo o padrão do arquivo.
- Commits frequentes, um por task.

---

### Task 1: Lógica de seleção do exercício em foco (`src/lib/dashboard.ts`)

**Files:**
- Modify: `src/lib/dashboard.ts`

**Interfaces:**
- Consumes: `melhorSeriePorSessao` (função privada já existente no arquivo, linha ~33), `getUltimaSerie` (linha 22), `getTreinoDeHoje` (linha 74, já aceita `data: Date = new Date()`), tipos `Serie`/`TreinoExercicio`/`Exercicio` de `@/lib/types`.
- Produces: `export interface ExercicioEmFoco { exercicioId: string; nome: string; cargaAtual: number | null; seriesHoje: number; numSeries: number; historico: { data: string; carga: number }[] }`; `DashboardVM.exercicioEmFoco: ExercicioEmFoco | null`; `getDashboardData(treinos, treinoExercicios, exercicios, series, data?: Date): DashboardVM` (novo 5º parâmetro opcional).

- [ ] **Step 1: Ler o arquivo atual pra confirmar que nada mudou**

Run: `sed -n '1,220p' src/lib/dashboard.ts` (ou abrir no editor). Confirme que `getExercicioMaisEvoluido` termina com `return melhor;\n}` seguido de uma linha em branco e depois `export interface ResumoExercicio {` — se a estrutura tiver mudado, adapte os passos abaixo ao arquivo real em vez de aplicar cegamente.

- [ ] **Step 2: Inserir `contarSeriesNoDia` e `getExercicioEmFoco` logo após `getExercicioMaisEvoluido`**

Localize o fim da função `getExercicioMaisEvoluido` (fecha com `return melhor;\n}` — no arquivo original é a linha 147). Logo **depois** dessa linha (antes de `export interface ResumoExercicio {`), insira:

```ts

const HISTORICO_EM_FOCO_MAX_SESSOES = 8;

/** Quantas séries de `seriesDoExercicio` caem no dia civil `hojeISO` (fuso do app). */
function contarSeriesNoDia(seriesDoExercicio: Serie[], hojeISO: string): number {
  return seriesDoExercicio.filter((s) => getDataLocalISO(new Date(s.data), APP_TIMEZONE) === hojeISO).length;
}

export interface ExercicioEmFoco {
  exercicioId: string;
  nome: string;
  /** Última carga conhecida (de hoje, se já houver série registrada, senão histórica). */
  cargaAtual: number | null;
  seriesHoje: number;
  numSeries: number;
  /** Até 8 sessões mais recentes, mais antiga primeiro. */
  historico: { data: string; carga: number }[];
}

/**
 * O primeiro exercício do treino de hoje (na ordem configurada) que ainda não
 * bateu sua meta de séries hoje. `null` quando todos já bateram — quem chama
 * distingue esse caso de "sem treino hoje" pelo próprio `dashboard.treino`.
 */
function getExercicioEmFoco(
  exerciciosDoTreino: TreinoExercicio[],
  exercicios: Exercicio[],
  series: Serie[],
  hojeISO: string,
): ExercicioEmFoco | null {
  for (const te of exerciciosDoTreino) {
    const seriesDoExercicio = series.filter((s) => s.exercicio_id === te.exercicio_id);
    const seriesHoje = contarSeriesNoDia(seriesDoExercicio, hojeISO);
    if (seriesHoje >= te.num_series) continue;

    const exercicio = exercicios.find((e) => e.id === te.exercicio_id);
    const sessoes = melhorSeriePorSessao(seriesDoExercicio);
    return {
      exercicioId: te.exercicio_id,
      nome: exercicio?.nome ?? "Exercício",
      cargaAtual: getUltimaSerie(seriesDoExercicio)?.carga ?? null,
      seriesHoje,
      numSeries: te.num_series,
      historico: sessoes.slice(-HISTORICO_EM_FOCO_MAX_SESSOES).map((s) => ({ data: s.data, carga: s.carga })),
    };
  }
  return null;
}
```

- [ ] **Step 3: Adicionar o campo `exercicioEmFoco` em `DashboardVM`**

Na interface `DashboardVM` (no arquivo original, linhas 169-174):

```ts
export interface DashboardVM {
  treino: { id: string; nome: string; totalExercicios: number } | null;
  exercicios: DashboardExercicioVM[];
  volumeSemanal: VolumeSemana[];
  exercicioMaisEvoluido: ExercicioEvolucao | null;
}
```

adicione o campo `exercicioEmFoco`:

```ts
export interface DashboardVM {
  treino: { id: string; nome: string; totalExercicios: number } | null;
  exercicios: DashboardExercicioVM[];
  volumeSemanal: VolumeSemana[];
  exercicioMaisEvoluido: ExercicioEvolucao | null;
  exercicioEmFoco: ExercicioEmFoco | null;
}
```

- [ ] **Step 4: Atualizar `getDashboardData`**

Substitua a função inteira (no arquivo original, linhas 176-216):

```ts
export function getDashboardData(
  treinos: Treino[],
  treinoExercicios: TreinoExercicio[],
  exercicios: Exercicio[],
  series: Serie[],
): DashboardVM {
  const treinoDeHoje = getTreinoDeHoje(treinos);
  if (!treinoDeHoje) {
    return {
      treino: null,
      exercicios: [],
      volumeSemanal: getVolumeSemanal(series),
      exercicioMaisEvoluido: getExercicioMaisEvoluido(exercicios, series),
    };
  }

  const exerciciosDoTreino = treinoExercicios
    .filter((te) => te.treino_id === treinoDeHoje.id)
    .sort((a, b) => a.ordem - b.ordem);

  const exerciciosVM: DashboardExercicioVM[] = exerciciosDoTreino.map((te) => {
    const exercicio = exercicios.find((e) => e.id === te.exercicio_id);
    const seriesDoExercicio = series.filter((s) => s.exercicio_id === te.exercicio_id);
    return {
      treinoExercicioId: te.id,
      exercicioId: te.exercicio_id,
      ...getResumoExercicio(exercicio?.nome ?? "Exercício", seriesDoExercicio),
    };
  });

  return {
    treino: {
      id: treinoDeHoje.id,
      nome: treinoDeHoje.nome,
      totalExercicios: exerciciosVM.length,
    },
    exercicios: exerciciosVM,
    volumeSemanal: getVolumeSemanal(series),
    exercicioMaisEvoluido: getExercicioMaisEvoluido(exercicios, series),
  };
}
```

por:

```ts
export function getDashboardData(
  treinos: Treino[],
  treinoExercicios: TreinoExercicio[],
  exercicios: Exercicio[],
  series: Serie[],
  data: Date = new Date(),
): DashboardVM {
  const treinoDeHoje = getTreinoDeHoje(treinos, data);
  if (!treinoDeHoje) {
    return {
      treino: null,
      exercicios: [],
      volumeSemanal: getVolumeSemanal(series),
      exercicioMaisEvoluido: getExercicioMaisEvoluido(exercicios, series),
      exercicioEmFoco: null,
    };
  }

  const exerciciosDoTreino = treinoExercicios
    .filter((te) => te.treino_id === treinoDeHoje.id)
    .sort((a, b) => a.ordem - b.ordem);

  const exerciciosVM: DashboardExercicioVM[] = exerciciosDoTreino.map((te) => {
    const exercicio = exercicios.find((e) => e.id === te.exercicio_id);
    const seriesDoExercicio = series.filter((s) => s.exercicio_id === te.exercicio_id);
    return {
      treinoExercicioId: te.id,
      exercicioId: te.exercicio_id,
      ...getResumoExercicio(exercicio?.nome ?? "Exercício", seriesDoExercicio),
    };
  });

  const hojeISO = getDataLocalISO(data, APP_TIMEZONE);

  return {
    treino: {
      id: treinoDeHoje.id,
      nome: treinoDeHoje.nome,
      totalExercicios: exerciciosVM.length,
    },
    exercicios: exerciciosVM,
    volumeSemanal: getVolumeSemanal(series),
    exercicioMaisEvoluido: getExercicioMaisEvoluido(exercicios, series),
    exercicioEmFoco: getExercicioEmFoco(exerciciosDoTreino, exercicios, series, hojeISO),
  };
}
```

(`getDataLocalISO` e `APP_TIMEZONE` já estão importados no topo do arquivo — não precisa adicionar import novo.)

- [ ] **Step 5: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: PASS. (Nenhum outro arquivo deve quebrar nesta task — `getDashboardData` ganhou um parâmetro opcional, então chamadas existentes continuam válidas; o campo novo em `DashboardVM` só será consumido na Task 4.)

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/dashboard.ts
git commit -m "Adiciona logica de selecao do exercicio em foco no dashboard"
```

---

### Task 2: Componente `BarTrend` (`src/components/ui/bar-trend.tsx`)

**Files:**
- Create: `src/components/ui/bar-trend.tsx`

**Interfaces:**
- Consumes: `cn` de `@/lib/utils` (já usado por `sparkline.tsx`, mesma função).
- Produces: `export type BarTrendPoint = { label?: string; value: number }`; `export function BarTrend(props: { ariaLabel?: string; className?: string; data: readonly BarTrendPoint[]; glow?: boolean; height?: number; width?: number }): JSX.Element | null`.

- [ ] **Step 1: Criar `src/components/ui/bar-trend.tsx`**

```tsx
import { cn } from "@/lib/utils";

export type BarTrendPoint = {
  label?: string;
  value: number;
};

type BarTrendProps = {
  ariaLabel?: string;
  className?: string;
  data: readonly BarTrendPoint[];
  glow?: boolean;
  height?: number;
  width?: number;
};

const BAR_GAP = 4;
const MIN_BAR_HEIGHT = 3;

/**
 * Gráfico de barras pequeno, irmão do Sparkline (mesma convenção de props),
 * mas como componente separado: a entrada "cresce de baixo" das barras é
 * diferente o bastante da revelação em clip-path de uma linha pra não valer
 * a pena um "modo barras" dentro do Sparkline. A última barra (mais recente)
 * sai destacada em `fill-primary`; as demais em tom neutro.
 */
export function BarTrend({
  ariaLabel = "Gráfico de barras",
  className,
  data,
  glow = false,
  height = 64,
  width = 220,
}: BarTrendProps) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const barWidth = (width - BAR_GAP * (data.length - 1)) / data.length;

  return (
    <svg
      aria-label={ariaLabel}
      className={cn("block h-auto w-full overflow-visible", className)}
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const barHeight = Math.max(MIN_BAR_HEIGHT, ((d.value - min) / range) * height);
        const x = i * (barWidth + BAR_GAP);
        const y = height - barHeight;
        const rx = Math.min(barWidth / 3, 4);
        return (
          <g key={i}>
            {isLast && glow ? (
              <rect className="fill-primary opacity-40 blur-[4px]" height={barHeight} rx={rx} width={barWidth} x={x} y={y} />
            ) : null}
            <rect
              className={isLast ? "fill-primary" : "fill-muted-foreground/25"}
              height={barHeight}
              rx={rx}
              width={barWidth}
              x={x}
              y={y}
            />
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/bar-trend.tsx
git commit -m "Adiciona componente BarTrend (grafico de barras do historico)"
```

---

### Task 3: Card `ExercicioEmFocoCard` (`src/components/dashboard/exercicio-em-foco-card.tsx`)

**Files:**
- Create: `src/components/dashboard/exercicio-em-foco-card.tsx`

**Interfaces:**
- Consumes: `ExercicioEmFoco` (Task 1, `@/lib/dashboard`), `formatCarga` (`@/lib/dashboard`), `BarTrend`/`BarTrendPoint` (Task 2, `@/components/ui/bar-trend`), `SoftCard` (`@/components/ui/soft-card`), `TypographyEyebrow`/`TypographyMuted` (`@/components/ui/typography`).
- Produces: `export function ExercicioEmFocoCard({ dados }: { dados: ExercicioEmFoco }): JSX.Element`.

- [ ] **Step 1: Criar `src/components/dashboard/exercicio-em-foco-card.tsx`**

```tsx
import Link from "next/link";
import { BarTrend } from "@/components/ui/bar-trend";
import { SoftCard } from "@/components/ui/soft-card";
import { TypographyEyebrow, TypographyMuted } from "@/components/ui/typography";
import { formatCarga, type ExercicioEmFoco } from "@/lib/dashboard";

interface Props {
  dados: ExercicioEmFoco;
}

export function ExercicioEmFocoCard({ dados }: Props) {
  return (
    <Link href={`/exercicio/${dados.exercicioId}`} className="block active:opacity-80">
      <SoftCard className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <TypographyEyebrow>EM FOCO</TypographyEyebrow>
            <p className="mt-1 truncate text-lg font-bold leading-none">{dados.nome}</p>
          </div>
          {dados.cargaAtual !== null && (
            <p className="shrink-0 text-2xl leading-none font-bold tabular-nums">{formatCarga(dados.cargaAtual)} kg</p>
          )}
        </div>

        <TypographyMuted>
          {dados.seriesHoje} de {dados.numSeries} séries hoje
        </TypographyMuted>

        {dados.historico.length > 0 && (
          <BarTrend
            ariaLabel={`Histórico de carga de ${dados.nome}`}
            className="mt-1"
            data={dados.historico.map((h) => ({ value: h.carga }))}
            glow
            height={56}
          />
        )}
      </SoftCard>
    </Link>
  );
}
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/exercicio-em-foco-card.tsx
git commit -m "Adiciona o card ExercicioEmFocoCard"
```

---

### Task 4: Integração no dashboard (`src/app/(app)/dashboard/page.tsx`)

**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `ExercicioEmFocoCard` (Task 3), `DashboardVM.treino`/`DashboardVM.exercicioEmFoco` (Task 1), `ExercicioMaisEvoluidoCard`/`SoftCard`/`TypographyH4`/`TypographyMuted` (já importados no arquivo).

- [ ] **Step 1: Adicionar o import do novo card**

No topo do arquivo, junto aos outros imports de `@/components/dashboard/*` (perto de `import { ExercicioMaisEvoluidoCard } from "@/components/dashboard/exercicio-mais-evoluido-card";`), adicione:

```tsx
import { ExercicioEmFocoCard } from "@/components/dashboard/exercicio-em-foco-card";
```

- [ ] **Step 2: Trocar a renderização do card por uma decisão de 3 estados**

Localize, dentro do render (no arquivo original, dentro da IIFE que calcula `dashboard = getDashboardData(...)`), a linha:

```tsx
                <VolumeSemanalCard dados={dashboard.volumeSemanal} />
                <ExercicioMaisEvoluidoCard dados={dashboard.exercicioMaisEvoluido} />
```

Substitua por:

```tsx
                <VolumeSemanalCard dados={dashboard.volumeSemanal} />
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

(`SoftCard`, `TypographyH4`, `TypographyMuted` e `ExercicioMaisEvoluidoCard` já estão importados no arquivo — nenhum import adicional além do Step 1.)

- [ ] **Step 3: Verificar tipos, lint e build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: os três passam sem erros; a rota `/dashboard` continua listada na saída do build.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/dashboard/page.tsx"
git commit -m "Integra o card de exercicio em foco no dashboard"
```

---

### Task 5: Verificação final

**Files:**
- Nenhum arquivo novo — só checagem.

- [ ] **Step 1: Build completo**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: todos passam.

- [ ] **Step 2: Revisão manual do fluxo (documentar limitação)**

Como o dashboard real depende de dados autenticados no Supabase (o `mock-data.ts` está órfão, não conectado a nenhuma tela), a confirmação visual final dos 3 estados (exercício pendente / treino concluído / dia de descanso) só é possível logado com dados reais. Documentar no relatório desta task que essa checagem visual fica pendente para o usuário confirmar — não é possível fazer via `curl`/build.

- [ ] **Step 3: Commit (se houver algo pendente de tasks anteriores)**

Se todas as tasks anteriores já commitaram individualmente, esta task não deve ter mudanças de arquivo — apenas confirme `git status` limpo.

---

## Self-Review

**Cobertura da spec:**
- Tipo `ExercicioEmFoco` + campo em `DashboardVM` → Task 1. ✓
- Regra de seleção (primeiro pendente na ordem, séries de hoje via fuso do app) → Task 1. ✓
- Histórico até 8 sessões → Task 1 (`HISTORICO_EM_FOCO_MAX_SESSOES`). ✓
- Gráfico de barras (última destacada) → Task 2. ✓
- Card com nome/carga/contador/gráfico, linkado ao exercício → Task 3. ✓
- 3 estados no dashboard (descanso / pendente / concluído) → Task 4. ✓
- Sem introdução de framework de testes → nenhuma task adiciona um. ✓
- Verificação honesta sobre dependência de dados reais → Task 5. ✓

**Placeholder scan:** sem TBD/TODO; todo código é completo. ✓

**Consistência de tipos:** `ExercicioEmFoco` (Task 1) usado identicamente em `ExercicioEmFocoCard` (Task 3, via `@/lib/dashboard`) e em `page.tsx` (Task 4, via `dashboard.exercicioEmFoco`). `BarTrendPoint`/`BarTrend` (Task 2) consumidos corretamente em Task 3 (`data={dados.historico.map((h) => ({ value: h.carga }))}`). ✓

**Escopo:** uma única feature coesa, 4 tasks de implementação + 1 de verificação. ✓
