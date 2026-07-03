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
    <nav
      className="grid flex-none grid-cols-4 border-t border-border bg-background"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 py-3.5 active:opacity-70">
            <Icon size={22} strokeWidth={2} className={active ? "text-foreground" : "text-muted-foreground"} />
            <span className={`text-[11px] font-bold ${active ? "text-foreground" : "text-muted-foreground"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
