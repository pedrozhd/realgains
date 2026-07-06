import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AppStoreProvider } from "@/lib/store";

// A checagem de auth já acontece no proxy.ts (roda antes de qualquer rota
// nesse grupo ser alcançada) — repetir supabase.auth.getUser() aqui só
// adiciona uma segunda ida-e-volta de rede a cada navegação, sem ganho real.
export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <AppStoreProvider>
      {/* h-svh (não h-dvh): a altura dinâmica recalcula ao vivo quando a barra
          do Safari esconde/aparece durante a rolagem, e isso deixava vão no
          topo e cortava o nav embaixo. svh trava no tamanho "com a barra
          visível" e não oscila. */}
      <div className="mx-auto flex h-svh w-full max-w-[430px] flex-col bg-background text-foreground">
        {children}
        <BottomNav />
      </div>
    </AppStoreProvider>
  );
}
