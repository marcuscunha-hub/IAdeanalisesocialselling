import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Selling AI",
  description: "Análise de performance de Social Selling por IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-950 text-white min-h-screen">{children}</body>
    </html>
  );
}
