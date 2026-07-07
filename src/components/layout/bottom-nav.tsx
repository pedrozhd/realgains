"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CirclePlus, Dumbbell, History, LayoutGrid } from "lucide-react";

const TABS = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/registro", label: "Registro", icon: CirclePlus },
  { href: "/treino", label: "Meu Treino", icon: Dumbbell },
  { href: "/exercicios", label: "Histórico", icon: History },
] as const;

export function BottomNav() {
  const pathname = usePathname();

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
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-2xl py-2 active:opacity-70 ${
                active ? "shadow-soft-pressed bg-background" : ""
              }`}
            >
              <Icon size={20} strokeWidth={2} className={active ? "text-primary" : "text-muted-foreground"} />
              <span className={`text-[10px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
