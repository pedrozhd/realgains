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
    // Fora do fluxo (absolute) pra flutuar sobre o `main` rolável, em vez de
    // reservar sua própria linha no layout — é isso que permite o conteúdo
    // passar por baixo e aparecer através do vidro.
    // Sombra e recorte arredondado ficam em elementos separados: aplicar box-shadow
    // junto com backdrop-blur + overflow-hidden no mesmo nó faz alguns navegadores
    // quebrarem o clip nos cantos e pintar um retângulo sólido ali em vez de recortar.
    <nav
      className="absolute inset-x-4 rounded-3xl shadow-[0_12px_28px_-8px_rgba(0,0,0,0.65)]"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
    >
      <div className="absolute inset-0 rounded-3xl border border-border/60 bg-card/90 backdrop-blur-xl" />
      <div className="relative grid grid-cols-4 gap-1 px-2 py-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-2xl py-2 active:opacity-70 ${
                active ? "bg-foreground/10" : ""
              }`}
            >
              <Icon size={20} strokeWidth={2} className={active ? "text-foreground" : "text-muted-foreground"} />
              <span className={`text-[10px] font-bold ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
