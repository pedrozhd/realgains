import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // "auth" fica de fora: /auth/callback processa a confirmação de e-mail /
  // magic link antes de existir sessão, então gatear essa rota atrás do
  // login (como as demais) impede a troca do code por sessão de completar.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
