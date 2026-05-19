import type { Metadata } from "next";
import type { Locale, Category } from "@/lib/types";
import { getArticlesByCategory } from "@/lib/store";
import { CATEGORIES, LOCALES, categoryLabels, categoryEmojis, t } from "@/lib/i18n";
import { buildCategoryMetadata } from "@/lib/seo";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ locale: Locale; category: Category }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  if (!categoryLabels[category]) return { title: "DzWire" };
  const label = categoryLabels[category][locale];
  const descs: Record<Locale, string> = {
    fr: `Toute l'actualité ${label} en Algérie — DzWire.`,
    ar: `جميع أخبار ${label} في الجزائر — DzWire.`,
    en: `All ${label} news from Algeria — DzWire.`,
  };
  return buildCategoryMetadata(category, label, locale, descs[locale]);
}

export default async function CategoryPage({ params }: Props) {
  const { locale, category } = await params;
  if (!categoryLabels[category]) notFound();

  const label = categoryLabels[category][locale];
  const emoji = categoryEmojis[category] ?? "📰";
  const articles = getArticlesByCategory(category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav
        className="flex items-center gap-2 text-sm mb-6"
        style={{ color: "var(--text-muted)" }}
      >
        <Link href={`/${locale}`} className="transition-colors hover:text-green-400">
          {t(locale, "home")}
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      </nav>

      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">{emoji}</span>
        <div>
          <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
            {label}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {articles.length > 0
              ? locale === "ar"
                ? `${articles.length} مقال`
                : locale === "en"
                ? `${articles.length} articles`
                : `${articles.length} articles`
              : ""}
          </p>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          <p className="text-lg">{t(locale, "noArticles")}</p>
        </div>
      ) : (
        <>
          {articles.length > 0 && (
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 pb-8"
              style={{ borderBottom: "1px solid var(--border-default)" }}
            >
              {articles.slice(0, 2).map((article) => (
                <ArticleCard key={article.id} article={article} locale={locale} variant="default" />
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(2).map((article) => (
              <ArticleCard key={article.id} article={article} locale={locale} variant="default" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  return CATEGORIES.flatMap((category) =>
    LOCALES.map((locale) => ({ locale, category }))
  );
}
