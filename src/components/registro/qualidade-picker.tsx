import { QualidadeIcon } from "@/components/registro/qualidade-icon";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TypographyEyebrow } from "@/components/ui/typography";
import type { Qualidade } from "@/lib/types";

const OPCOES: { key: Qualidade; label: string; explicacao: string }[] = [
  { key: "boa", label: "Boa", explicacao: "Amplitude completa e movimento controlado do início ao fim." },
  { key: "razoavel", label: "Razoável", explicacao: "Pequena perda de amplitude ou controle." },
  { key: "ruim", label: "Ruim", explicacao: "Compensações claras ou amplitude parcial." },
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
      <div className="flex flex-col gap-1.5 text-xs leading-relaxed text-muted-foreground/70">
        {OPCOES.map((op) => (
          <div key={op.key} className="flex items-start gap-1.5">
            <QualidadeIcon qualidade={op.key} size={13} className="mt-0.5 shrink-0" />
            <span>{op.explicacao}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
