import { AppHeader } from "@/components/layout/app-header";
import { mockExercicios } from "@/lib/mock-data";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExercicioHistoricoPage({ params }: Props) {
  const { id } = await params;
  const exercicio = mockExercicios.find((e) => e.id === id);

  return (
    <>
      <AppHeader variant="back" title={exercicio?.nome ?? "Exercício"} backHref="/" />
      <main className="flex flex-1 items-center justify-center px-8 text-center text-[13px] text-muted-foreground">
        Em breve: gráfico de progressão e últimas séries.
      </main>
    </>
  );
}
