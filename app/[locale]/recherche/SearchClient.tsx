"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Article, Locale, Category } from "@/lib/types";
import { getText, t, CATEGORIES, categoryLabels, categoryEmojis } from "@/lib/i18n";
import ArticleCard from "@/components/ArticleCard";

interface Props {
  articles: Article[];
  locale: Locale;
}

export default function SearchClient({ articles, locale }: Props) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  const results = useMemo(() => {
    let pool = articles;
    if (activeCategory !== "all") {
      pool = pool.filter((a) => a.category === activeCategory);
    }
    if (!query.trim()) return activeCategory !== "all" ? pool.slice(0, 20) : [];
    const q = query.toLowerCase();
    return pool.filter((a) => {
      const title = getText(a.title, locale).toLowerCase();
      const excerpt = getText(a.excerpt, locale).toLowerCase();
      const tags = a.tags.join(" ").toLowerCase();
      return title.includes(q) || excerpt.includes(q) || a.source.toLowerCase().includes(q) || tags.includes(q);
    });
  }, [query, articles, locale, activeCategory]);

  const placeholder =
    locale === "ar" ? "ابحث عن مقالات…" : locale === "en" ? "Search articles…" : "Rechercher des articles…";

  const noResults =
    locale === "ar"
      ? `لا توجد نتائج لـ "${query}"`
      : locale === "en"
      ? `No results for "${query}"`
      : `Aucun résultat pour "${query}"`;

  const hint =
    locale === "ar"
      ? "اكتب للبحث في جميع الأخبار الجزائرية."
      : locale === "en"
      ? "Type to search all Algerian news."
      : "Tapez pour rechercher parmi toute l'actualité algérienne.";

  const allLabel = locale === "ar" ? "الكل" : locale === "en" ? "All" : "Tout";

  const resultsLabel =
    locale === "ar"
      ? `${results.length} نتيجة`
      : locale === "en"
      ? `${results.length} result${results.length !== 1 ? "s" : ""}`
      : `${results.length} résultat${results.length !== 1 ? "s" : ""}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-8" style={{ color: "var(--text-primary)" }}>
        {locale === "ar" ? "🔍 البحث" : locale === "en" ? "🔍 Search" : "🔍 Recherche"}
      </h1>

      <div className="relative mb-5">
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className="w-full pl-11 pr-10 py-4 rounded-2xl text-base transition-all focus:outline-none"
          style={{
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-green)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-green-dim)";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm px-2 py-1 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 flex-wrap mb-8">
        <button
          onClick={() => setActiveCategory("all")}
          className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
          style={{
            background: activeCategory === "all" ? "var(--accent-green)" : "var(--bg-card)",
            color: activeCategory === "all" ? "#000" : "var(--text-muted)",
            border: `1px solid ${activeCategory === "all" ? "var(--accent-green)" : "var(--border-default)"}`,
          }}
        >
          {allLabel}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? "all" : cat)}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: activeCategory === cat ? "var(--accent-green-dim)" : "var(--bg-card)",
              color: activeCategory === cat ? "var(--accent-green)" : "var(--text-muted)",
              border: `1px solid ${activeCategory === cat ? "var(--accent-green-glow)" : "var(--border-default)"}`,
            }}
          >
            {categoryEmojis[cat]} {categoryLabels[cat][locale]}
          </button>
        ))}
      </div>

      {!query && activeCategory === "all" && (
        <p className="text-center py-16 text-base" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}

      {(query || activeCategory !== "all") && results.length === 0 && (
        <p className="text-center py-16 text-base" style={{ color: "var(--text-muted)" }}>
          {query ? noResults : t(locale, "noArticles")}
        </p>
      )}

      {results.length > 0 && (
        <>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {resultsLabel}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {results.map((article) => (
              <ArticleCard key={article.id} article={article} locale={locale} variant="default" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
