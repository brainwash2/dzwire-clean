"use client";

import { useState } from "react";
import type { Locale } from "@/lib/types";
import { CATEGORY_META, getStatus, type DzEvent, type EventCategory } from "@/lib/events";
import EventCountdown from "./EventCountdown";

const MONTH_NAMES: Record<Locale, string[]> = {
  fr: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
  ar: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
};

function formatDate(dateStr: string, locale: Locale): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString(
    locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-DZ" : "en-GB",
    { day: "numeric", month: "long", timeZone: "UTC" }
  );
}

const ALL_LABEL: Record<Locale, string> = { fr: "Tout", ar: "الكل", en: "All" };
const APPROX_LABEL: Record<Locale, string> = { fr: "Date approx.", ar: "تاريخ تقريبي", en: "Approx. date" };
const PAST_LABEL: Record<Locale, string> = { fr: "Passé", ar: "مضى", en: "Past" };
const ONGOING_LABEL: Record<Locale, string> = { fr: "En cours", ar: "جارٍ", en: "Ongoing" };
const WEBSITE_LABEL: Record<Locale, string> = { fr: "Site officiel", ar: "الموقع الرسمي", en: "Official site" };
const NO_EVENTS: Record<Locale, string> = {
  fr: "Aucun événement dans cette catégorie.",
  ar: "لا توجد أحداث في هذه الفئة.",
  en: "No events in this category.",
};

