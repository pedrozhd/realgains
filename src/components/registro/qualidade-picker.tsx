import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Qualidade } from "@/lib/types";

const OPCOES: { key: Qualidade; emoji: string; label: string }[] = [
  { key: "boa", emoji: "🟢", label: "Boa" },
  { key: "razoavel", emoji: "🟡", label: "Razoável" },
  { key: "ruim", emoji: "🔴", label: "Ruim" },
];

interface QualidadePickerProps {
  qualidade: Qualidade | null;
  onChange: (qualidade: Qualidade | null) => void;
}

export function QualidadePicker({ qualidade, onChange }: QualidadePickerProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <p className="text-[11px] font-bold tracking-widest text-muted-foreground">QUALIDADE DA SÉRIE</p>
      <ToggleGroup
        value={qualidade ? [qualidade] : []}
        onValueChange={(valores) => onChange((valores[0] as Qualidade) ?? null)}
        className="grid w-full grid-cols-3 gap-2"
      >
        {OPCOES.map((op) => {
          const selecionada = qualidade === op.key;
          return (
            <ToggleGroupItem
              key={op.key}
              value={op.key}
              className={`flex h-auto flex-col items-center gap-1.5 rounded-xl border py-3.5 text-[13px] font-semibold ${
                selecionada
                  ? "border-foreground bg-accent text-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <span className="text-lg leading-none">{op.emoji}</span>
              <span>{op.label}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
      <p className="text-xs leading-relaxed text-muted-foreground/70">
        Boa = amplitude completa e movimento controlado do início ao fim. Razoável = pequena perda de
        amplitude ou controle. Ruim = compensações claras ou amplitude parcial.
      </p>
    </section>
  );
}
