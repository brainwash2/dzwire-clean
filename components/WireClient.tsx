"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/types";
import { categoryLabels, categoryEmojis, getText } from "@/lib/i18n";

interface WireArticle {
  id: string;
  title: { fr: string; ar: string; en?: string };
  slug: { fr: string; ar: string; en?: string };
  category: string;
  source: string;
  publishedAt: string;
  imageUrl: string;
}

interface Props {
  locale: Locale;
  initialArticles: WireArticle[];
}

const CATEGORY_COLORS: Record<string, string> = {
  politique:         "#ff0055",
  "energie-economie":"#fbbf24",
  "tech-innovation": "#00d632",
  "culture-gaming":  "#a855f7",
  "medias-sociaux":  "#0088cc",
  sport:             "#f97316",
};

function timeAgo(dateStr: string, locale: Locale): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)  return locale === "ar" ? `${diff}ث` : `${diff}s`;
  if (diff < 3600) return locale === "ar" ? `${Math.floor(diff/60)}د` : `${Math.floor(diff/60)}m`;
  if (diff < 86400) return locale === "ar" ? `${Math.floor(diff/3600)}س` : `${Math.floor(diff/3600)}h`;
  return locale === "ar" ? `${Math.floor(diff/86400)}ي` : `${Math.floor(diff/86400)}d`;
}

function formatWireTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("fr-DZ", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Africa/Algiers",
  });
}

const LABELS: Record<Locale, { live: string; wire: string; allCats: string; autoRefresh: string; pause: string; newItems: string }> = {
  fr: { live: "EN DIRECT", wire: "Le Wire", allCats: "Tout", autoRefresh: "Auto", pause: "Pause", newItems: "nouveaux articles" },
  ar: { live: "مباشر", wire: "الواير", allCats: "الكل", autoRefresh: "تلقائي", pause: "إيقاف", newItems: "مقالات جديدة" },
  en: { live: "LIVE", wire: "The Wire", allCats: "All", autoRefresh: "Auto", pause: "Pause", newItems: "new articles" },
};

