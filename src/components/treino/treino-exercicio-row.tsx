import { BlurCommitInput } from "@/components/ui/blur-commit-input";

interface TreinoExercicioRowProps {
  nome: string;
  numSeries: number;
  repMin: number;
  repMax: number;
  isFirst: boolean;
  isLast: boolean;
  onRename: (nome: string) => void;
  onNumSeriesChange: (value: number) => void;
  onRepMinChange: (value: number) => void;
  onRepMaxChange: (value: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function TreinoExercicioRow({
  nome,
  numSeries,
  repMin,
  repMax,
  isFirst,
  isLast,
  onRename,
  onNumSeriesChange,
  onRepMinChange,
  onRepMaxChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: TreinoExercicioRowProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] border border-border/70 bg-background px-2.5 py-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-none flex-col gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Mover exercício para cima"
            className="text-[11px] leading-none text-muted-foreground disabled:opacity-30"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Mover exercício para baixo"
            className="text-[11px] leading-none text-muted-foreground disabled:opacity-30"
          >
            ▼
          </button>
        </div>

        <BlurCommitInput
          value={nome}
          onCommit={onRename}
          placeholder="Exercício"
          className="h-auto min-w-0 flex-1 border-none bg-transparent px-0 py-1 text-sm font-semibold shadow-none focus-visible:ring-0"
        />

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover exercício"
          className="shrink-0 px-1 text-base text-muted-foreground"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-1.5 pl-[22px] text-xs text-muted-foreground">
        <BlurCommitInput
          value={numSeries ? String(numSeries) : ""}
          onCommit={(v) => onNumSeriesChange(Number(v) || 0)}
          inputMode="numeric"
          placeholder="3"
          aria-label="Número de séries"
          className="h-7 w-7 shrink-0 border-input bg-secondary/60 px-1 text-center text-[13px]"
        />
        <span className="shrink-0">séries de</span>
        <BlurCommitInput
          value={repMin ? String(repMin) : ""}
          onCommit={(v) => onRepMinChange(Number(v) || 0)}
          inputMode="numeric"
          placeholder="5"
          aria-label="Repetições mínimas"
          className="h-7 w-7 shrink-0 border-input bg-secondary/60 px-1 text-center text-[13px]"
        />
        <span className="shrink-0">–</span>
        <BlurCommitInput
          value={repMax ? String(repMax) : ""}
          onCommit={(v) => onRepMaxChange(Number(v) || 0)}
          inputMode="numeric"
          placeholder="8"
          aria-label="Repetições máximas"
          className="h-7 w-7 shrink-0 border-input bg-secondary/60 px-1 text-center text-[13px]"
        />
        <span className="shrink-0">reps</span>
      </div>
    </div>
  );
}
