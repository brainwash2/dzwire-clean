import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDir, LOCALES } from "@/lib/i18n";
import { websiteJsonLd } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConsentBanner from "@/components/ConsentBanner";
import BottomNav from "@/components/BottomNav";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://dzwire.replit.app";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "fr-DZ": "/fr",
        "ar-DZ": "/ar",
        "x-default": "/fr",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  const dir = getDir(locale);
  const jsonLd = websiteJsonLd();

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning style={{ fontFamily: dir === "rtl" ? "var(--font-arabic)" : "var(--font-inter)", minHeight: "100vh", background: "var(--bg-base)" }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Header locale={locale} />
        <main className="pb-20 md:pb-0">{children}</main>
        <Footer locale={locale} />
        <BottomNav locale={locale} />
        <ConsentBanner locale={locale} />
      </body>
    </html>
  );
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}
