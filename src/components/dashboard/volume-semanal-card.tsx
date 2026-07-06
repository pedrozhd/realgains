"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Sparkline } from "@/components/ui/sparkline";
import { TypographyEyebrow, TypographyMuted } from "@/components/ui/typography";
import type { VolumeSemana } from "@/lib/types";

interface Props {
  dados: VolumeSemana[];
}

// `iso` é uma data civil (YYYY-MM-DD) já resolvida para o fuso do app em
// getVolumeSemanal — por isso formata em timeZone: "UTC" aqui, não no fuso
// do navegador, senão a meia-noite UTC vira o dia anterior em fusos como o
// do Brasil (UTC-3) e a data exibida fica um dia adiantada/atrasada.
function formatSemana(iso: string): string {
  return new Date(`${iso}T00:00:00Z`)
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" })
    .replace(".", "");
}

const valueFormat = { maximumFractionDigits: 0 } satisfies Format;
const percentFormat = { maximumFractionDigits: 1 } satisfies Format;
const animationTiming = { duration: 980, easing: "cubic-bezier(0.25, 1, 0.5, 1)" } as const;

export function VolumeSemanalCard({ dados }: Props) {
  const temDados = dados.length >= 2;

  if (!temDados) {
    return (
      <section className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4">
        <TypographyEyebrow>VOLUME SEMANAL</TypographyEyebrow>
        <TypographyMuted className="py-5 text-center">Registre séries para ver seu volume</TypographyMuted>
      </section>
    );
  }

  const primeiro = dados[0].volume;
  const ultimo = dados[dados.length - 1].volume;
  const deltaPercentual = primeiro === 0 ? 0 : ((ultimo - primeiro) / primeiro) * 100;
  const subiu = deltaPercentual >= 0;
  const corTendencia = subiu ? "text-success" : "text-destructive";
  const IconeTendencia = subiu ? ArrowUpRight : ArrowDownLeft;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <TypographyEyebrow>VOLUME SEMANAL</TypographyEyebrow>
          <p className="mt-1 text-2xl leading-none font-bold tabular-nums">
            {new Intl.NumberFormat("pt-BR", valueFormat).format(ultimo)} kg
          </p>
        </div>
        <div className={`grid grid-cols-[14px_auto] items-center gap-0.5 text-sm font-bold tabular-nums ${corTendencia}`}>
          <IconeTendencia aria-hidden size={14} strokeWidth={2.5} />
          <NumberFlow format={percentFormat} spinTiming={animationTiming} suffix="%" transformTiming={animationTiming} value={Math.abs(deltaPercentual)} />
        </div>
      </div>

      <Sparkline
        ariaLabel={`Volume semanal ${subiu ? "subindo" : "caindo"} ${Math.abs(deltaPercentual).toFixed(1)} por cento`}
        className={`mt-2 ${corTendencia}`}
        curve="smooth"
        data={dados.map((d) => ({ label: formatSemana(d.semana), value: d.volume }))}
        duration={animationTiming.duration}
        glow
        height={64}
        showEndpoint
        strokeWidth={2}
      />
    </section>
  );
}
