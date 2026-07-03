import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        <p className="text-[11px] font-bold tracking-widest text-muted-foreground">TREINO DE HOJE</p>
        <p className="mt-1 text-2xl font-extrabold tracking-tight">{treino.nome}</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{exerciciosLabel}</p>
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
