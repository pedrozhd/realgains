import Link from "next/link";
import { BarTrend } from "@/components/ui/bar-trend";
import { SoftCard } from "@/components/ui/soft-card";
import { TypographyEyebrow, TypographyMuted } from "@/components/ui/typography";
import { formatCarga, type ExercicioEmFoco } from "@/lib/dashboard";

interface Props {
  dados: ExercicioEmFoco;
}

export function ExercicioEmFocoCard({ dados }: Props) {
  return (
    <Link href={`/exercicio/${dados.exercicioId}`} className="block active:opacity-80">
      <SoftCard className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <TypographyEyebrow>EM FOCO</TypographyEyebrow>
            <p className="mt-1 truncate text-lg font-bold leading-none">{dados.nome}</p>
          </div>
          {dados.cargaAtual !== null && (
            <p className="shrink-0 text-2xl leading-none font-bold tabular-nums">{formatCarga(dados.cargaAtual)} kg</p>
          )}
        </div>

        <TypographyMuted>
          {dados.seriesHoje} de {dados.numSeries} séries hoje
        </TypographyMuted>

        {dados.historico.length > 0 && (
          <BarTrend
            ariaLabel={`Histórico de carga de ${dados.nome}`}
            className="mt-1"
            data={dados.historico.map((h) => ({ value: h.carga }))}
            glow
            height={56}
          />
        )}
      </SoftCard>
    </Link>
  );
}
