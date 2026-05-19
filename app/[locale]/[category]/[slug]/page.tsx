import type { Metadata } from "next";
import type { Locale, Category } from "@/lib/types";
import { getArticleBySlug, getArticlesByCategory, getViewCount } from "@/lib/store";
import { getServerSession } from "@/lib/auth-server";
import { categoryLabels, t, getText, formatDate } from "@/lib/i18n";
import { buildArticleMetadata, newsArticleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import ArticleCard from "@/components/ArticleCard";
import GlossaryTooltip from "@/components/GlossaryTooltip";
import PaywallBlock from "@/components/PaywallBlock";
import AdUnit from "@/components/AdUnit";
import ReadingTime from "@/components/ReadingTime";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import ShareBar from "@/components/ShareBar";
import ViewCounter from "@/components/ViewCounter";
import Link from "next/link";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://dzwire.replit.app";

interface Props {
  params: Promise<{ locale: Locale; category: Category; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const article = getArticleBySlug(locale, category, slug);
  if (!article) return { title: "Article not found" };
  return buildArticleMetadata(article, locale);
}

export default async function ArticleDetailPage({ params }: Props) {
  const { locale, category, slug } = await params;
  const article = getArticleBySlug(locale, category, slug);
  if (!article) notFound();

  const session = await getServerSession();
  const hasAccess = !article.isPremium || !!session?.subscription;

  const title = getText(article.title, locale);
  const content = getText(article.content, locale);
  const excerpt = getText(article.excerpt, locale);
  const categoryLabel = categoryLabels[category]?.[locale] ?? category;
  const related = getArticlesByCategory(category)
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  const canonicalUrl = `${BASE_URL}/${locale}/${category}/${slug}`;
  const initialViews = getViewCount(article.id);

  const articleJsonLd = newsArticleJsonLd({
    url: canonicalUrl,
    headline: title,
    image: article.imageUrl,
    datePublished: article.publishedAt,
    description: excerpt,
    source: article.source,
    keywords: article.tags,
    locale,
  });

  const breadcrumb = breadcrumbJsonLd([
    { name: "DzWire", url: `${BASE_URL}/${locale}` },
    { name: categoryLabel, url: `${BASE_URL}/${locale}/${category}` },
    { name: title, url: canonicalUrl },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <ReadingProgressBar articleId={article.id} />

      <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap" style={{ color: "var(--text-muted)" }}>
        <Link href={`/${locale}`} className="transition-colors hover:text-green-400">
          {t(locale, "home")}
        </Link>
        <span>/</span>
        <Link href={`/${locale}/${category}`} className="transition-colors hover:text-green-400">
          {categoryLabel}
        </Link>
        <span>/</span>
        <span className="line-clamp-1" style={{ color: "var(--text-secondary)" }}>{title}</span>
      </nav>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        {article.isPremium && (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{ background: "var(--accent-magenta)", color: "#fff" }}
          >
            ⚡ Premium
          </span>
        )}
        {article.isSponsored && (
          <span
            className="inline-block text-xs font-semibold px-2 py-1 rounded-lg"
            style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}
          >
            {locale === "ar" ? "ممول" : locale === "en" ? "Sponsored" : "Sponsorisé"}
          </span>
        )}
        <ReadingTime text={content} locale={locale} />
        <ViewCounter articleId={article.id} initialViews={initialViews} />
      </div>

      <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-5" style={{ color: "var(--text-primary)" }}>
        {title}
      </h1>

      <div className="flex items-center gap-4 text-sm mb-8 flex-wrap" style={{ color: "var(--text-muted)" }}>
        <span>
          {t(locale, "source")}:{" "}
          <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-green)" }}>
            {article.source}
          </a>
        </span>
        <span>{t(locale, "publishedAt")}: {formatDate(article.publishedAt, locale)}</span>
        {article.curatedBy && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--accent-green-dim)", color: "var(--accent-green)" }}
          >
            ✓ {article.curatedBy}
          </span>
        )}
      </div>

      {article.imageUrl && (
        <div className="relative w-full rounded-2xl overflow-hidden mb-8" style={{ aspectRatio: "16/9" }}>
          <img src={article.imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {hasAccess ? (
        <div className="text-lg leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
          {locale === "fr" ? (
            <GlossaryTooltip content={content} />
          ) : (
            <p>{content}</p>
          )}
        </div>
      ) : (
        <PaywallBlock locale={locale} isLoggedIn={!!session} />
      )}

      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map((tag) => (
            <Link
              key={tag}
              href={`/${locale}/recherche?q=${encodeURIComponent(tag)}`}
              className="text-xs px-3 py-1 rounded-full transition-all hover:border-green-400"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-muted)",
                border: "1px solid var(--border-default)",
              }}
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <ShareBar url={canonicalUrl} title={title} locale={locale} />

      <div className="my-8">
        <AdUnit placement="article-inline" locale={locale} />
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-black mb-6" style={{ color: "var(--text-primary)" }}>
            {t(locale, "relatedArticles")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
