"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppHeader } from "@/components/layout/app-header";
import { EditarSerieDialog } from "@/components/registro/editar-serie-dialog";
import { QualidadeIcon } from "@/components/registro/qualidade-icon";
import { TypographyEyebrow, TypographyMuted } from "@/components/ui/typography";
import { formatCarga } from "@/lib/dashboard";
import { useAppStore } from "@/lib/store";
import { APP_TIMEZONE } from "@/lib/timezone";
import type { Serie } from "@/lib/types";

function formatDataSerie(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: APP_TIMEZONE })
    .format(new Date(iso))
    .replace(".", "");
}

export default function ExercicioHistoricoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { exercicios, series, loading, updateSerie, removeSerie } = useAppStore();
  const [serieEditando, setSerieEditando] = useState<Serie | null>(null);

  async function onRemoverSerie(serieId: string) {
    if (!window.confirm("Apagar essa série? Não dá pra desfazer.")) return;
    await removeSerie(serieId);
  }

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
      <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6">
        {seriesRecentePrimeiro.length === 0 ? (
          <TypographyMuted className="flex-1 py-10 text-center">
            Nenhuma série registrada ainda para este exercício.
          </TypographyMuted>
        ) : (
          <>
            <section className="shadow-soft-elevated rounded-2xl bg-card p-4">
              <TypographyEyebrow>CARGA AO LONGO DO TEMPO</TypographyEyebrow>
              <div className="mt-3 h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={seriesAntigaPrimeiro} margin={{ top: 16, right: 10, bottom: 8, left: 10 }}>
                    <XAxis dataKey="data" hide />
                    <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        background: "#ffffff",
                        border: "1px solid #dcdfe4",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#2a2d34",
                      }}
                      labelFormatter={(value) => formatDataSerie(String(value))}
                      formatter={(value) => [`${formatCarga(Number(value ?? 0))} kg`, "Carga"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="carga"
                      stroke="#22c55e"
                      strokeWidth={2}
                      style={{ filter: "drop-shadow(0 0 6px rgba(34,197,94,0.55))" }}
                      dot={(props: { cx?: number; cy?: number; index?: number }) => {
                        const isLast = props.index === seriesAntigaPrimeiro.length - 1;
                        if (!isLast || props.cx == null || props.cy == null) return <g key={props.index} />;
                        return (
                          <circle
                            key={props.index}
                            cx={props.cx}
                            cy={props.cy}
                            r={3}
                            fill="#22c55e"
                            style={{ filter: "drop-shadow(0 0 5px #22c55e)" }}
                          />
                        );
                      }}
                      activeDot={{ r: 4, fill: "#22c55e" }}
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
                    className="shadow-soft-subtle flex items-center justify-between rounded-xl bg-card px-4 py-3"
                  >
                    <span className="w-16 shrink-0 text-[13px] text-muted-foreground">{formatDataSerie(s.data)}</span>
                    <span className="flex-1 text-center text-[15px] font-bold">{formatCarga(s.carga)} kg</span>
                    <span className="flex shrink-0 items-center justify-end gap-2">
                      <span className="text-[13px] text-muted-foreground">× {s.reps}</span>
                      <QualidadeIcon qualidade={s.qualidade} />
                      <button
                        type="button"
                        onClick={() => setSerieEditando(s)}
                        aria-label="Editar série"
                        className="text-muted-foreground/60 active:opacity-60"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoverSerie(s.id)}
                        aria-label="Apagar série"
                        className="text-muted-foreground/60 active:opacity-60"
                      >
                        <Trash2 size={15} />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <EditarSerieDialog
        serie={serieEditando}
        onOpenChange={(open) => !open && setSerieEditando(null)}
        onSave={(serieId, carga, reps, qualidade) => updateSerie(serieId, carga, reps, qualidade)}
      />
    </>
  );
}
