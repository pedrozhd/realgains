import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AppStoreProvider } from "@/lib/store";

// A checagem de auth já acontece no proxy.ts (roda antes de qualquer rota
// nesse grupo ser alcançada) — repetir supabase.auth.getUser() aqui só
// adiciona uma segunda ida-e-volta de rede a cada navegação, sem ganho real.
export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <AppStoreProvider>
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col bg-background text-foreground">
        {children}
        <BottomNav />
      </div>
    </AppStoreProvider>
  );
}
