"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { Locale } from "@/lib/types";
import { LOCALES, t, categoryLabels } from "@/lib/i18n";
import { useAuth } from "./AuthProvider";

interface Props {
  locale: Locale;
}

const LOCALE_LABELS: Record<Locale, string> = { fr: "FR", ar: "ع", en: "EN" };

const EXPLORE_ITEMS = (locale: Locale) => [
  {
    href: `/${locale}/wire`,
    icon: "📡",
    label: locale === "ar" ? "الواير" : locale === "en" ? "The Wire" : "Le Wire",
    desc: locale === "ar" ? "الأخبار المباشرة" : locale === "en" ? "Live news terminal" : "Fil d'actualité en direct",
    color: "#00d632",
  },
  {
    href: `/${locale}/globe`,
    icon: "🌐",
    label: locale === "ar" ? "الغلوب" : locale === "en" ? "The Globe" : "Le Globe",
    desc: locale === "ar" ? "أخبار العالم" : locale === "en" ? "World news by region" : "Actualités mondiales",
    color: "#0088cc",
  },
  {
    href: `/${locale}/map`,
    icon: "🗺️",
    label: locale === "ar" ? "الخريطة" : locale === "en" ? "The Map" : "La Carte",
    desc: locale === "ar" ? "أخبار جغرافية" : locale === "en" ? "Geolocated articles" : "Actualités géolocalisées",
    color: "#a855f7",
  },
  {
    href: `/${locale}/events`,
    icon: "📅",
    label: locale === "ar" ? "الأحداث" : locale === "en" ? "Events" : "Événements",
    desc: locale === "ar" ? "أعياد وأحداث جزائرية 2026" : locale === "en" ? "Algerian events & key dates" : "Fêtes nationales & dates clés",
    color: "#f59e0b",
  },
];

const EXPLORE_LABEL: Record<Locale, string> = { fr: "Explorer", ar: "استكشاف", en: "Explore" };

