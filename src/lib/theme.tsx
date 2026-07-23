const STORAGE_KEY = "realgains-theme";

/**
 * O app é dark-only (não há mais toggle). Este script roda antes da hidratação
 * e garante a classe "dark" no <html> de cara, evitando qualquer flash do tema
 * claro (que segue definido em :root só como fallback morto). Mantém a limpeza
 * de qualquer valor legado salvo no localStorage.
 */
const THEME_INIT_SCRIPT = `
(function () {
  try {
    document.documentElement.classList.add("dark");
    if (localStorage.getItem("${STORAGE_KEY}")) localStorage.removeItem("${STORAGE_KEY}");
  } catch (e) {}
})();
`;

/**
 * Script inline "puro" dispararia o warning de dev do React sobre <script>
 * renderizado por componente — a correção documentada pra essa versão do Next
 * é a troca de `type` server/client + suppressHydrationWarning (ver
 * node_modules/next/dist/docs/.../preventing-flash-before-hydration.md).
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
