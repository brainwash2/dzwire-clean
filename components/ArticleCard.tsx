"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Article, Locale } from "@/lib/types";
import { getText, formatDate } from "@/lib/i18n";

interface Props {
  article: Article;
  locale: Locale;
  variant: "hero" | "default" | "compact";
}

export default function ArticleCard({ article, locale, variant }: Props) {
  const title = getText(article.title, locale);
  const excerpt = getText(article.excerpt, locale);
  const slug = getText(article.slug, locale) || article.slug.fr;
  const href = `/${locale}/${article.category}/${slug}`;
  const date = formatDate(article.publishedAt, locale);

  if (variant === "hero") {
    return (
      <Link href={href} className="block relative group h-full">
        <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden">
          <img
            src={article.imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(to top, rgba(0,214,50,0.15), transparent 60%)" }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span
              className="inline-block text-xs font-bold px-2.5 py-1 rounded-lg mb-3"
              style={{ background: "var(--accent-green)", color: "#000" }}
            >
              {article.source}
            </span>
            <h2
              className="font-black text-xl sm:text-2xl leading-tight line-clamp-3 mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {date}
            </p>
          </div>
          {article.isPremium && (
            <div
              className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{ background: "var(--accent-magenta)", color: "#fff" }}
            >
              ⚡ Premium
            </div>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link
          href={href}
          className="flex gap-3 rounded-xl overflow-hidden p-2.5 group transition-all duration-200"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-green-glow)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 1px rgba(0,214,50,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <div className="flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden">
            <img
              src={article.imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-semibold line-clamp-2 leading-snug"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {article.source}
            </p>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <Link
        href={href}
        className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,214,50,0.3)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 8px 32px rgba(0,214,50,0.08), 0 0 0 1px rgba(0,214,50,0.15)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <img
            src={article.imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span
            className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-lg"
            style={{
              background: "rgba(0,0,0,0.7)",
              color: "var(--text-secondary)",
              backdropFilter: "blur(4px)",
            }}
          >
            {article.source}
          </span>
          {article.isPremium && (
            <span
              className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-lg"
              style={{ background: "var(--accent-magenta)", color: "#fff" }}
            >
              ⚡
            </span>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3
            className="font-bold text-base leading-snug line-clamp-2 mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h3>
          <p className="text-sm line-clamp-2 flex-1" style={{ color: "var(--text-secondary)" }}>
            {excerpt}
          </p>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            {date}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
