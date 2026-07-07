"use client";

import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { AccountSheet } from "@/components/layout/account-sheet";
import { Button } from "@/components/ui/button";
import { ExercicioGrid } from "@/components/dashboard/exercicio-grid";
import { TreinoDeHojeCard } from "@/components/dashboard/treino-de-hoje-card";
import { VolumeSemanalCard } from "@/components/dashboard/volume-semanal-card";
import { TypographyH4, TypographyMuted } from "@/components/ui/typography";
import { getDashboardData } from "@/lib/dashboard";
import { useAppStore } from "@/lib/store";

export default function DashboardPage() {
  const { treinos, treinoExercicios, exercicios, series, loading, userEmail, nome, updateNome } = useAppStore();
  const [contaAberta, setContaAberta] = useState(false);

  const userName = nome?.trim() ? nome.trim().split(" ")[0] : userEmail ? userEmail.split("@")[0] : "Você";

  return (
    <>
      <AppHeader variant="dashboard" userName={userName} onAvatarClick={() => setContaAberta(true)} />
      <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6">
        {loading ? (
          <TypographyMuted className="flex-1 py-10 text-center">Carregando...</TypographyMuted>
        ) : treinos.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
            <TypographyH4>Nenhum treino cadastrado ainda</TypographyH4>
            <TypographyMuted className="max-w-[26ch]">
              Crie seus treinos e defina sua semana para começar a registrar suas séries.
            </TypographyMuted>
            <Button render={<Link href="/treino" />} nativeButton={false} className="mt-2 h-11 rounded-xl px-5">
              Ir para Meu Treino
            </Button>
          </div>
        ) : (
          (() => {
            const dashboard = getDashboardData(treinos, treinoExercicios, exercicios, series);
            return (
              <>
                {dashboard.treino ? (
                  <>
                    <TreinoDeHojeCard treino={dashboard.treino} />
                    <ExercicioGrid exercicios={dashboard.exercicios} />
                  </>
                ) : (
                  <section className="shadow-soft-elevated flex flex-col items-center gap-1.5 rounded-2xl bg-card p-6 text-center">
                    <TypographyH4>Hoje é seu dia de descanso 🎉</TypographyH4>
                    <TypographyMuted className="max-w-[28ch]">
                      Nenhum treino está agendado para hoje. Ajuste sua semana em &ldquo;Meu Treino&rdquo;.
                    </TypographyMuted>
                  </section>
                )}
                <VolumeSemanalCard dados={dashboard.volumeSemanal} />
              </>
            );
          })()
        )}
      </main>

      <AccountSheet
        open={contaAberta}
        onOpenChange={setContaAberta}
        email={userEmail}
        nome={nome}
        onUpdateNome={updateNome}
      />
    </>
  );
}
