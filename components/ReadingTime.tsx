import type { Locale } from "@/lib/types";
import { estimateReadingTime } from "@/lib/seo";

interface Props {
  text: string;
  locale: Locale;
}

const labels: Record<Locale, (n: number) => string> = {
  fr: (n) => `${n} min de lecture`,
  ar: (n) => `${n} دقائق قراءة`,
  en: (n) => `${n} min read`,
};

export default function ReadingTime({ text, locale }: Props) {
  const mins = estimateReadingTime(text, locale);
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
      style={{
        background: "var(--bg-card)",
        color: "var(--text-muted)",
        border: "1px solid var(--border-default)",
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {labels[locale](mins)}
    </span>
  );
}
