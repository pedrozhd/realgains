import Link from "next/link";
import { ChevronRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { DashboardExercicioVM } from "@/lib/dashboard";
import type { Tendencia } from "@/lib/types";

const TENDENCIA_ICON: Record<Tendencia, typeof TrendingUp> = {
  subiu: TrendingUp,
  manteve: Minus,
  estagnado: TrendingDown,
};

const TENDENCIA_COLOR: Record<Tendencia, string> = {
  subiu: "text-success",
  manteve: "text-muted-foreground",
  estagnado: "text-destructive",
};

interface Props {
  exercicios: DashboardExercicioVM[];
}

export function ExercicioGrid({ exercicios }: Props) {
  return (
    <section className="flex flex-col gap-2.5">
      <p className="text-[11px] font-bold tracking-widest text-muted-foreground">EXERCÍCIOS DE HOJE</p>
      <div className="flex flex-col gap-2.5">
        {exercicios.map((ex) => {
          const Icon = ex.tendencia ? TENDENCIA_ICON[ex.tendencia] : null;
          return (
            <Link
              key={ex.treinoExercicioId}
              href={`/exercicio/${ex.exercicioId}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 active:opacity-80"
            >
              <div>
                <p className="text-[15px] font-bold">{ex.nome}</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">{ex.ultimaSerieLabel}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {Icon && <Icon size={16} className={ex.tendencia ? TENDENCIA_COLOR[ex.tendencia] : ""} />}
                <ChevronRight size={18} className="text-muted-foreground/60" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
