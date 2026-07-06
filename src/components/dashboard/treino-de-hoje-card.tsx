import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TypographyEyebrow, TypographyH1, TypographyMuted } from "@/components/ui/typography";

interface Props {
  treino: { nome: string; totalExercicios: number };
}

export function TreinoDeHojeCard({ treino }: Props) {
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
      <Button
        render={<Link href="/registro" />}
        nativeButton={false}
        className="h-[52px] w-full rounded-xl text-[15px] font-bold"
      >
        Iniciar registro
      </Button>
    </section>
  );
}
