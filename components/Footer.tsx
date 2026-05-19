"use client";

import Link from "next/link";
import type { Locale } from "@/lib/types";
import { CATEGORIES, categoryLabels, t } from "@/lib/i18n";
import NewsletterForm from "@/components/NewsletterForm";

interface Props {
  locale: Locale;
}

const SOCIAL_LINKS = [
  { name: "Telegram", url: "https://t.me/dzwire", icon: "✈️" },
  { name: "Twitter / X", url: "https://twitter.com/DzWire_dz", icon: "𝕏" },
  { name: "Facebook", url: "https://facebook.com/DzWire", icon: "f" },
  { name: "YouTube", url: "https://youtube.com/@DzWire", icon: "▶" },
];

export default function Footer({ locale }: Props) {
  return (
    <footer
      className="mt-16"
      style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border-default)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🇩🇿</span>
              <span className="font-black text-xl">
                Dz<span style={{ color: "var(--accent-green)" }}>Wire</span>
              </span>
            </div>
            <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
              {t(locale, "footerTagline")}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {t(locale, "taglineShort")}
            </p>
            <div className="mt-4 flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-full animate-pulse"
                style={{ background: "var(--accent-green)" }}
              />
              <span className="text-xs" style={{ color: "var(--accent-green)" }}>
                {locale === "ar" ? "مباشر" : locale === "en" ? "Live" : "En direct"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
              {t(locale, "quickLinks")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-sm transition-colors hover:underline"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t(locale, "home")}
                </Link>
              </li>
              {CATEGORIES.slice(0, 5).map((category) => (
                <li key={category}>
                  <Link
                    href={`/${locale}/${category}`}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {categoryLabels[category][locale]}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`/${locale}/abonnement`}
                  className="text-sm font-semibold transition-colors"
                  style={{ color: "var(--accent-green)" }}
                >
                  ⚡ {locale === "ar" ? "الاشتراك المميز" : locale === "en" ? "Premium" : "Premium"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
              {t(locale, "socialLinks")}
            </h3>
            <ul className="space-y-2">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center gap-2 transition-colors hover:underline"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="w-5 text-center text-base leading-none">{link.icon}</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <a
                href="/api/news"
                className="text-xs px-3 py-1.5 rounded-lg font-mono transition-all"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--accent-green)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {"{ }"} JSON API
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
              {t(locale, "newsletter")}
            </h3>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              {locale === "ar"
                ? "أحدث الأخبار مباشرة في بريدك"
                : locale === "en"
                ? "Latest news straight to your inbox"
                : "L'actu algérienne directement dans votre boîte mail"}
            </p>
            <NewsletterForm locale={locale} />
          </div>
        </div>

        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }} suppressHydrationWarning>
            © {new Date().getFullYear()} DzWire. {t(locale, "copyright")}
          </p>
          <div className="flex gap-4 items-center">
            <Link href={`/${locale}`} className="text-xs transition-colors hover:underline" style={{ color: "var(--text-muted)" }}>
              {t(locale, "privacyPolicy")}
            </Link>
            <span style={{ color: "var(--border-default)" }}>·</span>
            <Link href={`/${locale}/recherche`} className="text-xs transition-colors hover:underline" style={{ color: "var(--text-muted)" }}>
              {t(locale, "search")}
            </Link>
            <span style={{ color: "var(--border-default)" }}>·</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {locale === "ar" ? "صُنع في 🇩🇿 بـ ♥" : locale === "en" ? "Made in 🇩🇿 with ♥" : "Fait en 🇩🇿 avec ♥"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
