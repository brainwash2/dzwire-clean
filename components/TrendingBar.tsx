import type { Locale, WeatherData, Holiday } from "@/lib/types";
import { t } from "@/lib/i18n";

interface Props {
  locale: Locale;
  weather?: WeatherData;
  holidays?: Holiday[];
  digest?: string;
}

function formatHolidayDate(dateStr: string, locale: Locale): string {
  const date = new Date(dateStr);
  const localeStr =
    locale === "ar" ? "ar-DZ" : locale === "en" ? "en-GB" : "fr-DZ";
  return date.toLocaleDateString(localeStr, {
    month: "short",
    day: "numeric",
  });
}

export default function TrendingBar({ locale, weather, holidays, digest }: Props) {
  const items: string[] = [];

  if (weather) {
    items.push(
      `${weather.icon} ${t(locale, "weather")}: ${weather.temperature}°C — ${weather.condition}`
    );
  }

  if (holidays && holidays.length > 0) {
    holidays.slice(0, 3).forEach((h) => {
      const dateStr = formatHolidayDate(h.date, locale);
      const name = locale === "ar" ? h.localName || h.name : locale === "en" ? h.name : h.localName || h.name;
      items.push(`🗓️ ${dateStr} — ${name}`);
    });
  }

  if (digest) {
    items.push(`📰 ${digest}`);
  }

  if (items.length === 0) return null;

  const repeatedItems = [...items, ...items];

  return (
    <div
      className="overflow-hidden py-2.5 text-sm"
      style={{
        background: "linear-gradient(90deg, var(--bg-card) 0%, var(--bg-elevated) 100%)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {repeatedItems.map((item, i) => (
          <span key={i} className="flex items-center">
            <span style={{ color: "var(--text-secondary)" }}>{item}</span>
            <span className="mx-6 text-xs" style={{ color: "var(--accent-green)", opacity: 0.5 }}>
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
