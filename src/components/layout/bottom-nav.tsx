"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CirclePlus, Dumbbell, History, LayoutGrid } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/registro", label: "Registro", icon: CirclePlus },
  { href: "/treino", label: "Meu Treino", icon: Dumbbell },
  { href: "/exercicios", label: "Histórico", icon: History },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const activeIndex = TABS.findIndex((t) => pathname.startsWith(t.href));

  return (
    // No fluxo normal (reserva sua própria linha) — testado em dispositivo
    // real, um nav flutuante por cima do conteúdo deixava a área útil de
    // rolagem curta demais e escondia permanentemente o fim das listas.
    // Sombra e recorte arredondado ficam em elementos separados: aplicar box-shadow
    // junto com backdrop-blur + overflow-hidden no mesmo nó faz alguns navegadores
    // quebrarem o clip nos cantos e pintar um retângulo sólido ali em vez de recortar.
    <nav
      className="relative mx-4 flex-none rounded-3xl"
      style={{ marginBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
    >
      <div className="shadow-soft-elevated absolute inset-0 rounded-3xl bg-card" />
      <div className="relative grid grid-cols-4 gap-1 px-2 py-2">
        {activeIndex !== -1 && (
          // Pílula que desliza pra baixo da aba ativa em vez de simplesmente
          // trocar de lugar — gap-1 (0.25rem) entra na conta pra a largura e o
          // deslocamento baterem exatamente com as 4 colunas do grid.
          <div
            aria-hidden
            className="shadow-soft-pressed absolute inset-y-0 rounded-2xl bg-background transition-transform duration-300 ease-out"
            style={{
              width: "calc((100% - 0.75rem) / 4)",
              transform: `translateX(calc(${activeIndex} * ((100% - 0.75rem) / 4 + 0.25rem)))`,
            }}
          />
        )}
        {TABS.map(({ href, label, icon: Icon }, index) => {
          const active = index === activeIndex;
          return (
            <Link
              key={href}
              href={href}
              className="relative z-10 flex flex-col items-center gap-0.5 rounded-2xl py-2 active:opacity-70"
            >
              <Icon
                size={20}
                strokeWidth={2}
                className={`transition-colors duration-300 ${active ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`text-[10px] font-bold transition-colors duration-300 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
