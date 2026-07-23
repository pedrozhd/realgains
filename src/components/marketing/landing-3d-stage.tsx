"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initScene, type SceneHandle } from "./three/scene";
import { PAINEIS } from "./landing-copy";

gsap.registerPlugin(ScrollTrigger);

export default function LandingStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    let handle: SceneHandle | null = null;
    let cancelado = false;
    const ctx = gsap.context(() => {}, stage);

    (async () => {
      try {
        const scene = await initScene(canvas, {
          onProgress: (event) => {
            if (!event.total) return;
            setProgress(Math.min(100, (event.loaded / event.total) * 100));
          },
        });
        if (cancelado) {
          scene.dispose();
          return;
        }
        handle = scene;
        setProgress(100);
        setCarregado(true);

        const { camera, model } = scene;
        model.position.x += 0.4;

        ctx.add(() => {
          // Timeline do giro/translação do iPhone, atrelada ao scroll do palco.
          const tl = gsap.timeline({
            scrollTrigger: { trigger: stage, start: "top top", end: "bottom bottom", scrub: 1 },
          });
          tl.to(model.rotation, { y: -0.5, x: -0.05, duration: 1 }, 0)
            .to(model.position, { x: -0.5, duration: 1 }, 0)
            .to(model.rotation, { y: 0.55, x: -0.18, duration: 1 }, 1)
            .to(model.position, { x: 0.55, y: -0.05, duration: 1 }, 1)
            .to(camera.position, { z: 4.6, duration: 1 }, 1)
            .to(model.rotation, { y: -0.6, x: 0.05, duration: 1 }, 2)
            .to(model.position, { x: -0.45, y: 0, duration: 1 }, 2)
            .to(camera.position, { z: 6.2, duration: 1 }, 2);

          // Barra de progresso do scroll.
          ScrollTrigger.create({
            trigger: stage,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
              if (progressRef.current) progressRef.current.style.width = `${self.progress * 100}%`;
            },
          });

          // Reveal de cada painel ao entrar na viewport.
          stage.querySelectorAll<HTMLElement>(".rg-panel__inner").forEach((el) => {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el.closest(".rg-panel"),
                start: "top 55%",
                end: "bottom 45%",
                toggleActions: "play reverse play reverse",
              },
            });
          });
        });
      } catch (error) {
        // Falha ao iniciar o WebGL ou carregar o GLB: falha "aberta" (libera a
        // página) em vez de deixar o loader fullscreen travado pra sempre.
        console.error("Falha ao carregar a cena 3D da landing:", error);
        if (!cancelado) setCarregado(true);
      }
    })();

    return () => {
      cancelado = true;
      ctx.revert();
      if (handle) handle.dispose();
    };
  }, []);

  return (
    <>
      {!carregado && (
        <div className="rg-loader" role="status">
          <span className="rg-loader__word">REALGAINS</span>
          <div className="rg-loader__bar">
            <div className="rg-loader__bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="rg-scroll-progress" aria-hidden>
        <div ref={progressRef} className="rg-scroll-progress__fill" />
      </div>

      <section ref={stageRef} className="rg-stage">
        <canvas ref={canvasRef} className="rg-canvas" />

        {PAINEIS.map((p, i) => (
          <div key={i} className="rg-panel" data-panel={i}>
            <div className={`rg-panel__inner${p.align === "right" ? " rg-panel__inner--right" : ""}`}>
              <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-primary uppercase">{p.eyebrow}</p>
              <h2 className="mb-5 text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-bold tracking-tight whitespace-pre-line">
                {p.headline}
              </h2>
              {p.lede && (
                <p className="max-w-[34ch] text-[1.05rem] leading-relaxed text-muted-foreground">{p.lede}</p>
              )}
              {p.stats && (
                <div className="mt-4 flex justify-end gap-12">
                  {p.stats.map((s) => (
                    <div key={s.label} className="flex flex-col items-end">
                      <span className="text-4xl font-bold tracking-tight text-primary">{s.num}</span>
                      <span className="text-xs tracking-[0.06em] text-muted-foreground uppercase">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {p.hint && (
                <div className="mt-14 flex items-center gap-3 text-[0.7rem] tracking-[0.1em] text-muted-foreground uppercase">
                  <span>role para explorar</span>
                  <span className="relative block h-px w-10 overflow-hidden bg-muted-foreground">
                    <span className="absolute inset-0 bg-primary [animation:rg-scroll-line_1.6s_ease-in-out_infinite]" />
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
