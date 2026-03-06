import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Models Agency — Virtual Try-On & Influencer AI",
  description:
    "Plataforma AaaS (Avatar as a Service) para geração de modelos sintéticas e troca de roupas virtual com IA. Powered by Fal.ai FLUX & FASHN.",
  keywords: [
    "AI models",
    "virtual try-on",
    "influencer AI",
    "moda IA",
    "fal.ai",
    "avatar as a service",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
