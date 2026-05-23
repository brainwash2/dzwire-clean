import React from "react";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import ConsentBanner from "@/components/ConsentBanner";
import { ClerkProvider } from "@clerk/nextjs";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export async function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "ar" }, { locale: "en" }];
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <ClerkProvider>
      <html lang={locale} dir={dir} className="dark">
        <body className={`${inter.className} bg-black text-white antialiased min-h-screen flex flex-col`}>
          <Header locale={locale as any} />
          <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6">
            {children}
          </main>
          <Footer locale={locale as any} />
          <ConsentBanner locale={locale as any} />
        </body>
      </html>
    </ClerkProvider>
  );
}
