"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/types";
import { t } from "@/lib/i18n";

interface Props {
  locale: Locale;
}

const navItems = (locale: Locale) => [
  {
    href: `/${locale}`,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    label: t(locale, "home"),
    exact: true,
  },
  {
    href: `/${locale}/tech-innovation`,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    label: "Tech",
    exact: false,
  },
  {
    href: `/${locale}/politique`,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    label: locale === "ar" ? "أخبار" : locale === "en" ? "News" : "Actu",
    exact: false,
  },
  {
    href: `/${locale}/sport`,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l4.24 4.24" />
        <path d="M14.83 9.17l4.24-4.24" />
        <path d="M14.83 14.83l4.24 4.24" />
        <path d="M9.17 14.83l-4.24 4.24" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    label: "Sport",
    exact: false,
  },
  {
    href: `/${locale}/abonnement`,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    label: t(locale, "premium"),
    exact: false,
    isPremium: true,
  },
];

export default function BottomNav({ locale }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50"
      style={{
        background: "rgba(10, 10, 12, 0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems(locale).map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-0"
              style={{
                color: isActive ? "var(--accent-green)" : "var(--text-muted)",
                background: isActive ? "var(--accent-green-dim)" : "transparent",
                filter:
                  isActive && item.isPremium
                    ? "drop-shadow(0 0 8px var(--accent-green-glow))"
                    : "none",
              }}
            >
              {item.icon}
              <span className="text-[10px] font-semibold leading-none truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
