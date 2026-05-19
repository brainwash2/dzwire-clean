import type { Locale } from "@/lib/types";
import { getMostRead } from "@/lib/store";
import { getText, formatDate } from "@/lib/i18n";
import Link from "next/link";

interface Props {
  locale: Locale;
}

const labels: Record<Locale, string> = {
  fr: "Les plus lus",
  ar: "الأكثر قراءة",
  en: "Most read",
};

export default function MostRead({ locale }: Props) {
  const articles = getMostRead(5);
  const hasViews = articles.some((a) => a.views > 0);

  if (!hasViews || articles.length === 0) return null;

  return (
    <aside>
      <h2
        className="text-base font-black mb-4 flex items-center gap-2"
        style={{ color: "var(--text-primary)" }}
      >
        <span
          className="text-xs px-2 py-0.5 rounded-md font-bold"
          style={{ background: "var(--accent-magenta-dim)", color: "var(--accent-magenta)" }}
        >
          🔥
        </span>
        {labels[locale]}
      </h2>
      <ol className="flex flex-col gap-3">
        {articles.map((article, i) => {
          const title = getText(article.title, locale);
          const slug = getText(article.slug, locale) || article.slug.fr;
          return (
            <li key={article.id}>
              <Link
                href={`/${locale}/${article.category}/${slug}`}
                className="flex items-start gap-3 group"
              >
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                  style={{
                    background: i === 0 ? "var(--accent-green-dim)" : "var(--bg-elevated)",
                    color: i === 0 ? "var(--accent-green)" : "var(--text-muted)",
                    border: `1px solid ${i === 0 ? "var(--accent-green-glow)" : "var(--border-default)"}`,
                  }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold line-clamp-2 leading-snug group-hover:underline"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatDate(article.publishedAt, locale)}
                    </span>
                    {article.views > 0 && (
                      <span
                        className="inline-flex items-center gap-1 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {article.views >= 1000 ? `${(article.views / 1000).toFixed(1)}k` : article.views}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
