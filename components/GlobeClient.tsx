"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/lib/types";
import type { GlobeRegion, GlobeItem } from "@/app/api/globe/route";

interface Props {
  locale: Locale;
}

function timeAgo(dateStr: string, locale: Locale): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600) return locale === "ar" ? `منذ ${Math.max(1, Math.floor(diff / 60))} دقيقة` : locale === "en" ? `${Math.max(1, Math.floor(diff / 60))}m ago` : `il y a ${Math.max(1, Math.floor(diff / 60))} min`;
  if (diff < 86400) return locale === "ar" ? `منذ ${Math.floor(diff / 3600)} ساعة` : locale === "en" ? `${Math.floor(diff / 3600)}h ago` : `il y a ${Math.floor(diff / 3600)}h`;
  return locale === "ar" ? `منذ ${Math.floor(diff / 86400)} يوم` : locale === "en" ? `${Math.floor(diff / 86400)}d ago` : `il y a ${Math.floor(diff / 86400)}j`;
}

function GlobeCard({ item, locale }: { item: GlobeItem; locale: Locale }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 items-start p-3 rounded-xl transition-all hover:bg-white/4"
      style={{ border: "1px solid var(--border-default)", background: "var(--bg-card)" }}
    >
      <div
        className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden"
        style={{ background: "var(--bg-elevated)" }}
      >
        {!imgErr ? (
          <img
            src={item.image}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">🌐</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold leading-snug line-clamp-2 group-hover:underline mb-1"
          style={{ color: "var(--text-primary)" }}
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          {item.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
          >
            {item.source}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {timeAgo(item.pubDate, locale)}
          </span>
          <span
            className="text-xs ml-auto"
            style={{ color: "var(--accent-green)", opacity: 0.7 }}
          >
            ↗
          </span>
        </div>
      </div>
    </a>
  );
}

const LOADING_TEXT: Record<Locale, string> = {
  fr: "Chargement des actualités mondiales…",
  ar: "جار تحميل الأخبار العالمية…",
  en: "Loading world news…",
};
const ERROR_TEXT: Record<Locale, string> = {
  fr: "Impossible de charger les actualités mondiales.",
  ar: "تعذّر تحميل الأخبار العالمية.",
  en: "Could not load world news.",
};

export default function GlobeClient({ locale }: Props) {
  const [regions, setRegions] = useState<GlobeRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/globe")
      .then((r) => r.json())
      .then((d: { regions: GlobeRegion[] }) => {
        setRegions(d.regions ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--border-default)", borderTopColor: "var(--accent-green)" }}
        />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{LOADING_TEXT[locale]}</p>
      </div>
    );
  }

  if (error || regions.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-4xl mb-4">🌐</p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{ERROR_TEXT[locale]}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {regions.map((region) => {
        const label = region.label[locale] ?? region.label.fr;
        return (
          <section key={region.id}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{region.flag}</span>
              <h2
                className="text-base font-black"
                style={{ color: "var(--text-primary)" }}
                dir={locale === "ar" ? "rtl" : "ltr"}
              >
                {label}
              </h2>
              <div
                className="flex-1 h-px"
                style={{ background: "var(--border-default)" }}
              />
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
              >
                {region.items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {region.items.map((item, i) => (
                <GlobeCard key={i} item={item} locale={locale} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
