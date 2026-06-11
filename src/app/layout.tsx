import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniGC — Gerador de Currículos",
  description:
    "Monte um currículo profissional em minutos com ajuda de IA. Leve e privado: nada é salvo — os dados ficam só no seu navegador e são apagados ao baixar ou sair.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
