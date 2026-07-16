import type { Metadata, Viewport } from "next";
import { satoshi } from "./fonts";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "RealGains",
  description: "Progressão de carga com foco em qualidade de execução",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef0f3" },
    { media: "(prefers-color-scheme: dark)", color: "#15171b" },
  ],
};

// Roda antes da hidratação pra aplicar a classe "dark" no <html> de cara —
// sem isso, a página sempre pisca no tema claro por um instante (o React só
// saberia o tema certo depois de montar o ThemeProvider).
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var tema = localStorage.getItem("realgains-theme");
    if (!tema) tema = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    if (tema === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${satoshi.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
