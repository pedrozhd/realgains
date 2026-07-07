"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { QualidadePicker } from "@/components/registro/qualidade-picker";
import type { Qualidade, Serie } from "@/lib/types";

interface EditarSerieDialogProps {
  serie: Serie | null;
  onOpenChange: (open: boolean) => void;
  onSave: (serieId: string, carga: number, reps: number, qualidade: Qualidade) => Promise<void>;
}

export function EditarSerieDialog({ serie, onOpenChange, onSave }: EditarSerieDialogProps) {
  const [carga, setCarga] = useState(0);
  const [reps, setReps] = useState(0);
  const [qualidade, setQualidade] = useState<Qualidade | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [serieIdSincronizado, setSerieIdSincronizado] = useState<string | null>(null);

  // Repopula os campos sempre que uma nova série é aberta pra edição —
  // ajustado durante o render (guia do React) em vez de um efeito, pra não
  // custar um commit extra.
  if (serie && serie.id !== serieIdSincronizado) {
    setSerieIdSincronizado(serie.id);
    setCarga(serie.carga);
    setReps(serie.reps);
    setQualidade(serie.qualidade);
  }

  async function onSubmit() {
    if (!serie || !qualidade || carga <= 0 || reps <= 0) return;
    setSalvando(true);
    try {
      await onSave(serie.id, carga, reps, qualidade);
      onOpenChange(false);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={serie !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-2xl bg-card">
        <DialogHeader>
          <DialogTitle>Editar série</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2.5">
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Carga (kg)</span>
            <Input
              type="number"
              inputMode="decimal"
              value={carga === 0 ? "" : String(carga)}
              onChange={(e) => setCarga(parseFloat(e.target.value.replace(",", ".")) || 0)}
              className="h-11 rounded-xl text-center text-lg font-bold"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Reps</span>
            <Input
              type="number"
              inputMode="numeric"
              value={reps === 0 ? "" : String(reps)}
              onChange={(e) => setReps(Number(e.target.value) || 0)}
              className="h-11 rounded-xl text-center text-lg font-bold"
            />
          </div>
        </div>

        <QualidadePicker qualidade={qualidade} onChange={setQualidade} />

        <Button
          onClick={onSubmit}
          disabled={salvando || carga <= 0 || reps <= 0 || !qualidade}
          className="shadow-soft-elevated h-11 w-full rounded-xl"
        >
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
