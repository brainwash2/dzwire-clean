import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getAllArticles } from "@/lib/store";
import WireClient from "@/components/WireClient";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<Locale, string> = {
    fr: "Le Wire — Fil d'actualité en direct",
    ar: "الواير — الأخبار المباشرة",
    en: "The Wire — Live News Feed",
  };
  const descs: Record<Locale, string> = {
    fr: "Suivez l'actualité algérienne et mondiale en temps réel sur le fil DzWire.",
    ar: "تابع الأخبار الجزائرية والعالمية في الوقت الفعلي عبر واير DzWire.",
    en: "Follow Algerian and world news in real time on the DzWire feed.",
  };
  return { title: titles[locale], description: descs[locale] };
}

export default async function WirePage({ params }: Props) {
  const { locale } = await params;
  const articles = getAllArticles().slice(0, 100);

  const wireArticles = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    category: a.category,
    source: a.source,
    publishedAt: a.publishedAt,
    imageUrl: a.imageUrl,
  }));

  return (
    <WireClient locale={locale} initialArticles={wireArticles} />
  );
}
