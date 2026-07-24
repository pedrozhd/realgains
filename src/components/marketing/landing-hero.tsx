"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PAINEIS, type Panel } from "./landing-copy";

// ssr:false só é permitido em Client Component (por isso este wrapper existe).
// Ver node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md.
const LandingStage = dynamic(() => import("./landing-3d-stage"), { ssr: false });

const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function PainelResumo({ p, align = "left" }: { p: Panel; align?: "left" | "center" }) {
  const centralizado = align === "center";
  return (
    <div>
      <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-primary uppercase">{p.eyebrow}</p>
      <h2 className="mb-3 text-3xl font-bold tracking-tight whitespace-pre-line sm:text-4xl">{p.headline}</h2>
      {p.lede && (
        <p className={cn("max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground", centralizado && "mx-auto")}>
          {p.lede}
        </p>
      )}
      {p.stats && (
        <div className={cn("mt-4 flex gap-12", centralizado && "justify-center")}>
          {p.stats.map((s) => (
            <div key={s.label} className={cn("flex flex-col", centralizado && "items-center")}>
              <span className="text-4xl font-bold tracking-tight text-primary">{s.num}</span>
              <span className="text-xs tracking-[0.06em] text-muted-foreground uppercase">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LandingHero() {
  // undefined enquanto não checou no cliente (evita mismatch de hidratação).
  const [reduzido, setReduzido] = useState<boolean | undefined>(undefined);
  const [ehMobile, setEhMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // matchMedia só existe no cliente — não há alternativa em tempo de render
    // que evite o mismatch de hidratação (por isso o placeholder abaixo).
    const mqReduzido = window.matchMedia(REDUCED_MOTION_QUERY);
    const mqMobile = window.matchMedia(MOBILE_QUERY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduzido(mqReduzido.matches);
    setEhMobile(mqMobile.matches);
    const onChangeReduzido = (e: MediaQueryListEvent) => setReduzido(e.matches);
    const onChangeMobile = (e: MediaQueryListEvent) => setEhMobile(e.matches);
    mqReduzido.addEventListener("change", onChangeReduzido);
    mqMobile.addEventListener("change", onChangeMobile);
    return () => {
      mqReduzido.removeEventListener("change", onChangeReduzido);
      mqMobile.removeEventListener("change", onChangeMobile);
    };
  }, []);

  // Antes de resolver as duas preferências, reserva a altura da viewport (sem CLS).
  if (reduzido === undefined || ehMobile === undefined) return <div className="min-h-dvh" aria-hidden />;

  if (ehMobile) {
    // Mobile: sem celular — nem o palco 3D, nem o mockup estático. A cena foi
    // calibrada pra proporção larga do desktop e não cabe num viewport
    // estreito sem sobrepor o texto. Só o texto dos painéis, centralizado.
    return (
      <section className="mx-auto grid max-w-xl gap-12 px-6 py-16 text-center">
        {PAINEIS.map((p, i) => (
          <PainelResumo key={i} p={p} align="center" />
        ))}
      </section>
    );
  }

  if (reduzido) {
    // Fallback estático (desktop, reduced-motion): painéis empilhados + imagem do app (sem Three.js/Draco).
    return (
      <section className="mx-auto grid max-w-6xl gap-16 px-6 py-16">
        <div className="relative mx-auto w-full max-w-[260px]">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
            <Image
              src="/marketing/dashboard-preview.png"
              alt="Tela inicial do RealGains com o treino do dia e o volume semanal"
              width={390}
              height={844}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
        <div className="grid gap-12">
          {PAINEIS.map((p, i) => (
            <PainelResumo key={i} p={p} />
          ))}
        </div>
      </section>
    );
  }

  return <LandingStage />;
}
