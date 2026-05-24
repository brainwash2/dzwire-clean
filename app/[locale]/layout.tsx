import React from "react";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import ConsentBanner from "@/components/ConsentBanner";
import MarketTicker from "@/components/MarketTicker";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css"; // Direct, local CSS import

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
  
  // Fetch dynamic localization messages for NextIntl Client context
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <html lang={locale} dir={dir} className="dark">
        <body className={`${inter.className} bg-black text-white antialiased min-h-screen flex flex-col`}>
          <NextIntlClientProvider messages={messages}>
            {/* Infinite financial cross-rates ticker */}
            <MarketTicker locale={locale as any} />
            
            <Header locale={locale as any} />
            
            {/* Restored to original full-width container to prevent layout breakages */}
            <main className="min-h-screen bg-black text-white">
              {children}
            </main>
            
            <Footer locale={locale as any} />
            <ConsentBanner locale={locale as any} />
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
