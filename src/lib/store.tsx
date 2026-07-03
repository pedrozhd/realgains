"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Exercicio, Qualidade, Serie, Treino, TreinoExercicio } from "@/lib/types";

/**
 * Client-side data layer backed by Supabase. Holds the same four tables in
 * memory (refetched after every mutation — this app's data is small enough
 * that this is simpler and safer than hand-rolled optimistic patching) and
 * exposes the same shape `mock-store.tsx` used to, so Dashboard/Registro/
 * Meu Treino didn't need to change.
 */

interface AppDb {
  treinos: Treino[];
  exercicios: Exercicio[];
  treinoExercicios: TreinoExercicio[];
  series: Serie[];
}

const EMPTY_DB: AppDb = { treinos: [], exercicios: [], treinoExercicios: [], series: [] };

interface AppStoreValue extends AppDb {
  loading: boolean;
  userEmail: string | null;
  addSerie: (exercicioId: string, carga: number, reps: number, qualidade: Qualidade) => Promise<void>;
  addTreino: () => Promise<void>;
  renameTreino: (treinoId: string, nome: string) => Promise<void>;
  removeTreino: (treinoId: string) => Promise<void>;
  moveTreino: (treinoId: string, direction: "up" | "down") => Promise<void>;
  addExercicioATreino: (treinoId: string) => Promise<void>;
  renameExercicio: (exercicioId: string, nome: string) => Promise<void>;
  updateRepRange: (treinoExercicioId: string, repMin: number, repMax: number) => Promise<void>;
  removeExercicioDoTreino: (treinoExercicioId: string) => Promise<void>;
  moveExercicioDoTreino: (treinoExercicioId: string, direction: "up" | "down") => Promise<void>;
  setTreinoDoDia: (diaSemana: number, treinoId: string | null) => Promise<void>;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [db, setDb] = useState<AppDb>(EMPTY_DB);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setUserEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const refresh = useCallback(async () => {
    const [treinosRes, exerciciosRes, treinoExerciciosRes, seriesRes] = await Promise.all([
      supabase.from("treinos").select("*").order("ordem"),
      supabase.from("exercicios").select("*"),
      supabase.from("treino_exercicios").select("*").order("ordem"),
      supabase.from("series").select("*").order("data"),
    ]);
    setDb({
      treinos: treinosRes.data ?? [],
      exercicios: exerciciosRes.data ?? [],
      treinoExercicios: treinoExerciciosRes.data ?? [],
      series: seriesRes.data ?? [],
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // Fetching from Supabase is inherently async, so there's no render-time
    // alternative here — this just re-fetches whenever the signed-in user changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (userId) refresh();
  }, [userId, refresh]);

  const value = useMemo<AppStoreValue>(
    () => ({
      ...db,
      loading,
      userEmail,

      async addSerie(exercicioId, carga, reps, qualidade) {
        await supabase.from("series").insert({ exercicio_id: exercicioId, carga, reps, qualidade });
        await refresh();
      },

      async addTreino() {
        if (!userId) return;
        await supabase.from("treinos").insert({ user_id: userId, nome: "Novo dia", ordem: db.treinos.length });
        await refresh();
      },

      async renameTreino(treinoId, nome) {
        await supabase.from("treinos").update({ nome }).eq("id", treinoId);
        await refresh();
      },

      async removeTreino(treinoId) {
        await supabase.from("treinos").delete().eq("id", treinoId);
        const restantes = db.treinos.filter((t) => t.id !== treinoId).sort((a, b) => a.ordem - b.ordem);
        await Promise.all(
          restantes.map((t, i) => (t.ordem === i ? null : supabase.from("treinos").update({ ordem: i }).eq("id", t.id))),
        );
        await refresh();
      },

      async moveTreino(treinoId, direction) {
        const ordenados = [...db.treinos].sort((a, b) => a.ordem - b.ordem);
        const index = ordenados.findIndex((t) => t.id === treinoId);
        const alvo = direction === "up" ? index - 1 : index + 1;
        if (index === -1 || alvo < 0 || alvo >= ordenados.length) return;
        await Promise.all([
          supabase.from("treinos").update({ ordem: ordenados[alvo].ordem }).eq("id", ordenados[index].id),
          supabase.from("treinos").update({ ordem: ordenados[index].ordem }).eq("id", ordenados[alvo].id),
        ]);
        await refresh();
      },

      async addExercicioATreino(treinoId) {
        if (!userId) return;
        const { data: exercicio, error } = await supabase
          .from("exercicios")
          .insert({ user_id: userId, nome: "" })
          .select()
          .single();
        if (error || !exercicio) return;
        const ordemAtual = db.treinoExercicios.filter((te) => te.treino_id === treinoId).length;
        await supabase
          .from("treino_exercicios")
          .insert({ treino_id: treinoId, exercicio_id: exercicio.id, ordem: ordemAtual, rep_min: 8, rep_max: 12 });
        await refresh();
      },

      async renameExercicio(exercicioId, nome) {
        await supabase.from("exercicios").update({ nome }).eq("id", exercicioId);
        await refresh();
      },

      async updateRepRange(treinoExercicioId, repMin, repMax) {
        await supabase.from("treino_exercicios").update({ rep_min: repMin, rep_max: repMax }).eq("id", treinoExercicioId);
        await refresh();
      },

      async removeExercicioDoTreino(treinoExercicioId) {
        const alvo = db.treinoExercicios.find((te) => te.id === treinoExercicioId);
        if (!alvo) return;
        await supabase.from("treino_exercicios").delete().eq("id", treinoExercicioId);
        const restantes = db.treinoExercicios
          .filter((te) => te.treino_id === alvo.treino_id && te.id !== treinoExercicioId)
          .sort((a, b) => a.ordem - b.ordem);
        await Promise.all(
          restantes.map((te, i) =>
            te.ordem === i ? null : supabase.from("treino_exercicios").update({ ordem: i }).eq("id", te.id),
          ),
        );
        await refresh();
      },

      async moveExercicioDoTreino(treinoExercicioId, direction) {
        const alvo = db.treinoExercicios.find((te) => te.id === treinoExercicioId);
        if (!alvo) return;
        const doTreino = db.treinoExercicios
          .filter((te) => te.treino_id === alvo.treino_id)
          .sort((a, b) => a.ordem - b.ordem);
        const index = doTreino.findIndex((te) => te.id === treinoExercicioId);
        const destino = direction === "up" ? index - 1 : index + 1;
        if (destino < 0 || destino >= doTreino.length) return;
        await Promise.all([
          supabase.from("treino_exercicios").update({ ordem: doTreino[destino].ordem }).eq("id", doTreino[index].id),
          supabase.from("treino_exercicios").update({ ordem: doTreino[index].ordem }).eq("id", doTreino[destino].id),
        ]);
        await refresh();
      },

      async setTreinoDoDia(diaSemana, treinoId) {
        // Cada dia da semana pertence a no máximo um treino: primeiro tira esse
        // dia de qualquer outro treino que o tivesse, depois atribui ao alvo.
        const outrosComEsseDia = db.treinos.filter(
          (t) => t.id !== treinoId && t.dias_semana.includes(diaSemana),
        );
        await Promise.all(
          outrosComEsseDia.map((t) =>
            supabase
              .from("treinos")
              .update({ dias_semana: t.dias_semana.filter((d) => d !== diaSemana) })
              .eq("id", t.id),
          ),
        );

        if (treinoId) {
          const alvo = db.treinos.find((t) => t.id === treinoId);
          if (alvo && !alvo.dias_semana.includes(diaSemana)) {
            await supabase
              .from("treinos")
              .update({ dias_semana: [...alvo.dias_semana, diaSemana] })
              .eq("id", treinoId);
          }
        }

        await refresh();
      },
    }),
    [db, loading, userEmail, userId, refresh, supabase],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore precisa estar dentro de <AppStoreProvider>");
  return ctx;
}
