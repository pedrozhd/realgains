import { ExercicioRow } from "@/components/dashboard/exercicio-row";
import type { DashboardExercicioVM } from "@/lib/dashboard";

interface Props {
  exercicios: DashboardExercicioVM[];
}

export function ExercicioGrid({ exercicios }: Props) {
  return (
    <section className="flex flex-col gap-2.5">
      <p className="text-[11px] font-bold tracking-widest text-muted-foreground">EXERCÍCIOS DE HOJE</p>
      <div className="flex flex-col gap-2.5">
        {exercicios.map((ex) => (
          <ExercicioRow
            key={ex.treinoExercicioId}
            exercicioId={ex.exercicioId}
            nome={ex.nome}
            ultimaSerieLabel={ex.ultimaSerieLabel}
            tendencia={ex.tendencia}
          />
        ))}
      </div>
    </section>
  );
}