function EventCard({ event, locale }: { event: DzEvent; locale: Locale }) {
  const status = getStatus(event);
  const meta = CATEGORY_META[event.category];
  const isPast = status === "ended";
  const isOngoing = status === "ongoing";
  const isRTL = locale === "ar";

  const statusColor = isOngoing ? "#00d632" : isPast ? "#606070" : meta.color;
  const statusLabel = isOngoing
    ? ONGOING_LABEL[locale]
    : isPast
    ? PAST_LABEL[locale]
    : null;

  return (
    <div
      className="rounded-2xl p-4 sm:p-5 flex gap-4 transition-all duration-200 group"
      style={{
        background: isPast ? "rgba(255,255,255,0.02)" : "var(--bg-card)",
        border: `1px solid ${isOngoing ? "rgba(0,214,50,0.3)" : isPast ? "var(--border-default)" : meta.color + "22"}`,
        opacity: isPast ? 0.5 : 1,
        boxShadow: isOngoing ? "0 0 24px rgba(0,214,50,0.07)" : "none",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Date column */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1.5 pt-0.5" style={{ minWidth: "52px" }}>
        <span className="text-2xl" style={{ filter: isPast ? "grayscale(0.7)" : "none" }}>
          {event.icon}
        </span>
        <div
          className="text-center rounded-xl px-1.5 py-1.5 w-full"
          style={{ background: "var(--bg-elevated)" }}
        >
          <div className="text-sm font-black leading-none" style={{ color: meta.color }}>
            {new Date(event.date + "T00:00:00Z").getUTCDate()}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 600, marginTop: "2px" }}>
            {MONTH_NAMES[locale][new Date(event.date + "T00:00:00Z").getUTCMonth()].slice(0, 3).toUpperCase()}
          </div>
        </div>
        {event.endDate && (
          <div style={{ fontSize: "9px", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.3 }}>
            → {new Date(event.endDate + "T00:00:00Z").getUTCDate()}{" "}
            {MONTH_NAMES[locale][new Date(event.endDate + "T00:00:00Z").getUTCMonth()].slice(0, 3)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
          <h3
            className="font-bold text-sm sm:text-base leading-snug"
            style={{ color: isPast ? "var(--text-muted)" : "var(--text-primary)" }}
          >
            {event.title[locale]}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
            {event.isApprox && (
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontSize: "9px" }}>
                {APPROX_LABEL[locale]}
              </span>
            )}
            {statusLabel && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: statusColor + "20", color: statusColor }}>
                {statusLabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>
            {meta.icon} {meta.label[locale]}
          </span>
          {event.location && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              📍 {event.location[locale]}
            </span>
          )}
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formatDate(event.date, locale)}
            {event.endDate ? ` – ${formatDate(event.endDate, locale)}` : ""}
          </span>
        </div>

        {event.description && (
          <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-muted)" }}>
            {event.description[locale]}
          </p>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-2">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded font-mono"
                style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)", fontSize: "10px" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom row: countdown + website */}
        <div className="flex items-center gap-3 flex-wrap mt-1">
          {status === "upcoming" && !event.isApprox && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>⏱</span>
              <EventCountdown date={event.date} color={meta.color} size="sm" />
            </div>
          )}
          {event.website && (
            <a
              href={event.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{ color: meta.color }}
            >
              {WEBSITE_LABEL[locale]} ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  events: DzEvent[];
  locale: Locale;
  initialCategory?: EventCategory | "all";
}

export default function EventsClient({ events, locale, initialCategory = "all" }: Props) {
  const [activeCategory, setActiveCategory] = useState<EventCategory | "all">(initialCategory);
  const isRTL = locale === "ar";

  const filtered = activeCategory === "all"
    ? events
    : events.filter((e) => e.category === activeCategory);

  // Count per category
  const counts: Record<string, number> = { all: events.length };
  for (const e of events) counts[e.category] = (counts[e.category] ?? 0) + 1;

  // Group filtered events by month
  const byMonth: Record<number, DzEvent[]> = {};
  for (const event of filtered) {
    const month = parseInt(event.date.split("-")[1], 10);
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(event);
  }
  const months = Object.keys(byMonth).map(Number).sort((a, b) => a - b);
  const currentMonth = new Date().getUTCMonth() + 1;

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      {/* Category filter tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-8 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <button
          onClick={() => setActiveCategory("all")}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
          style={{
            background: activeCategory === "all" ? "rgba(255,255,255,0.12)" : "var(--bg-elevated)",
            color: activeCategory === "all" ? "var(--text-primary)" : "var(--text-muted)",
            border: activeCategory === "all" ? "1px solid rgba(255,255,255,0.15)" : "1px solid var(--border-default)",
          }}
        >
          🗓 {ALL_LABEL[locale]}
          <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.1)" }}>
            {counts.all}
          </span>
        </button>

        {(Object.entries(CATEGORY_META) as [EventCategory, typeof CATEGORY_META[EventCategory]][]).map(([key, meta]) => {
          const count = counts[key] ?? 0;
          if (count === 0) return null;
          const isActive = activeCategory === key;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
              style={{
                background: isActive ? meta.bg : "var(--bg-elevated)",
                color: isActive ? meta.color : "var(--text-muted)",
                border: `1px solid ${isActive ? meta.color + "40" : "var(--border-default)"}`,
              }}
            >
              {meta.icon} {meta.label[locale]}
              <span
                className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: isActive ? meta.color + "25" : "rgba(255,255,255,0.06)", color: isActive ? meta.color : "var(--text-muted)" }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Events by month */}
      {filtered.length === 0 ? (
        <p className="text-center py-12" style={{ color: "var(--text-muted)" }}>{NO_EVENTS[locale]}</p>
      ) : (
        <div className="flex flex-col gap-10">
          {months.map((month) => {
            const evts = byMonth[month];
            const isCurrent = month === currentMonth;
            return (
              <section key={month}>
                <div className="flex items-center gap-3 mb-4">
                  <h2
                    className="text-base font-black"
                    style={{ color: isCurrent ? "var(--accent-green)" : "var(--text-secondary)" }}
                  >
                    {MONTH_NAMES[locale][month - 1]}
                  </h2>
                  {isCurrent && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(0,214,50,0.12)", color: "var(--accent-green)" }}
                    >
                      {locale === "ar" ? "الشهر الحالي" : locale === "fr" ? "Ce mois-ci" : "This month"}
                    </span>
                  )}
                  <div className="flex-1 h-px" style={{ background: "var(--border-default)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{evts.length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {evts.map((event) => (
                    <EventCard key={event.id} event={event} locale={locale} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Footer disclaimer */}
      <div
        className="mt-12 p-4 rounded-xl text-xs text-center"
        style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
      >
        {locale === "ar"
          ? "* التواريخ الإسلامية تقريبية وتعتمد على رؤية الهلال. يُرجى التحقق من مصادر رسمية."
          : locale === "fr"
          ? "* Les dates islamiques sont approximatives et dépendent de l'observation du croissant. Vérifiez les sources officielles."
          : "* Islamic dates are approximate and depend on moon sighting. Please verify with official sources."}
      </div>
    </div>
  );
}
