"use client";

import { useRouter } from "next/navigation";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { TypographyEyebrow, TypographyH1, TypographyMuted } from "@/components/ui/typography";

interface Props {
  treino: { nome: string; totalExercicios: number };
}

export function TreinoDeHojeCard({ treino }: Props) {
  const router = useRouter();
  const exerciciosLabel = `${treino.totalExercicios} ${
    treino.totalExercicios === 1 ? "exercício" : "exercícios"
  }`;

  return (
    <section className="flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-4">
      <div>
        <TypographyEyebrow>TREINO DE HOJE</TypographyEyebrow>
        <TypographyH1 className="mt-1">{treino.nome}</TypographyH1>
        <TypographyMuted className="mt-0.5">{exerciciosLabel}</TypographyMuted>
      </div>
      <ShimmerButton
        onClick={() => router.push("/registro")}
        background="var(--foreground)"
        shimmerColor="var(--success)"
        borderRadius="0.75rem"
        className="h-[52px] w-full border-none px-6 py-0 text-[15px] font-bold text-primary-foreground"
      >
        Iniciar registro
      </ShimmerButton>
    </section>
  );
}
