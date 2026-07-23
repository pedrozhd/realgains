"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { PAINEIS } from "./landing-copy";

// ssr:false só é permitido em Client Component (por isso este wrapper existe).
// Ver node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md.
const LandingStage = dynamic(() => import("./landing-3d-stage"), { ssr: false });

export default function LandingHero() {
  // undefined enquanto não checou no cliente (evita mismatch de hidratação).
  const [reduzido, setReduzido] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // matchMedia só existe no cliente — não há alternativa em tempo de render
    // que evite o mismatch de hidratação (por isso o placeholder acima).
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduzido(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduzido(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Antes de resolver a preferência, reserva a altura da viewport (sem CLS).
  if (reduzido === undefined) return <div className="min-h-dvh" aria-hidden />;

  if (reduzido) {
    // Fallback estático: painéis empilhados + imagem do app (sem Three.js/Draco).
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
            <div key={i}>
              <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-primary uppercase">{p.eyebrow}</p>
              <h2 className="mb-3 text-3xl font-bold tracking-tight whitespace-pre-line sm:text-4xl">{p.headline}</h2>
              {p.lede && <p className="max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">{p.lede}</p>}
              {p.stats && (
                <div className="mt-4 flex gap-12">
                  {p.stats.map((s) => (
                    <div key={s.label} className="flex flex-col">
                      <span className="text-4xl font-bold tracking-tight text-primary">{s.num}</span>
                      <span className="text-xs tracking-[0.06em] text-muted-foreground uppercase">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return <LandingStage />;
}
