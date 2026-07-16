"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppHeader } from "@/components/layout/app-header";
import { EditarSerieDialog } from "@/components/registro/editar-serie-dialog";
import { QualidadeIcon } from "@/components/registro/qualidade-icon";
import { SoftCard } from "@/components/ui/soft-card";
import { ToastPill } from "@/components/ui/toast-pill";
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
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);

  const toastKeyRef = useRef(0);
  function mostrarToast(msg: string) {
    toastKeyRef.current += 1;
    setToast({ msg, key: toastKeyRef.current });
    window.setTimeout(() => setToast(null), 1800);
  }

  async function onRemoverSerie(serieId: string) {
    if (!window.confirm("Apagar essa série? Não dá pra desfazer.")) return;
    try {
      await removeSerie(serieId);
    } catch {
      mostrarToast("Não deu pra apagar — tenta de novo");
    }
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
      {/* pt-6: espaço pro brilho do shadow-soft-elevated do primeiro card não
          ser cortado pela borda deste container com overflow (ver dashboard/page.tsx). */}
      <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-6 pb-6">
        {seriesRecentePrimeiro.length === 0 ? (
          <TypographyMuted className="flex-1 py-10 text-center">
            Nenhuma série registrada ainda para este exercício.
          </TypographyMuted>
        ) : (
          <>
            <SoftCard className="p-4">
              <div className="flex items-center justify-between gap-3">
                <TypographyEyebrow>CARGA E REPETIÇÕES</TypographyEyebrow>
                <div className="flex shrink-0 items-center gap-3 text-[11px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Carga
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-info" />
                    Reps
                  </span>
                </div>
              </div>
              <div className="mt-3 h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={seriesAntigaPrimeiro} margin={{ top: 16, right: 10, bottom: 8, left: 10 }}>
                    <XAxis dataKey="data" hide />
                    <YAxis yAxisId="carga" hide domain={["dataMin - 5", "dataMax + 5"]} />
                    <YAxis yAxisId="reps" orientation="right" hide domain={["dataMin - 2", "dataMax + 2"]} />
                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "var(--popover-foreground)",
                      }}
                      labelFormatter={(value) => formatDataSerie(String(value))}
                      formatter={(value, name) =>
                        name === "reps"
                          ? [`${value} reps`, "Repetições"]
                          : [`${formatCarga(Number(value ?? 0))} kg`, "Carga"]
                      }
                    />
                    <Line
                      yAxisId="carga"
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
                    <Line
                      yAxisId="reps"
                      type="monotone"
                      dataKey="reps"
                      stroke="var(--info)"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      dot={false}
                      activeDot={{ r: 4, fill: "var(--info)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SoftCard>

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

      <ToastPill message={toast?.msg ?? null} toastKey={toast?.key ?? 0} />

      <EditarSerieDialog
        serie={serieEditando}
        onOpenChange={(open) => !open && setSerieEditando(null)}
        onSave={(serieId, carga, reps, qualidade) => updateSerie(serieId, carga, reps, qualidade)}
      />
    </>
  );
}
