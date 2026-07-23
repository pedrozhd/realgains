import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // "auth" fica de fora: /auth/callback processa a confirmação de e-mail /
  // magic link antes de existir sessão, então gatear essa rota atrás do
  // login (como as demais) impede a troca do code por sessão de completar.
  // "models"/"draco" ficam de fora: são os assets estáticos do palco 3D da
  // landing (modelo .glb + decoder Draco) — sem essa exclusão, um visitante
  // sem sessão era redirecionado pro /login ao tentar baixá-los.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|auth|models/|draco/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|glb|wasm)$).*)",
  ],
};
