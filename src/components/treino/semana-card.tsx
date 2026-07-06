"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TypographyEyebrow } from "@/components/ui/typography";
import { DIAS_SEMANA } from "@/lib/semana";
import type { Treino } from "@/lib/types";

interface SemanaCardProps {
  treinos: Treino[];
  onSetTreinoDoDia: (diaSemana: number, treinoId: string | null) => void;
}

export function SemanaCard({ treinos, onSetTreinoDoDia }: SemanaCardProps) {
  const [diaAberto, setDiaAberto] = useState<number | null>(null);

  function treinoDoDia(dia: number) {
    return treinos.find((t) => t.dias_semana.includes(dia));
  }

  return (
    <section className="flex flex-col gap-2.5">
      <TypographyEyebrow>SUA SEMANA</TypographyEyebrow>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {DIAS_SEMANA.map((d, i) => {
          const treino = treinoDoDia(d.valor);
          return (
            <button
              key={d.valor}
              type="button"
              onClick={() => setDiaAberto(d.valor)}
              className={`flex w-full items-center justify-between px-4 py-3.5 text-left ${
                i !== DIAS_SEMANA.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-[14px] font-semibold">{d.label}</span>
              {treino ? (
                <Badge variant="primary" appearance="solid">
                  {treino.nome || "Treino sem nome"}
                </Badge>
              ) : (
                <Badge variant="secondary" appearance="stroke" className="text-muted-foreground">
                  Descanso
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={diaAberto !== null} onOpenChange={(open) => !open && setDiaAberto(null)}>
        <DialogContent className="max-w-[340px] rounded-2xl border-border bg-card">
          <DialogHeader>
            <DialogTitle>{DIAS_SEMANA.find((d) => d.valor === diaAberto)?.label}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (diaAberto !== null) onSetTreinoDoDia(diaAberto, null);
                setDiaAberto(null);
              }}
              className="rounded-xl border border-border px-4 py-3 text-left text-sm font-medium text-muted-foreground"
            >
              Descanso
            </button>
            {treinos.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  if (diaAberto !== null) onSetTreinoDoDia(diaAberto, t.id);
                  setDiaAberto(null);
                }}
                className="rounded-xl border border-border px-4 py-3 text-left text-sm font-semibold"
              >
                {t.nome || "Treino sem nome"}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
