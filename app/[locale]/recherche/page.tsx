import type { Metadata } from "next";
import { Suspense } from "react";
import type { Locale } from "@/lib/types";
import { getAllArticles } from "@/lib/store";
import SearchClient from "./SearchClient";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "fr" ? "DzWire — Recherche" : "DzWire — البحث",
  };
}

export default async function RecherchePage({ params }: Props) {
  const { locale } = await params;
  const articles = getAllArticles();
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-12 text-sm text-[var(--text-muted)]">Loading…</div>}>
      <SearchClient articles={articles} locale={locale} />
    </Suspense>
  );
}
