import { TypographyEyebrow } from "@/components/ui/typography";

interface RepsCardProps {
  reps: number;
  repMin: number;
  repMax: number;
  onTap: () => void;
  onMinus: () => void;
}

export function RepsCard({ reps, repMin, repMax, onTap, onMinus }: RepsCardProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex flex-col items-stretch gap-1.5 rounded-2xl border border-border bg-card p-4 text-left"
    >
      <div className="flex items-center justify-between">
        <TypographyEyebrow>REPETIÇÕES {repMin && repMax ? `(${repMin}–${repMax})` : ""}</TypographyEyebrow>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onMinus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onMinus();
            }
          }}
          aria-label="Diminuir repetições"
          className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-input bg-secondary text-xl text-muted-foreground"
        >
          −
        </span>
      </div>
      <div className="py-1.5 text-center text-[56px] leading-none font-extrabold tracking-tight">{reps}</div>
      <p className="text-center text-xs text-muted-foreground/70">+1 por toque</p>
    </button>
  );
}
