import type {
  Exercicio,
  Qualidade,
  Serie,
  Tendencia,
  Treino,
  TreinoExercicio,
  VolumeSemana,
} from "@/lib/types";

/**
 * Pure functions computing the Dashboard view model from the four core
 * tables. They take plain arrays so the same logic works whether the arrays
 * come from `mock-data.ts` or from Supabase queries later.
 */

export function formatCarga(carga: number): string {
  return (Math.round(carga * 10) / 10).toString().replace(".", ",");
}

export function getUltimaSerie(seriesDoExercicio: Serie[]): Serie | null {
  if (seriesDoExercicio.length === 0) return null;
  return [...seriesDoExercicio].sort((a, b) => b.data.localeCompare(a.data))[0];
}

/**
 * "subiu" needs an increase vs the previous session. Absent that, we only
 * call it "estagnado" once carga has failed to move for 3 sessions running —
 * otherwise a single flat session would look identical to a real plateau.
 */
export function getTendencia(seriesDoExercicio: Serie[]): Tendencia | null {
  const ordenadas = [...seriesDoExercicio].sort((a, b) => a.data.localeCompare(b.data));
  if (ordenadas.length < 2) return null;

  const ultima = ordenadas[ordenadas.length - 1];
  const anterior = ordenadas[ordenadas.length - 2];
  const progrediu =
    ultima.carga > anterior.carga || (ultima.carga === anterior.carga && ultima.reps > anterior.reps);
  if (progrediu) return "subiu";

  const ultimasTres = ordenadas.slice(-3);
  const plato = ultimasTres.length === 3 && ultimasTres.every((s) => s.carga <= anterior.carga);
  return plato ? "estagnado" : "manteve";
}

/** O treino de hoje é o que estiver agendado para o dia da semana atual — null se for descanso. */
export function getTreinoDeHoje(treinos: Treino[], data: Date = new Date()): Treino | null {
  const diaSemana = data.getDay();
  return treinos.find((t) => t.dias_semana.includes(diaSemana)) ?? null;
}

function inicioDaSemana(iso: string): string {
  const d = new Date(iso);
  const dia = (d.getDay() + 6) % 7; // segunda-feira como início da semana
  d.setDate(d.getDate() - dia);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function getVolumeSemanal(series: Serie[], semanas = 8): VolumeSemana[] {
  const porSemana = new Map<string, number>();
  for (const s of series) {
    const chave = inicioDaSemana(s.data);
    porSemana.set(chave, (porSemana.get(chave) ?? 0) + s.carga * s.reps);
  }
  return [...porSemana.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-semanas)
    .map(([semana, volume]) => ({ semana, volume: Math.round(volume) }));
}

/** Só sugere progressão de carga se as repetições alcançaram o topo da faixa com boa qualidade. */
export function shouldSugerirProgressao(reps: number, repMax: number, qualidade: Qualidade | null): boolean {
  return reps >= repMax && qualidade === "boa";
}

export function shouldAlertarProximoDoLimite(reps: number, repMax: number): boolean {
  return reps === repMax - 1;
}

export interface ResumoExercicio {
  nome: string;
  ultimaSerieLabel: string;
  tendencia: Tendencia | null;
}

export function getResumoExercicio(nome: string, seriesDoExercicio: Serie[]): ResumoExercicio {
  const ultima = getUltimaSerie(seriesDoExercicio);
  return {
    nome,
    ultimaSerieLabel: ultima ? `${formatCarga(ultima.carga)} kg × ${ultima.reps}` : "Sem registros",
    tendencia: getTendencia(seriesDoExercicio),
  };
}

export interface DashboardExercicioVM extends ResumoExercicio {
  treinoExercicioId: string;
  exercicioId: string;
}

export interface DashboardVM {
  treino: { id: string; nome: string; totalExercicios: number } | null;
  exercicios: DashboardExercicioVM[];
  volumeSemanal: VolumeSemana[];
}

export function getDashboardData(
  treinos: Treino[],
  treinoExercicios: TreinoExercicio[],
  exercicios: Exercicio[],
  series: Serie[],
): DashboardVM {
  const treinoDeHoje = getTreinoDeHoje(treinos);
  if (!treinoDeHoje) {
    return { treino: null, exercicios: [], volumeSemanal: getVolumeSemanal(series) };
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
  };
}
