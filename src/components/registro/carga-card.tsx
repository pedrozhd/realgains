import { Input } from "@/components/ui/input";
import { SoftCard } from "@/components/ui/soft-card";
import { TypographyEyebrow } from "@/components/ui/typography";

const PASSO_CARGA = 2.5;

interface CargaCardProps {
  carga: number;
  onChange: (carga: number) => void;
}

export function CargaCard({ carga, onChange }: CargaCardProps) {
  return (
    <SoftCard className="flex flex-col gap-3 p-4">
      <TypographyEyebrow>CARGA (KG)</TypographyEyebrow>
      <div className="flex items-stretch gap-2.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, Math.round((carga - PASSO_CARGA) * 10) / 10))}
          className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl border border-input bg-secondary text-2xl text-foreground"
          aria-label="Diminuir carga"
        >
          −
        </button>
        <Input
          value={carga === 0 ? "" : String(carga)}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value.replace(",", "."));
            onChange(Number.isNaN(parsed) ? 0 : parsed);
          }}
          inputMode="decimal"
          placeholder="0"
          className="h-[60px] flex-1 border-none bg-transparent px-0 text-center text-4xl font-extrabold tracking-tight shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <button
          type="button"
          onClick={() => onChange(Math.round((carga + PASSO_CARGA) * 10) / 10)}
          className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl border border-input bg-secondary text-2xl text-foreground"
          aria-label="Aumentar carga"
        >
          +
        </button>
      </div>
    </SoftCard>
  );
}
