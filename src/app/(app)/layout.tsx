import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AppStoreProvider } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";

export default async function AppShellLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <AppStoreProvider>
      <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col bg-background text-foreground">
        {children}
        <BottomNav />
      </div>
    </AppStoreProvider>
  );
}
