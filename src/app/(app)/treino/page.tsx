"use client";

import { AppHeader } from "@/components/layout/app-header";
import { SemanaCard } from "@/components/treino/semana-card";
import { TreinoDiaCard } from "@/components/treino/treino-dia-card";
import { TypographyMuted } from "@/components/ui/typography";
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
    addExercicioATreino,
    vincularExercicioExistente,
    renameExercicio,
    updateSeriesConfig,
    removeExercicioDoTreino,
    excluirExercicioDefinitivamente,
    reordenarExerciciosDoTreino,
    setTreinoDoDia,
  } = useAppStore();

  const treinosOrdenados = [...treinos].sort((a, b) => a.ordem - b.ordem);
  const idsComTreino = new Set(treinoExercicios.map((te) => te.exercicio_id));
  const exerciciosOrfaos = exercicios.filter((e) => !idsComTreino.has(e.id));

  if (loading) {
    return (
      <>
        <AppHeader variant="title" title="Meu Treino" />
        <main className="flex flex-1 items-center justify-center px-8">
          <TypographyMuted className="text-center">Carregando...</TypographyMuted>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader variant="title" title="Meu Treino" />
      <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col gap-4">
          {treinosOrdenados.map((treino) => {
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
                exerciciosOrfaos={exerciciosOrfaos}
                onRename={(nome) => renameTreino(treino.id, nome)}
                onRemoveDia={() => removeTreino(treino.id)}
                onAddExercicio={() => addExercicioATreino(treino.id)}
                onVincularExercicioExistente={(exercicioId) => vincularExercicioExistente(treino.id, exercicioId)}
                onRenameExercicio={renameExercicio}
                onSeriesConfigChange={updateSeriesConfig}
                onReordenarExercicios={reordenarExerciciosDoTreino}
                onDesvincularExercicio={removeExercicioDoTreino}
                onApagarExercicioDefinitivamente={excluirExercicioDefinitivamente}
              />
            );
          })}

          <button
            type="button"
            onClick={addTreino}
            className="shadow-soft-subtle w-full rounded-2xl bg-card py-4 text-sm font-bold"
          >
            + Adicionar treino
          </button>
        </div>

        {treinosOrdenados.length > 0 && <SemanaCard treinos={treinosOrdenados} onSetTreinoDoDia={setTreinoDoDia} />}
      </main>
    </>
  );
}
