export type Qualidade = "boa" | "razoavel" | "ruim";

export type Tendencia = "subiu" | "manteve" | "estagnado";

export interface Exercicio {
  id: string;
  user_id: string;
  nome: string;
  created_at: string;
}

export interface Treino {
  id: string;
  user_id: string;
  nome: string;
  ordem: number;
  /** Dias da semana em que este treino está agendado (0 = domingo ... 6 = sábado). */
  dias_semana: number[];
  created_at: string;
}

export interface TreinoExercicio {
  id: string;
  treino_id: string;
  exercicio_id: string;
  ordem: number;
  rep_min: number;
  rep_max: number;
  created_at: string;
}

export interface Serie {
  id: string;
  exercicio_id: string;
  carga: number;
  reps: number;
  qualidade: Qualidade;
  data: string;
}

/** treino_exercicios joined with its exercicio, as consumed by the UI. */
export interface TreinoExercicioComExercicio extends TreinoExercicio {
  exercicio: Exercicio;
}

/** treino joined with its ordered exercicios, as consumed by the UI. */
export interface TreinoComExercicios extends Treino {
  exercicios: TreinoExercicioComExercicio[];
}

export interface VolumeSemana {
  /** ISO date (Monday) marking the start of the week. */
  semana: string;
  volume: number;
}
