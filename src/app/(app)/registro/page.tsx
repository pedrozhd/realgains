"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToastPill } from "@/components/ui/toast-pill";
import { CargaCard } from "@/components/registro/carga-card";
import { ExercicioTabs } from "@/components/registro/exercicio-tabs";
import { QualidadePicker } from "@/components/registro/qualidade-picker";
import { RepsCard } from "@/components/registro/reps-card";
import { TypographyH1, TypographyMuted } from "@/components/ui/typography";
import {
  formatCarga,
  getTreinoDeHoje,
  getUltimaSerie,
  shouldAlertarProximoDoLimite,
  shouldSugerirProgressao,
} from "@/lib/dashboard";
import { useAppStore } from "@/lib/store";
import { getDataLocalISO } from "@/lib/timezone";
import type { Qualidade } from "@/lib/types";

const QUALIDADE_EMOJI: Record<Qualidade, string> = { boa: "🟢", razoavel: "🟡", ruim: "🔴" };

export default function RegistroPage() {
  const { treinos, treinoExercicios, exercicios, series, addSerie, loading } = useAppStore();

  const treinoDeHoje = getTreinoDeHoje(treinos);
  const exerciciosDoDia = treinoDeHoje
    ? treinoExercicios
        .filter((te) => te.treino_id === treinoDeHoje.id)
        .sort((a, b) => a.ordem - b.ordem)
        .map((te) => ({ ...te, exercicio: exercicios.find((e) => e.id === te.exercicio_id) }))
    : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const curEx = exerciciosDoDia[Math.min(activeIndex, Math.max(exerciciosDoDia.length - 1, 0))];

  function ultimaCargaDe(exercicioId: string): number {
    const ultima = getUltimaSerie(series.filter((s) => s.exercicio_id === exercicioId));
    return ultima ? ultima.carga : 0;
  }

  const [carga, setCarga] = useState(() => (curEx ? ultimaCargaDe(curEx.exercicio_id) : 0));
  const [reps, setReps] = useState(0);
  const [qualidade, setQualidade] = useState<Qualidade | null>(null);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);

  function mostrarToast(msg: string) {
    setToast({ msg, key: Date.now() });
    window.setTimeout(() => setToast(null), 1800);
  }

  function selecionarExercicio(index: number) {
    setActiveIndex(index);
    const ex = exerciciosDoDia[index];
    setCarga(ex ? ultimaCargaDe(ex.exercicio_id) : 0);
    setReps(0);
    setQualidade(null);
  }

  function onRepTap() {
    const novo = reps + 1;
    setReps(novo);
    if (curEx && shouldAlertarProximoDoLimite(novo, curEx.rep_max)) {
      mostrarToast("Quase lá — mais 1 rep e é hora de subir a carga 💪");
    }
  }

  const podeSalvar = Boolean(curEx) && carga > 0 && reps > 0 && qualidade !== null;

  async function onSave() {
    if (!curEx || !podeSalvar || !qualidade) return;
    try {
      await addSerie(curEx.exercicio_id, carga, reps, qualidade);
      setReps(0);
      mostrarToast("Série salva ✓");
    } catch {
      mostrarToast("Não deu pra salvar — tenta de novo");
    }
  }

  if (loading) {
    return (
      <>
        <AppHeader variant="title" title="Registro" />
        <main className="flex flex-1 items-center justify-center px-8">
          <TypographyMuted className="text-center">Carregando...</TypographyMuted>
        </main>
      </>
    );
  }

  if (!treinoDeHoje || !curEx || !curEx.exercicio) {
    let mensagem = "Nenhum exercício cadastrado no treino de hoje. Adicione exercícios em “Meu Treino”.";
    if (treinos.length === 0) {
      mensagem = "Nenhum treino cadastrado ainda. Crie seus treinos em “Meu Treino”.";
    } else if (!treinoDeHoje) {
      mensagem = "Hoje é seu dia de descanso 🎉 Nenhum treino está agendado para hoje.";
    }

    return (
      <>
        <AppHeader variant="title" title="Registro" />
        <main className="flex flex-1 items-center justify-center px-8">
          <TypographyMuted className="text-center">{mensagem}</TypographyMuted>
        </main>
      </>
    );
  }

  const seriesDoExercicio = series.filter((s) => s.exercicio_id === curEx.exercicio_id);
  const ultima = getUltimaSerie(seriesDoExercicio);
  // Fuso fixo do app, não o do navegador — mantém "hoje" consistente com o
  // que a API (/api/hoje, rodando na Vercel em UTC) calcula.
  const hojeStr = getDataLocalISO(new Date());
  const setsDeHoje = seriesDoExercicio
    .filter((s) => getDataLocalISO(new Date(s.data)) === hojeStr)
    .sort((a, b) => a.data.localeCompare(b.data));
  const numeroProximaSerie = setsDeHoje.length + 1;
  const sugereProgressao = shouldSugerirProgressao(reps, curEx.rep_max, qualidade);

  return (
    <>
      <AppHeader variant="title" title="Registro" />
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4">
        <div className="flex flex-col gap-4">
          <ExercicioTabs
            nomes={exerciciosDoDia.map((te) => te.exercicio?.nome ?? "")}
            activeIndex={activeIndex}
            onSelect={selecionarExercicio}
          />

          <div className="flex items-center gap-2">
            <Badge variant="secondary" appearance="stroke" className="w-fit">
              {treinoDeHoje.nome.toUpperCase()}
            </Badge>
            <Badge variant="primary" appearance="solid" className="w-fit">
              SÉRIE {numeroProximaSerie} DE {curEx.num_series}
            </Badge>
          </div>

          <div>
            <TypographyH1>{curEx.exercicio.nome}</TypographyH1>
            <TypographyMuted className="mt-1.5">
              {ultima
                ? `Última: ${formatCarga(ultima.carga)} kg × ${ultima.reps} ${QUALIDADE_EMOJI[ultima.qualidade]}`
                : "Sem registros ainda"}
            </TypographyMuted>
          </div>
        </div>

        <CargaCard carga={carga} onChange={setCarga} />

        <RepsCard
          reps={reps}
          repMin={curEx.rep_min}
          repMax={curEx.rep_max}
          onTap={onRepTap}
          onMinus={() => setReps((r) => Math.max(0, r - 1))}
        />

        <QualidadePicker qualidade={qualidade} onChange={setQualidade} />

        {sugereProgressao && (
          <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-[13px] font-medium text-success">
            Bateu o topo da faixa com boa qualidade — na próxima sessão, suba a carga.
          </p>
        )}

        {setsDeHoje.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground/70">Séries de hoje:</span>
            <div className="flex flex-wrap items-center gap-2">
              {setsDeHoje.map((s, i) => (
                <span
                  key={s.id}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
                >
                  Série {i + 1}: {formatCarga(s.carga)}kg × {s.reps} {QUALIDADE_EMOJI[s.qualidade]}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      <div className="flex-none border-t border-border px-5 pt-3 pb-2.5">
        <Link
          href={`/exercicio/${curEx.exercicio_id}`}
          className="mb-2 flex items-center justify-center gap-1 text-[13px] font-semibold text-muted-foreground active:opacity-70"
        >
          Ver histórico do exercício
          <ChevronRight size={16} />
        </Link>
        <Button
          onClick={onSave}
          disabled={!podeSalvar}
          className="h-[60px] w-full rounded-2xl text-[17px] font-bold"
        >
          Salvar série
        </Button>
      </div>

      <ToastPill message={toast?.msg ?? null} toastKey={toast?.key ?? 0} />
    </>
  );
}
