import { QualidadeIcon } from "@/components/registro/qualidade-icon";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TypographyEyebrow } from "@/components/ui/typography";
import type { Qualidade } from "@/lib/types";

const OPCOES: { key: Qualidade; label: string }[] = [
  { key: "boa", label: "Boa" },
  { key: "razoavel", label: "Razoável" },
  { key: "ruim", label: "Ruim" },
];

interface QualidadePickerProps {
  qualidade: Qualidade | null;
  onChange: (qualidade: Qualidade | null) => void;
}

export function QualidadePicker({ qualidade, onChange }: QualidadePickerProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <TypographyEyebrow>QUALIDADE DA SÉRIE</TypographyEyebrow>
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
              <QualidadeIcon qualidade={op.key} size={20} />
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
