"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/types";
import { getText } from "@/lib/i18n";

interface Props {
  locale: Locale;
  article: {
    id: string;
    title: { fr: string; ar: string; en?: string };
    slug: { fr: string; ar: string; en?: string };
    category: string;
    publishedAt: string;
  };
}

const labels: Record<Locale, string> = {
  fr: "BREAKING",
  ar: "عاجل",
  en: "BREAKING",
};

export default function BreakingBanner({ locale, article }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const title = getText(article.title as Parameters<typeof getText>[0], locale);
  const slug = getText(article.slug as Parameters<typeof getText>[0], locale) || article.slug.fr;

  return (
    <div
      className="relative z-30 flex items-center gap-3 px-4 py-2.5 text-sm"
      style={{
        background: "linear-gradient(90deg, rgba(255,0,85,0.18), rgba(255,0,85,0.08) 60%, transparent)",
        borderBottom: "1px solid rgba(255,0,85,0.25)",
      }}
    >
      <span
        className="flex-shrink-0 text-xs font-black px-2 py-0.5 rounded animate-pulse"
        style={{ background: "var(--accent-magenta)", color: "#fff", letterSpacing: "0.08em" }}
      >
        {labels[locale]}
      </span>
      <Link
        href={`/${locale}/${article.category}/${slug}`}
        className="flex-1 font-semibold line-clamp-1 hover:underline"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded"
        style={{ color: "var(--text-muted)" }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
