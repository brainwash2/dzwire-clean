import type { Metadata } from "next";
import type { Locale, Category } from "@/lib/types";
import { getAllArticles, getWeather, getHolidays, getDigest, getBreakingArticle } from "@/lib/store";
import { CATEGORIES, categoryLabels, categoryEmojis, t, getDigestText } from "@/lib/i18n";
import { websiteJsonLd } from "@/lib/seo";
import TrendingBar from "@/components/TrendingBar";
import HeroCarousel from "@/components/HeroCarousel";
import ArticleCard from "@/components/ArticleCard";
import MostRead from "@/components/MostRead";
import BreakingBanner from "@/components/BreakingBanner";
import Link from "next/link";

interface Props {
  params: Promise<{ locale: Locale }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://dzwire.replit.app";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<Locale, string> = {
    fr: "DzWire — Actualités Algériennes",
    ar: "DzWire — أخبار الجزائر",
    en: "DzWire — Algerian News",
  };
  const descs: Record<Locale, string> = {
    fr: "Toute l'actualité algérienne en français et en arabe — politique, économie, tech, sport.",
    ar: "جميع الأخبار الجزائرية بالفرنسية والعربية — السياسة والاقتصاد والتكنولوجيا والرياضة.",
    en: "All Algerian news in French, Arabic, and English — politics, economy, tech, sport.",
  };
  return {
    title: titles[locale],
    description: descs[locale],
    metadataBase: new URL(BASE_URL),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const articles = getAllArticles();
  const weather = getWeather();
  const holidays = getHolidays();
  const digest = getDigest();
  const breaking = getBreakingArticle();

  const heroArticles = articles.slice(0, 5);
  const remainingArticles = articles.slice(5);
  const digestText = digest ? getDigestText(digest, locale) : undefined;
  const seeAllLabel = t(locale, "seeAll");

  const jsonLd = websiteJsonLd();

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {breaking && (
        <BreakingBanner locale={locale} article={breaking} />
      )}

      <TrendingBar locale={locale} weather={weather} holidays={holidays} digest={digestText} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {heroArticles.length > 0 && (
          <section className="mb-12">
            <HeroCarousel articles={heroArticles} locale={locale} />
          </section>
        )}

        {/* Category horizontal scrolls */}
        {CATEGORIES.map((category) => {
          const catArticles = articles.filter((a) => a.category === category).slice(0, 6);
          if (catArticles.length === 0) return null;
          return (
            <section key={category} className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <span
                    className="text-sm px-2.5 py-1 rounded-lg font-bold"
                    style={{ background: "var(--accent-green-dim)", color: "var(--accent-green)" }}
                  >
                    {categoryEmojis[category as Category]} {categoryLabels[category as Category][locale]}
                  </span>
                </h2>
                <Link
                  href={`/${locale}/${category}`}
                  className="text-sm font-semibold transition-colors hover:underline"
                  style={{ color: "var(--accent-green)" }}
                >
                  {seeAllLabel}
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {catArticles.map((article) => (
                  <div key={article.id} className="flex-shrink-0 w-64">
                    <ArticleCard article={article} locale={locale} variant="compact" />
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Latest + Most Read */}
        {remainingArticles.length > 0 && (
          <section className="mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2
                  className="text-xl font-black mb-6 flex items-center gap-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  <span
                    className="w-1 h-6 rounded-full inline-block"
                    style={{
                      background: "var(--accent-green)",
                      boxShadow: "0 0 12px var(--accent-green-glow)",
                    }}
                  />
                  {t(locale, "latestNews")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {remainingArticles.slice(0, 8).map((article) => (
                    <ArticleCard key={article.id} article={article} locale={locale} variant="default" />
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl p-5 h-fit sticky top-20"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <MostRead locale={locale} />

                <div
                  className="mt-6 pt-6"
                  style={{ borderTop: "1px solid var(--border-default)" }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {locale === "ar" ? "تابعنا" : locale === "en" ? "Follow us" : "Suivez-nous"}
                  </p>
                  <a
                    href="https://t.me/dzwire"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: "rgba(0,136,204,0.1)",
                      color: "#0088cc",
                      border: "1px solid rgba(0,136,204,0.2)",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    {locale === "ar" ? "قناة تيليغرام" : locale === "en" ? "Telegram channel" : "Canal Telegram"}
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
