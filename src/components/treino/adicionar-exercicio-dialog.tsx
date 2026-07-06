"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TypographyEyebrow } from "@/components/ui/typography";
import type { Exercicio } from "@/lib/types";

interface AdicionarExercicioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciciosOrfaos: Exercicio[];
  onCriarNovo: () => void;
  onVincularExistente: (exercicioId: string) => void;
}

export function AdicionarExercicioDialog({
  open,
  onOpenChange,
  exerciciosOrfaos,
  onCriarNovo,
  onVincularExistente,
}: AdicionarExercicioDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle>Adicionar exercício</DialogTitle>
          {exerciciosOrfaos.length > 0 && (
            <DialogDescription>Crie um novo ou traga de volta um que já tem histórico.</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => {
              onCriarNovo();
              onOpenChange(false);
            }}
            className="rounded-xl border border-dashed border-input px-4 py-3 text-left text-sm font-semibold text-muted-foreground"
          >
            + Criar exercício novo
          </button>

          {exerciciosOrfaos.length > 0 && (
            <>
              <TypographyEyebrow className="mt-2 px-1">SEM TREINO ATRIBUÍDO</TypographyEyebrow>
              {exerciciosOrfaos.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    onVincularExistente(ex.id);
                    onOpenChange(false);
                  }}
                  className="rounded-xl border border-border px-4 py-3 text-left text-sm font-semibold"
                >
                  {ex.nome || "Exercício sem nome"}
                </button>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
