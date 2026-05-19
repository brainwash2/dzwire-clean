import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "DzWire — Actualités Algériennes",
    template: "%s | DzWire",
  },
  description:
    "DzWire : la plateforme trilingue d'actualités algériennes. Politique, économie, tech, culture et sport en français, arabe et anglais.",
  keywords: ["Algérie", "actualités", "news", "DzWire", "الجزائر", "أخبار", "Algeria"],
  openGraph: { type: "website", siteName: "DzWire" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
