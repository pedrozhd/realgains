"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TypographyEyebrow } from "@/components/ui/typography";
import type { Exercicio } from "@/lib/types";

interface AdicionarExercicioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciciosDisponiveis: Exercicio[];
  onCriarNovo: () => void;
  onVincularExistente: (exercicioId: string) => void;
}

export function AdicionarExercicioDialog({
  open,
  onOpenChange,
  exerciciosDisponiveis,
  onCriarNovo,
  onVincularExistente,
}: AdicionarExercicioDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-[340px] flex-col rounded-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle>Adicionar exercício</DialogTitle>
          {exerciciosDisponiveis.length > 0 && (
            <DialogDescription>Crie um novo ou reaproveite um que já existe, com o histórico junto.</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          <button
            type="button"
            onClick={() => {
              onCriarNovo();
              onOpenChange(false);
            }}
            className="shrink-0 rounded-xl border border-dashed border-input px-4 py-3 text-left text-sm font-semibold text-muted-foreground"
          >
            + Criar exercício novo
          </button>

          {exerciciosDisponiveis.length > 0 && (
            <>
              <TypographyEyebrow className="mt-2 shrink-0 px-1">JÁ EXISTENTES</TypographyEyebrow>
              <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
                {exerciciosDisponiveis.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => {
                      onVincularExistente(ex.id);
                      onOpenChange(false);
                    }}
                    className="shrink-0 rounded-xl border border-border px-4 py-3 text-left text-sm font-semibold"
                  >
                    {ex.nome || "Exercício sem nome"}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