export default function WireClient({ locale, initialArticles }: Props) {
  const [articles, setArticles] = useState<WireArticle[]>(initialArticles);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isPaused, setIsPaused] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [tick, setTick] = useState(0);
  const [isBlinking, setIsBlinking] = useState(true);
  const knownIds = useRef(new Set(initialArticles.map((a) => a.id)));
  const lb = LABELS[locale];

  const refresh = useCallback(async () => {
    if (isPaused) return;
    try {
      const res = await fetch("/api/news");
      if (!res.ok) return;
      const data = await res.json() as { data: WireArticle[] };
      const fresh = data.data.filter((a) => !knownIds.current.has(a.id));
      if (fresh.length > 0) {
        fresh.forEach((a) => knownIds.current.add(a.id));
        setArticles((prev) => [...fresh, ...prev]);
        setNewCount((n) => n + fresh.length);
      }
    } catch {}
  }, [isPaused]);

  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setIsBlinking((b) => !b), 600);
    return () => clearInterval(id);
  }, []);

  const filtered = activeCategory === "all"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  const categories = Array.from(new Set(articles.map((a) => a.category)));

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-base)", fontFamily: "'Inter', monospace" }}
    >
      {/* Terminal header */}
      <div
        className="sticky top-16 z-30 px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 flex-wrap"
        style={{
          background: "rgba(10,10,12,0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        {/* Live badge */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: isPaused ? "var(--text-muted)" : "var(--accent-green)",
              boxShadow: isPaused ? "none" : "0 0 6px var(--accent-green)",
              opacity: isPaused ? 0.5 : isBlinking ? 1 : 0.4,
              transition: "opacity 0.3s",
            }}
          />
          <span
            className="text-xs font-black tracking-widest"
            style={{ color: isPaused ? "var(--text-muted)" : "var(--accent-green)" }}
          >
            {isPaused ? "—" : lb.live}
          </span>
        </div>

        <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
          {lb.wire}
        </span>

        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {new Date().toLocaleTimeString("fr-DZ", { timeZone: "Africa/Algiers" })}
        </span>

        {newCount > 0 && (
          <button
            onClick={() => { setNewCount(0); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="text-xs font-bold px-2.5 py-1 rounded-lg animate-pulse"
            style={{ background: "var(--accent-green-dim)", color: "var(--accent-green)" }}
          >
            +{newCount} {lb.newItems}
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all"
            style={{
              background: isPaused ? "var(--accent-green-dim)" : "var(--bg-elevated)",
              color: isPaused ? "var(--accent-green)" : "var(--text-muted)",
              border: "1px solid var(--border-default)",
            }}
          >
            {isPaused ? "▶ " + lb.autoRefresh : "⏸ " + lb.pause}
          </button>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {filtered.length}
          </span>
        </div>
      </div>

      {/* Category filter */}
      <div
        className="px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide"
        style={{ borderBottom: "1px solid var(--border-default)" }}
      >
        <button
          onClick={() => setActiveCategory("all")}
          className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
          style={{
            background: activeCategory === "all" ? "var(--accent-green)" : "var(--bg-card)",
            color: activeCategory === "all" ? "#000" : "var(--text-muted)",
            border: `1px solid ${activeCategory === "all" ? "transparent" : "var(--border-default)"}`,
          }}
        >
          {lb.allCats}
        </button>
        {categories.map((cat) => {
          const color = CATEGORY_COLORS[cat] ?? "var(--accent-green)";
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? "all" : cat)}
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
              style={{
                background: isActive ? `${color}22` : "var(--bg-card)",
                color: isActive ? color : "var(--text-muted)",
                border: `1px solid ${isActive ? color : "var(--border-default)"}`,
              }}
            >
              {categoryEmojis[cat as keyof typeof categoryEmojis] ?? ""}{" "}
              {categoryLabels[cat as keyof typeof categoryLabels]?.[locale] ?? cat}
            </button>
          );
        })}
      </div>

      {/* Wire entries */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-0">
          {filtered.map((article, i) => {
            const title = getText(article.title, locale);
            const slug = getText(article.slug as { fr: string; ar: string; en?: string }, locale) || article.slug.fr;
            const color = CATEGORY_COLORS[article.category] ?? "var(--accent-green)";
            const isNew = i < newCount;

            return (
              <Link
                key={article.id}
                href={`/${locale}/${article.category}/${slug}`}
                className="group flex items-start gap-4 py-3 border-b transition-all hover:bg-white/2"
                style={{
                  borderColor: "var(--border-default)",
                  background: isNew ? `${color}08` : "transparent",
                }}
              >
                {/* Time */}
                <div
                  className="flex-shrink-0 w-20 text-right"
                  style={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: "11px", paddingTop: "2px" }}
                >
                  <div>{formatWireTime(article.publishedAt)}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
                    {timeAgo(article.publishedAt, locale)}
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="flex-shrink-0 w-0.5 self-stretch rounded-full"
                  style={{ background: `${color}60` }}
                />

                {/* Category badge */}
                <div className="flex-shrink-0 pt-0.5">
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded"
                    style={{ background: `${color}20`, color, letterSpacing: "0.05em", whiteSpace: "nowrap" }}
                  >
                    {categoryLabels[article.category as keyof typeof categoryLabels]?.[locale]?.toUpperCase() ?? article.category.toUpperCase()}
                  </span>
                </div>

                {/* Headline */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold leading-snug group-hover:underline line-clamp-2"
                    style={{ color: "var(--text-primary)" }}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    {isNew && (
                      <span
                        className="inline-block text-xs font-black mr-2 px-1.5 py-0.5 rounded"
                        style={{ background: color, color: "#000", verticalAlign: "middle" }}
                      >
                        NEW
                      </span>
                    )}
                    {title}
                  </p>
                </div>

                {/* Source */}
                <div
                  className="flex-shrink-0 text-xs pt-0.5 hidden sm:block"
                  style={{ color: "var(--text-muted)", minWidth: "80px", textAlign: "right" }}
                >
                  {article.source}
                </div>
              </Link>
            );
          })}

          {/* Blinking cursor at end */}
          <div className="py-4 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            <span
              className="inline-block w-2 h-4 rounded-sm"
              style={{
                background: "var(--accent-green)",
                opacity: isBlinking ? 1 : 0,
                transition: "opacity 0.15s",
              }}
            />
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {locale === "ar" ? "في انتظار القادم..." : locale === "en" ? "Awaiting next feed..." : "En attente du prochain fil..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
