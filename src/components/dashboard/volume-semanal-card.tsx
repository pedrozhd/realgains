"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { VolumeSemana } from "@/lib/types";

interface Props {
  dados: VolumeSemana[];
}

function formatSemana(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "");
}

export function VolumeSemanalCard({ dados }: Props) {
  const temDados = dados.length >= 2;
  const delta = temDados ? dados[dados.length - 1].volume - dados[dados.length - 2].volume : 0;

  return (
    <section className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-bold tracking-widest text-muted-foreground">VOLUME SEMANAL</p>
        {temDados && (
          <p className="text-xs text-muted-foreground/70">
            {delta >= 0 ? "+" : ""}
            {delta.toLocaleString("pt-BR")} kg
          </p>
        )}
      </div>

      {temDados ? (
        <div className="h-[70px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <XAxis dataKey="semana" hide />
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={(value) => formatSemana(String(value))}
                formatter={(value) => [`${Number(value ?? 0).toLocaleString("pt-BR")} kg`, "Volume"]}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#fafafa"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#fafafa" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-5 text-center text-[13px] text-muted-foreground/70">
          Registre séries para ver seu volume
        </p>
      )}
    </section>
  );
}
