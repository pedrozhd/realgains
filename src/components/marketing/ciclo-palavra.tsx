"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface CicloPalavraProps {
  palavras: string[];
  intervaloMs?: number;
}

/**
 * Palavra que alterna a cada `intervaloMs`, com uma animação de entrada/saída
 * vertical (GSAP). Respeita prefers-reduced-motion: fica parada na primeira
 * palavra, sem nunca iniciar o intervalo.
 */
export function CicloPalavra({ palavras, intervaloMs = 2200 }: CicloPalavraProps) {
  const [indice, setIndice] = useState(0);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (palavras.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      const el = spanRef.current;
      if (!el) return;
      gsap.to(el, {
        y: -16,
        opacity: 0,
        duration: 0.28,
        ease: "power2.in",
        onComplete: () => {
          setIndice((i) => (i + 1) % palavras.length);
          gsap.fromTo(el, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: "power2.out" });
        },
      });
    }, intervaloMs);

    return () => window.clearInterval(id);
  }, [palavras, intervaloMs]);

  return (
    <span ref={spanRef} className="inline-block text-primary">
      {palavras[indice]}
    </span>
  );
}
