import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getAllArticles } from "@/lib/store";
import { getGeoForSource } from "@/lib/geo";
import { getGlobeData } from "@/lib/globe";
import { getText } from "@/lib/i18n";
import MapWrapper from "@/components/MapWrapper";
import MapTicker from "@/components/MapTicker";
import type { GeoArticle } from "@/components/MapClient";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<Locale, string> = {
    fr: "La Carte — Actualités géolocalisées",
    ar: "الخريطة — الأخبار الجغرافية",
    en: "The Map — Geolocated News",
  };
  const descs: Record<Locale, string> = {
    fr: "Visualisez l'actualité algérienne et mondiale sur une carte interactive.",
    ar: "تصفّح الأخبار الجزائرية والعالمية على خريطة تفاعلية.",
    en: "Visualise Algerian and world news on an interactive map.",
  };
  return { title: titles[locale], description: descs[locale] };
}

const PAGE_LABELS: Record<Locale, {
  title: string; subtitle: string;
  dzLabel: string; globeLabel: string; localIntlLabel: string;
}> = {
  fr: {
    title: "🗺️ La Carte",
    subtitle: "Cliquez sur un point pour lire — 🟢 Algérie · 🔵 Globe · 🔴 International",
    dzLabel: "Algérie", globeLabel: "Globe", localIntlLabel: "International",
  },
  ar: {
    title: "🗺️ الخريطة",
    subtitle: "انقر على نقطة للقراءة — 🟢 الجزائر · 🔵 الغلوب · 🔴 دولي",
    dzLabel: "الجزائر", globeLabel: "الغلوب", localIntlLabel: "دولي",
  },
  en: {
    title: "🗺️ The Map",
    subtitle: "Click a dot to read — 🟢 Algeria · 🔵 Globe · 🔴 International",
    dzLabel: "Algeria", globeLabel: "Globe", localIntlLabel: "International",
  },
};

export default async function MapPage({ params }: Props) {
  const { locale } = await params;
  const lb = PAGE_LABELS[locale];

  // Fetch local DzWire articles + Globe articles in parallel
  const [localArticles, globeRegions] = await Promise.all([
    Promise.resolve(getAllArticles()),
    getGlobeData(),
  ]);

  // ── Local DzWire articles → GeoArticles
  const localGeoArticles: GeoArticle[] = localArticles
    .map((a) => {
      const geo = getGeoForSource(a.source);
      const title = getText(a.title, locale);
      const slug = getText(a.slug, locale) || a.slug.fr;
      return {
        id: a.id, title, slug,
        category: a.category,
        source: a.source,
        flag: geo.flag,
        location: geo.location[locale],
        lat: geo.lat, lng: geo.lng,
        isGlobe: false,
      };
    })
    .filter((a) => a.title && a.slug);

  // ── Globe articles → GeoArticles (externalUrl, isGlobe)
  const globeGeoArticles: GeoArticle[] = [];
  for (const region of globeRegions) {
    for (const item of region.items) {
      const geo = getGeoForSource(item.source);
      globeGeoArticles.push({
        id: `globe-${Buffer.from(item.link).toString("base64").slice(0, 12)}`,
        title: item.title,
        slug: "",
        category: region.id,
        source: item.source,
        flag: geo.flag,
        location: geo.location[locale],
        lat: geo.lat, lng: geo.lng,
        externalUrl: item.link,
        isGlobe: true,
      });
    }
  }

  const geoArticles = [...localGeoArticles, ...globeGeoArticles];

  // Stats
  const dzCount = geoArticles.filter((a) => a.flag === "🇩🇿").length;
  const globeCount = globeGeoArticles.length;
  const localIntlCount = localGeoArticles.filter((a) => a.flag !== "🇩🇿").length;
  const totalCount = geoArticles.length;

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Header bar */}
      <div
        className="px-4 sm:px-6 lg:px-8 py-4 flex items-start justify-between gap-4 flex-wrap"
        style={{ borderBottom: "1px solid var(--border-default)" }}
      >
        <div>
          <h1
            className="text-2xl font-black mb-1"
            style={{ color: "var(--text-primary)" }}
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {lb.title}
            <span
              className="ml-3 text-xs font-bold px-2 py-0.5 rounded-full align-middle"
              style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
            >
              {totalCount} articles
            </span>
          </h1>
          <p
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {lb.subtitle}
          </p>
        </div>

        {/* Legend + counts */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: "#00d632", boxShadow: "0 0 6px #00d632" }} />
            <span style={{ color: "var(--text-muted)" }}>🇩🇿 {lb.dzLabel}</span>
            <span className="px-1.5 py-0.5 rounded font-bold" style={{ background: "var(--bg-elevated)", color: "#00d632" }}>{dzCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: "#0088cc", boxShadow: "0 0 6px #0088cc" }} />
            <span style={{ color: "var(--text-muted)" }}>🌐 {lb.globeLabel}</span>
            <span className="px-1.5 py-0.5 rounded font-bold" style={{ background: "var(--bg-elevated)", color: "#0088cc" }}>{globeCount}</span>
          </div>
          {localIntlCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: "#ff0055", boxShadow: "0 0 6px #ff0055" }} />
              <span style={{ color: "var(--text-muted)" }}>{lb.localIntlLabel}</span>
              <span className="px-1.5 py-0.5 rounded font-bold" style={{ background: "var(--bg-elevated)", color: "#ff0055" }}>{localIntlCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Globe headline ticker */}
      <MapTicker />

      {/* Full-height map */}
      <div className="flex-1" style={{ minHeight: "70vh" }}>
        <MapWrapper articles={geoArticles} locale={locale} />
      </div>
    </div>
  );
}
