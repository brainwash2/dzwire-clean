import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { DZ_EVENTS_2026, CATEGORY_META, getFeaturedUpcoming, getStatus } from "@/lib/events";
import { getCustomEvents } from "@/lib/db-events";
import EventCountdown from "@/components/EventCountdown";
import EventsClient from "@/components/EventsClient";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<Locale, string> = {
    fr: "Événements Algérie 2026 — Tech, Tourisme, Foires, Culture",
    ar: "أحداث الجزائر 2026 — تقنية، سياحة، معارض، ثقافة",
    en: "Algeria Events 2026 — Tech, Tourism, Trade Fairs & Culture",
  };
  const descs: Record<Locale, string> = {
    fr: "Le hub complet des événements algériens : hackathons, conférences tech, festivals, salons et fêtes nationales.",
    ar: "المرجع الشامل للأحداث الجزائرية: هاكاثونات، مؤتمرات تقنية، مهرجانات، معارض وأعياد وطنية.",
    en: "The complete hub for Algerian events: hackathons, tech conferences, festivals, trade fairs & national holidays.",
  };
  return { title: titles[locale], description: descs[locale] };
}

const PAGE_LABELS: Record<Locale, {
  title: string; subtitle: string; featuredLabel: string;
  countdownLabel: string; learnMore: string; totalLabel: string;
}> = {
  fr: {
    title: "📅 Événements Algérie 2026",
    subtitle: "Le hub de référence pour geeks, voyageurs et professionnels — foires, festivals, hackathons, compétitions sportives",
    featuredLabel: "Prochain événement phare",
    countdownLabel: "Compte à rebours",
    learnMore: "En savoir plus",
    totalLabel: "événements listés",
  },
  ar: {
    title: "📅 أحداث الجزائر 2026",
    subtitle: "المرجع الأول للمهتمين بالتكنولوجيا والسياحة والمهنيين — معارض، مهرجانات، هاكاثونات، بطولات رياضية",
    featuredLabel: "الحدث المميز القادم",
    countdownLabel: "العد التنازلي",
    learnMore: "اعرف أكثر",
    totalLabel: "حدث مُدرج",
  },
  en: {
    title: "📅 Algeria Events 2026",
    subtitle: "The reference hub for geeks, travellers & professionals — trade fairs, festivals, hackathons, sports & more",
    featuredLabel: "Next featured event",
    countdownLabel: "Countdown",
    learnMore: "Learn more",
    totalLabel: "events listed",
  },
};

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  const lb = PAGE_LABELS[locale];
  const isRTL = locale === "ar";

  // Merge static + DB events
  const dbEvents = await getCustomEvents();
  const allEvents = [...DZ_EVENTS_2026, ...dbEvents].sort((a, b) => a.date.localeCompare(b.date));

  const featured = getFeaturedUpcoming(allEvents);
  const featuredMeta = featured ? CATEGORY_META[featured.category] : null;
  const featuredStatus = featured ? getStatus(featured) : "ended";

  // Stats
  const totalEvents = allEvents.length;
  const today = new Date().toISOString().split("T")[0];
  const upcoming = allEvents.filter((e) => (e.endDate ?? e.date) >= today).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Page header ────────────────────────────────── */}
      <div className="mb-8" dir={isRTL ? "rtl" : "ltr"}>
        <h1 className="text-3xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
          {lb.title}
        </h1>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-muted)", maxWidth: "600px" }}>
          {lb.subtitle}
        </p>
        {/* Quick stats */}
        <div className="flex items-center gap-4 flex-wrap text-xs">
          <span style={{ color: "var(--text-muted)" }}>
            <span className="font-black text-base" style={{ color: "var(--text-primary)" }}>{totalEvents}</span>
            {" "}{lb.totalLabel}
          </span>
          <span className="h-3 w-px" style={{ background: "var(--border-default)" }} />
          <span style={{ color: "var(--accent-green)" }}>
            <span className="font-black text-base">{upcoming}</span>
            {" "}{locale === "ar" ? "حدث قادم" : locale === "fr" ? "à venir" : "upcoming"}
          </span>
          {Object.keys(CATEGORY_META).map((cat) => {
            const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META];
            const count = DZ_EVENTS_2026.filter((e) => e.category === cat).length;
            return (
              <span key={cat} className="flex items-center gap-1">
                <span>{meta.icon}</span>
                <span style={{ color: "var(--text-muted)" }}>{count} {meta.label[locale].split(" ")[0].toLowerCase()}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Featured hero countdown ─────────────────────── */}
      {featured && featuredMeta && (
        <div
          className="rounded-2xl p-6 sm:p-8 mb-10 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${featuredMeta.color}12 0%, rgba(10,10,12,0) 60%)`,
            border: `1px solid ${featuredMeta.color}35`,
            boxShadow: `0 0 40px ${featuredMeta.color}10`,
          }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Glow blob */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "200px", height: "200px",
              background: featuredMeta.color + "18",
              filter: "blur(60px)",
              top: "-40px",
              [isRTL ? "left" : "right"]: "-40px",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: featuredMeta.color }}
              />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: featuredMeta.color }}>
                {lb.featuredLabel}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <div className="text-3xl mb-2">{featured.icon}</div>
                <h2 className="text-xl sm:text-2xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
                  {featured.title[locale]}
                </h2>
                <div className="flex items-center gap-2 flex-wrap text-sm mb-3">
                  <span className="font-semibold px-2 py-0.5 rounded-full text-xs"
                    style={{ background: featuredMeta.bg, color: featuredMeta.color }}>
                    {featuredMeta.icon} {featuredMeta.label[locale]}
                  </span>
                  {featured.location && (
                    <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      📍 {featured.location[locale]}
                    </span>
                  )}
                </div>
                {featured.description && (
                  <p className="text-sm" style={{ color: "var(--text-muted)", maxWidth: "400px" }}>
                    {featured.description[locale]}
                  </p>
                )}
                {featured.website && (
                  <a
                    href={featured.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold rounded-lg px-3 py-1.5 transition-all hover:opacity-80"
                    style={{ background: featuredMeta.bg, color: featuredMeta.color, border: `1px solid ${featuredMeta.color}30` }}
                  >
                    {lb.learnMore} ↗
                  </a>
                )}
              </div>

              {/* Countdown clock */}
              {featuredStatus === "upcoming" && !featured.isApprox && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    ⏱ {lb.countdownLabel}
                  </span>
                  <EventCountdown date={featured.date} color={featuredMeta.color} size="lg" />
                </div>
              )}
              {featuredStatus === "ongoing" && (
                <div
                  className="text-sm font-black px-4 py-2 rounded-xl animate-pulse"
                  style={{ background: "rgba(0,214,50,0.12)", color: "#00d632" }}
                >
                  {locale === "ar" ? "● جارٍ الآن" : locale === "fr" ? "● En cours maintenant" : "● Happening now"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Interactive event list with category filter ─ */}
      <EventsClient events={allEvents} locale={locale} />
    </div>
  );
}
