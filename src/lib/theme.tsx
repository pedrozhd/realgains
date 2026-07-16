"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

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

export function ThemeProvider({ children }: { children: ReactNode }) {
  // O <html> já chega com a classe certa (script inline no <head>, antes da
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

  // Segue a preferência do sistema em tempo real, mas só enquanto o usuário
  // nunca escolheu manualmente um tema nesse navegador.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const proximo = mq.matches ? "dark" : "light";
      applyTheme(proximo);
      setTheme(proximo);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme precisa estar dentro de <ThemeProvider>");
  return ctx;
}
