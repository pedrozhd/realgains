"use client";

import { useParams, useRouter } from "next/navigation";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppHeader } from "@/components/layout/app-header";
import { TypographyEyebrow, TypographyMuted } from "@/components/ui/typography";
import { formatCarga } from "@/lib/dashboard";
import { useAppStore } from "@/lib/store";
import { APP_TIMEZONE } from "@/lib/timezone";
import type { Qualidade } from "@/lib/types";

const QUALIDADE_EMOJI: Record<Qualidade, string> = { boa: "🟢", razoavel: "🟡", ruim: "🔴" };

function formatDataSerie(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: APP_TIMEZONE })
    .format(new Date(iso))
    .replace(".", "");
}

export default function ExercicioHistoricoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { exercicios, series, loading } = useAppStore();

  const exercicio = exercicios.find((e) => e.id === params.id);
  const seriesAntigaPrimeiro = series
    .filter((s) => s.exercicio_id === params.id)
    .sort((a, b) => a.data.localeCompare(b.data));
  const seriesRecentePrimeiro = [...seriesAntigaPrimeiro].reverse();

  if (loading) {
    return (
      <>
        <AppHeader variant="back" title="Histórico" onBack={() => router.back()} />
        <main className="flex flex-1 items-center justify-center px-8">
          <TypographyMuted className="text-center">Carregando...</TypographyMuted>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader variant="back" title={exercicio?.nome || "Exercício"} onBack={() => router.back()} />
      <main className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6">
        {seriesRecentePrimeiro.length === 0 ? (
          <TypographyMuted className="flex-1 py-10 text-center">
            Nenhuma série registrada ainda para este exercício.
          </TypographyMuted>
        ) : (
          <>
            <section className="rounded-2xl border border-border bg-card p-4">
              <TypographyEyebrow>CARGA AO LONGO DO TEMPO</TypographyEyebrow>
              <div className="mt-3 h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={seriesAntigaPrimeiro} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                    <XAxis dataKey="data" hide />
                    <YAxis hide domain={["dataMin", "dataMax"]} />
                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        background: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelFormatter={(value) => formatDataSerie(String(value))}
                      formatter={(value) => [`${formatCarga(Number(value ?? 0))} kg`, "Carga"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="carga"
                      stroke="#fafafa"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, fill: "#fafafa" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="flex flex-col gap-2.5">
              <TypographyEyebrow>TODAS AS SÉRIES ({seriesRecentePrimeiro.length})</TypographyEyebrow>
              <div className="flex flex-col gap-2">
                {seriesRecentePrimeiro.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <span className="w-16 shrink-0 text-[13px] text-muted-foreground">{formatDataSerie(s.data)}</span>
                    <span className="flex-1 text-center text-[15px] font-bold">{formatCarga(s.carga)} kg</span>
                    <span className="flex w-16 shrink-0 items-center justify-end gap-2">
                      <span className="text-[13px] text-muted-foreground">× {s.reps}</span>
                      <span className="text-[13px]">{QUALIDADE_EMOJI[s.qualidade]}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
