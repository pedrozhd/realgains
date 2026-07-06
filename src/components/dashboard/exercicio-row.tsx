import Link from "next/link";
import { ChevronRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { TypographyH4, TypographyMuted } from "@/components/ui/typography";
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

interface ExercicioRowProps {
  exercicioId: string;
  nome: string;
  ultimaSerieLabel: string;
  tendencia: Tendencia | null;
}

export function ExercicioRow({ exercicioId, nome, ultimaSerieLabel, tendencia }: ExercicioRowProps) {
  const Icon = tendencia ? TENDENCIA_ICON[tendencia] : null;
  return (
    <Link
      href={`/exercicio/${exercicioId}`}
      className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 active:opacity-80"
    >
      <div>
        <TypographyH4>{nome}</TypographyH4>
        <TypographyMuted className="mt-0.5">{ultimaSerieLabel}</TypographyMuted>
      </div>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={16} className={tendencia ? TENDENCIA_COLOR[tendencia] : ""} />}
        <ChevronRight size={18} className="text-muted-foreground/60" />
      </div>
    </Link>
  );
}
