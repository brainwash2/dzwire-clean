import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import GlobeClient from "@/components/GlobeClient";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<Locale, string> = {
    fr: "Le Globe — Actualités mondiales",
    ar: "الغلوب — أخبار العالم",
    en: "The Globe — World News",
  };
  const descs: Record<Locale, string> = {
    fr: "Actualités internationales groupées par région — MENA, Afrique, Europe et Monde.",
    ar: "أخبار دولية مصنّفة حسب المنطقة — الشرق الأوسط وأفريقيا وأوروبا والعالم.",
    en: "International news grouped by region — MENA, Africa, Europe, and World.",
  };
  return { title: titles[locale], description: descs[locale] };
}

const PAGE_LABELS: Record<Locale, { title: string; subtitle: string }> = {
  fr: {
    title: "🌐 Le Globe",
    subtitle: "Actualités mondiales en temps réel, groupées par région",
  },
  ar: {
    title: "🌐 الغلوب",
    subtitle: "أخبار العالم في الوقت الفعلي، مصنّفة حسب المنطقة",
  },
  en: {
    title: "🌐 The Globe",
    subtitle: "Real-time world news grouped by region",
  },
};

export default async function GlobePage({ params }: Props) {
  const { locale } = await params;
  const lb = PAGE_LABELS[locale];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <h1
            className="text-3xl font-black"
            style={{ color: "var(--text-primary)" }}
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {lb.title}
          </h1>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full animate-pulse"
            style={{ background: "var(--accent-green-dim)", color: "var(--accent-green)" }}
          >
            LIVE
          </span>
        </div>
        <p
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          {lb.subtitle}
        </p>
      </div>

      <GlobeClient locale={locale} />
    </div>
  );
}