export default function Header({ locale }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, isLoading, login, logout } = useAuth();

  const switchTo = (newLocale: Locale) => {
    if (newLocale === locale) return;
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/`;
    router.push(newPath);
  };

  const navLinks = [
    { href: `/${locale}`, label: t(locale, "home") },
    { href: `/${locale}/politique`, label: categoryLabels["politique"][locale] },
    { href: `/${locale}/tech-innovation`, label: "Tech" },
    { href: `/${locale}/sport`, label: "Sport" },
    { href: `/${locale}/energie-economie`, label: locale === "ar" ? "اقتصاد" : locale === "en" ? "Economy" : "Économie" },
  ];

  const exploreItems = EXPLORE_ITEMS(locale);

  const hovStyle = (el: HTMLElement, enter: boolean) => {
    el.style.color = enter ? "var(--accent-green)" : "var(--text-secondary)";
    el.style.background = enter ? "var(--accent-green-dim)" : "transparent";
  };

  const handleExploreEnter = () => {
    if (exploreTimeout.current) clearTimeout(exploreTimeout.current);
    setExploreOpen(true);
  };

  const handleExploreLeave = () => {
    exploreTimeout.current = setTimeout(() => setExploreOpen(false), 120);
  };

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "rgba(10, 10, 12, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 font-black text-xl tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            <span>🇩🇿</span>
            <span>
              Dz<span style={{ color: "var(--accent-green)" }}>Wire</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => hovStyle(e.currentTarget as HTMLElement, true)}
                onMouseLeave={(e) => hovStyle(e.currentTarget as HTMLElement, false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Explore dropdown */}
            <div
              className="relative"
              onMouseEnter={handleExploreEnter}
              onMouseLeave={handleExploreLeave}
            >
              <button
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                style={{
                  color: exploreOpen ? "var(--accent-green)" : "var(--text-secondary)",
                  background: exploreOpen ? "var(--accent-green-dim)" : "transparent",
                }}
              >
                <span>{EXPLORE_LABEL[locale]}</span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="currentColor"
                  style={{ transition: "transform 0.2s", transform: exploreOpen ? "rotate(180deg)" : "none", opacity: 0.6 }}
                >
                  <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </button>

              {exploreOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-60 rounded-2xl py-2 overflow-hidden"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  {exploreItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-start gap-3 px-4 py-3 transition-all hover:bg-white/4"
                      onClick={() => setExploreOpen(false)}
                    >
                      <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <div
                          className="text-sm font-bold"
                          style={{ color: item.color }}
                        >
                          {item.label}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div
              className="hidden sm:flex items-center rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--border-default)" }}
            >
              {LOCALES.map((loc) => (
               <button
               key={loc}
               onClick={() => switchTo(loc)}
               className="cursor-pointer text-xs font-bold px-2.5 py-1.5 transition-all duration-200"
                  style={{
                    background: loc === locale ? "var(--accent-green-dim)" : "transparent",
                    color: loc === locale ? "var(--accent-green)" : "var(--text-muted)",
                    borderRight: loc !== "en" ? "1px solid var(--border-default)" : "none",
                  }}
                >
                  {LOCALE_LABELS[loc]}
                </button>
              ))}
            </div>

            {!isLoading && (
              user ? (
                <div className="hidden sm:flex items-center gap-2">
                  {user.hasActiveSubscription && (
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-lg"
                      style={{ background: "var(--accent-green-dim)", color: "var(--accent-green)" }}
                    >
                      ⚡ Premium
                    </span>
                  )}
                  <div className="relative group">
                    <button
                      className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-all"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
                    >
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name ?? "User"} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "var(--accent-green)", color: "#000" }}
                        >
                          {(user.username ?? user.name ?? "U")[0].toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {user.username ?? user.name ?? "User"}
                      </span>
                    </button>
                    <div
                      className="absolute right-0 top-full mt-1 w-44 rounded-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-default)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      }}
                    >
                      {!user.hasActiveSubscription && (
                        <Link href={`/${locale}/abonnement`} className="block px-4 py-2.5 text-sm" style={{ color: "var(--accent-green)" }}>
                          ⚡ {t(locale, "premium")}
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2.5 text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {t(locale, "signOut")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => login(`/${locale}`)}
                    className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                    style={{ color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
                  >
                    {t(locale, "signIn")}
                  </button>
                  <Link
                    href={`/${locale}/abonnement`}
                    className="text-sm font-bold px-4 py-1.5 rounded-lg pulse-glow"
                    style={{ background: "var(--accent-green)", color: "#000" }}
                  >
                    ⚡ {t(locale, "premium")}
                  </Link>
                </div>
              )
            )}

            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                {menuOpen ? (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t" style={{ borderColor: "var(--border-default)" }}>
            <nav className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium px-3 py-2.5 rounded-lg"
                  style={{ color: "var(--text-secondary)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {/* Explore items in mobile */}
              <div
                className="mt-2 pt-2"
                style={{ borderTop: "1px solid var(--border-default)" }}
              >
                <p className="text-xs font-bold px-3 mb-1" style={{ color: "var(--text-muted)" }}>
                  {EXPLORE_LABEL[locale]}
                </p>
                {exploreItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold"
                    style={{ color: item.color }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Mobile locale switcher */}
            <div className="flex gap-1 mb-4 px-1">
              {LOCALES.map((loc) => (
                <button
                  key={loc}
                  onClick={() => { switchTo(loc); setMenuOpen(false); }}
                  className="flex-1 text-xs font-bold py-2 rounded-lg transition-all"
                  style={{
                    background: loc === locale ? "var(--accent-green-dim)" : "var(--bg-subtle)",
                    color: loc === locale ? "var(--accent-green)" : "var(--text-muted)",
                    border: `1px solid ${loc === locale ? "var(--accent-green-glow)" : "var(--border-default)"}`,
                  }}
                >
                  {LOCALE_LABELS[loc]}
                </button>
              ))}
            </div>

            {user ? (
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full text-sm font-semibold px-3 py-2.5 rounded-lg text-left"
                style={{ color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
              >
                {t(locale, "signOut")}
              </button>
            ) : (
              <>
                <button
                  onClick={() => { login(`/${locale}`); setMenuOpen(false); }}
                  className="w-full mb-2 text-sm font-semibold px-3 py-2.5 rounded-lg text-left"
                  style={{ color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
                >
                  {t(locale, "signIn")}
                </button>
                <Link
                  href={`/${locale}/abonnement`}
                  className="block text-sm font-bold px-3 py-2.5 rounded-lg text-center"
                  style={{
                    background: "var(--accent-green-dim)",
                    color: "var(--accent-green)",
                    border: "1px solid var(--accent-green-glow)",
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  ⚡ {t(locale, "premium")}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
