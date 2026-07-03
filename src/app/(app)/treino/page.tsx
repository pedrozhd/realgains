"use client";

import { AppHeader } from "@/components/layout/app-header";
import { SemanaCard } from "@/components/treino/semana-card";
import { TreinoDiaCard } from "@/components/treino/treino-dia-card";
import { useAppStore } from "@/lib/store";
import type { TreinoExercicioComExercicio } from "@/lib/types";

export default function MeuTreinoPage() {
  const {
    treinos,
    treinoExercicios,
    exercicios,
    loading,
    addTreino,
    renameTreino,
    removeTreino,
    moveTreino,
    addExercicioATreino,
    renameExercicio,
    updateRepRange,
    removeExercicioDoTreino,
    moveExercicioDoTreino,
    setTreinoDoDia,
  } = useAppStore();

  const treinosOrdenados = [...treinos].sort((a, b) => a.ordem - b.ordem);

  if (loading) {
    return (
      <>
        <AppHeader variant="title" title="Meu Treino" />
        <main className="flex flex-1 items-center justify-center px-8 text-center text-[13px] text-muted-foreground">
          Carregando...
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader variant="title" title="Meu Treino" />
      <main className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col gap-4">
          {treinosOrdenados.map((treino, i) => {
            const exerciciosDoTreino = treinoExercicios
              .filter((te) => te.treino_id === treino.id)
              .map((te) => ({ ...te, exercicio: exercicios.find((e) => e.id === te.exercicio_id) }))
              .filter((te): te is TreinoExercicioComExercicio => te.exercicio !== undefined)
              .sort((a, b) => a.ordem - b.ordem);

            return (
              <TreinoDiaCard
                key={treino.id}
                nome={treino.nome}
                exercicios={exerciciosDoTreino}
                isFirst={i === 0}
                isLast={i === treinosOrdenados.length - 1}
                onRename={(nome) => renameTreino(treino.id, nome)}
                onMoveUp={() => moveTreino(treino.id, "up")}
                onMoveDown={() => moveTreino(treino.id, "down")}
                onRemoveDia={() => removeTreino(treino.id)}
                onAddExercicio={() => addExercicioATreino(treino.id)}
                onRenameExercicio={renameExercicio}
                onRepRangeChange={updateRepRange}
                onMoveExercicio={moveExercicioDoTreino}
                onRemoveExercicio={removeExercicioDoTreino}
              />
            );
          })}

          <button
            type="button"
            onClick={addTreino}
            className="w-full rounded-2xl border border-border bg-card py-4 text-sm font-bold"
          >
            + Adicionar treino
          </button>
        </div>

        {treinosOrdenados.length > 0 && <SemanaCard treinos={treinosOrdenados} onSetTreinoDoDia={setTreinoDoDia} />}
      </main>
    </>
  );
}
