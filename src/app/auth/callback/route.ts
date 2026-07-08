import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * `next` vem de um query param — sem validar, é um open redirect (e um jeito
 * de mandar a vítima pra um link de phishing logo depois do login legítimo).
 * Só aceita paths relativos same-origin; qualquer outra coisa (URL absoluta,
 * "//host" protocol-relative etc.) cai no fallback.
 */
function sanitizeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return "/dashboard";
  }
  return next;
}

/** Handles the redirect back from Supabase email confirmation / magic-link emails. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
