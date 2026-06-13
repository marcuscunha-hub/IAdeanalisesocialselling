import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Selling AI — Full Sales System",
  description: "Análise de performance de Social Sellers com IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
