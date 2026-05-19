"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/types";

interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
  label: Record<Locale, string>;
  bg: string;
  accent: string;
}

const HOUSE_ADS: Ad[] = [
  {
    id: "premium-cta",
    title: "DzWire Premium",
    imageUrl: "",
    href: "/fr/abonnement",
    label: {
      fr: "📰 Accédez à tous les articles premium — 490 DA/mois",
      ar: "📰 الوصول لجميع المقالات المميزة — 490 دج/شهر",
      en: "📰 Unlock all premium articles — 490 DA/month",
    },
    bg: "linear-gradient(135deg, rgba(0,214,50,0.12), rgba(0,214,50,0.04))",
    accent: "var(--accent-green)",
  },
  {
    id: "telegram-cta",
    title: "DzWire Telegram",
    imageUrl: "",
    href: "https://t.me/dzwire",
    label: {
      fr: "✈️ Rejoignez notre canal Telegram — Actus en temps réel",
      ar: "✈️ انضم إلى قناتنا على تيليغرام — أخبار فورية",
      en: "✈️ Join our Telegram channel — Real-time breaking news",
    },
    bg: "linear-gradient(135deg, rgba(0,136,204,0.12), rgba(0,136,204,0.04))",
    accent: "#0088cc",
  },
];

interface Props {
  placement: "article-inline" | "sidebar" | "footer";
  locale: Locale;
  className?: string;
}

export default function AdUnit({ placement, locale, className = "" }: Props) {
  const [adIndex, setAdIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setAdIndex(Math.floor(Math.random() * HOUSE_ADS.length));
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const ad = HOUSE_ADS[adIndex];

  return (
    <a
      href={ad.href}
      target={ad.href.startsWith("http") ? "_blank" : undefined}
      rel={ad.href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={`block rounded-2xl p-4 transition-all duration-300 group ${className}`}
      style={{
        background: ad.bg,
        border: `1px solid ${ad.accent}33`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${ad.accent}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium flex-1" style={{ color: "var(--text-primary)" }}>
          {ad.label[locale]}
        </p>
        <span
          className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-lg"
          style={{ background: `${ad.accent}22`, color: ad.accent }}
        >
          {locale === "ar" ? "← عرض" : locale === "en" ? "View →" : "Voir →"}
        </span>
      </div>
      <p
        className="text-xs mt-1.5"
        style={{ color: "var(--text-muted)" }}
      >
        {placement === "article-inline"
          ? locale === "ar" ? "إعلان" : locale === "en" ? "Sponsored" : "Publicité"
          : "DzWire"}
      </p>
    </a>
  );
}
