"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { BlurCommitInput } from "@/components/ui/blur-commit-input";
import { TreinoExercicioRow } from "@/components/treino/treino-exercicio-row";
import type { TreinoExercicioComExercicio } from "@/lib/types";

interface TreinoDiaCardProps {
  nome: string;
  exercicios: TreinoExercicioComExercicio[];
  isFirst: boolean;
  isLast: boolean;
  onRename: (nome: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemoveDia: () => void;
  onAddExercicio: () => void;
  onRenameExercicio: (exercicioId: string, nome: string) => void;
  onRepRangeChange: (treinoExercicioId: string, repMin: number, repMax: number) => void;
  onMoveExercicio: (treinoExercicioId: string, direction: "up" | "down") => void;
  onRemoveExercicio: (treinoExercicioId: string) => void;
}

export function TreinoDiaCard({
  nome,
  exercicios,
  isFirst,
  isLast,
  onRename,
  onMoveUp,
  onMoveDown,
  onRemoveDia,
  onAddExercicio,
  onRenameExercicio,
  onRepRangeChange,
  onMoveExercicio,
  onRemoveExercicio,
}: TreinoDiaCardProps) {
  const [editandoNome, setEditandoNome] = useState(false);

  return (
    <section className="rounded-2xl border border-border bg-card p-3.5">
      <div className="flex items-center gap-1.5">
        <div className="flex flex-none flex-col gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Mover treino para cima"
            className="text-xs leading-none text-muted-foreground disabled:opacity-30"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Mover treino para baixo"
            className="text-xs leading-none text-muted-foreground disabled:opacity-30"
          >
            ▼
          </button>
        </div>

        {editandoNome ? (
          <BlurCommitInput
            value={nome}
            onCommit={onRename}
            onBlur={() => setEditandoNome(false)}
            placeholder="Nome do treino"
            autoFocus
            className="h-auto flex-1 border-none bg-transparent px-0 py-1.5 text-[17px] font-bold shadow-none focus-visible:ring-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditandoNome(true)}
            className="flex flex-1 items-center gap-1.5 overflow-hidden py-1.5 text-left"
          >
            <span className="truncate text-[17px] font-bold">{nome || "Nome do treino"}</span>
            <Pencil size={14} className="shrink-0 text-muted-foreground" />
          </button>
        )}

        <button
          type="button"
          onClick={onRemoveDia}
          aria-label="Remover treino"
          className="px-1.5 text-lg text-muted-foreground"
        >
          ✕
        </button>
      </div>

      <div className="mt-2.5 flex flex-col gap-2">
        {exercicios.map((te, i) => (
          <TreinoExercicioRow
            key={te.id}
            nome={te.exercicio.nome}
            repMin={te.rep_min}
            repMax={te.rep_max}
            isFirst={i === 0}
            isLast={i === exercicios.length - 1}
            onRename={(novoNome) => onRenameExercicio(te.exercicio_id, novoNome)}
            onRepMinChange={(v) => onRepRangeChange(te.id, v, te.rep_max)}
            onRepMaxChange={(v) => onRepRangeChange(te.id, te.rep_min, v)}
            onMoveUp={() => onMoveExercicio(te.id, "up")}
            onMoveDown={() => onMoveExercicio(te.id, "down")}
            onRemove={() => onRemoveExercicio(te.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddExercicio}
        className="mt-2.5 w-full rounded-[10px] border border-dashed border-input py-2.5 text-[13px] font-semibold text-muted-foreground"
      >
        + Adicionar exercício
      </button>
    </section>
  );
}
