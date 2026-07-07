import type { Metadata, Viewport } from "next";
import { satoshi } from "./fonts";
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
  themeColor: "#eef0f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${satoshi.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background">{children}</body>
    </html>
  );
}
