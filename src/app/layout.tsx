import type { Metadata, Viewport } from "next";
import { satoshi } from "./fonts";
import { ThemeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "TapGym",
  description: "Progressão de carga com foco em qualidade de execução",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#08090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${satoshi.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background">
        <ThemeInitScript />
        {children}
      </body>
    </html>
  );
}
