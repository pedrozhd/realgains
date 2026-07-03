interface ExercicioTabsProps {
  nomes: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function ExercicioTabs({ nomes, activeIndex, onSelect }: ExercicioTabsProps) {
  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-0.5">
      {nomes.map((nome, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={`${nome}-${i}`}
            type="button"
            onClick={() => onSelect(i)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-[13px] font-semibold ${
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {nome || "Exercício"}
          </button>
        );
      })}
    </div>
  );
}
