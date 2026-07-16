"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "realgains-theme";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/**
 * Roda antes da hidratação pra aplicar a classe "dark" no <html> de cara —
 * sem isso, a página sempre pisca no tema claro por um instante. Escuro é o
 * padrão enquanto o usuário não escolher manualmente (ver toggleTheme).
 */
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var tema = localStorage.getItem("${STORAGE_KEY}") || "dark";
    if (tema === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

/**
 * Script inline "puro" (nem next/script) dispararia o warning de dev do
 * React sobre <script> renderizado por componente — a correção documentada
 * pra essa versão do Next é essa troca de `type` server/client + o
 * suppressHydrationWarning no próprio script, não só no elemento que ele
 * altera (ver node_modules/next/dist/docs/.../preventing-flash-before-hydration.md).
 */
export function ThemeInitScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // O <html> já chega com a classe certa (ThemeInitScript, antes da
  // hidratação) — aqui só espelhamos isso pro estado do React.
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light",
  );

  const toggleTheme = useCallback(() => {
    setTheme((atual) => {
      const proximo = atual === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, proximo);
      applyTheme(proximo);
      return proximo;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme precisa estar dentro de <ThemeProvider>");
  return ctx;
}
