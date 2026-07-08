import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SoftCard } from "@/components/ui/soft-card";
import { TypographyEyebrow, TypographyH1, TypographyMuted } from "@/components/ui/typography";

interface Props {
  treino: { nome: string; totalExercicios: number };
}

export function TreinoDeHojeCard({ treino }: Props) {
  const exerciciosLabel = `${treino.totalExercicios} ${
    treino.totalExercicios === 1 ? "exercício" : "exercícios"
  }`;

  return (
    <SoftCard className="flex flex-col gap-3.5 p-4">
      <div>
        <TypographyEyebrow className="text-primary">TREINO DE HOJE</TypographyEyebrow>
        <TypographyH1 className="mt-1">{treino.nome}</TypographyH1>
        <TypographyMuted className="mt-0.5">{exerciciosLabel}</TypographyMuted>
      </div>
      <Button
        render={<Link href="/registro" />}
        nativeButton={false}
        className="shadow-soft-elevated h-[52px] w-full rounded-xl text-[15px] font-bold"
      >
        Iniciar registro
      </Button>
    </SoftCard>
  );
}
