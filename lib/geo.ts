import type { Locale } from "./types";

export interface GeoPoint {
  lat: number;
  lng: number;
  flag: string;
  location: Record<Locale, string>;
}

const SOURCE_GEO: Record<string, GeoPoint> = {
  // ── Algeria ─────────────────────────────────────────
  "elkhabar.com": {
    lat: 36.7538, lng: 3.0588, flag: "🇩🇿",
    location: { fr: "Alger", ar: "الجزائر العاصمة", en: "Algiers" },
  },
  "echoroukonline.com": {
    lat: 36.7538, lng: 3.0588, flag: "🇩🇿",
    location: { fr: "Alger", ar: "الجزائر العاصمة", en: "Algiers" },
  },
  "tsa-algerie.com": {
    lat: 36.7538, lng: 3.0588, flag: "🇩🇿",
    location: { fr: "Alger", ar: "الجزائر العاصمة", en: "Algiers" },
  },
  "El Heddaf": {
    lat: 35.6969, lng: -0.6331, flag: "🇩🇿",
    location: { fr: "Oran", ar: "وهران", en: "Oran" },
  },
  "Le Buteur": {
    lat: 36.3650, lng: 6.6147, flag: "🇩🇿",
    location: { fr: "Constantine", ar: "قسنطينة", en: "Constantine" },
  },
  "Startup Brics": {
    lat: 36.7538, lng: 3.0588, flag: "🇩🇿",
    location: { fr: "Alger", ar: "الجزائر العاصمة", en: "Algiers" },
  },

  // ── International (local store) ──────────────────────
  "Hacker News": {
    lat: 37.7749, lng: -122.4194, flag: "🇺🇸",
    location: { fr: "San Francisco", ar: "سان فرانسيسكو", en: "San Francisco" },
  },
  "Al Jazeera": {
    lat: 25.2854, lng: 51.5310, flag: "🇶🇦",
    location: { fr: "Doha", ar: "الدوحة", en: "Doha" },
  },
  "Le Monde": {
    lat: 48.8566, lng: 2.3522, flag: "🇫🇷",
    location: { fr: "Paris", ar: "باريس", en: "Paris" },
  },
  "France 24": {
    lat: 48.8566, lng: 2.3522, flag: "🇫🇷",
    location: { fr: "Paris", ar: "باريس", en: "Paris" },
  },

  // ── Globe feeds — each mapped to a representative city ──
  "BBC MENA": {
    lat: 33.8938, lng: 35.5018, flag: "🇱🇧",
    location: { fr: "Beyrouth", ar: "بيروت", en: "Beirut" },
  },
  "BBC Africa": {
    lat: -1.2921, lng: 36.8219, flag: "🇰🇪",
    location: { fr: "Nairobi", ar: "نيروبي", en: "Nairobi" },
  },
  "BBC Europe": {
    lat: 50.8503, lng: 4.3517, flag: "🇧🇪",
    location: { fr: "Bruxelles", ar: "بروكسل", en: "Brussels" },
  },
  "BBC World": {
    lat: 51.5074, lng: -0.1278, flag: "🇬🇧",
    location: { fr: "Londres", ar: "لندن", en: "London" },
  },
  "France 24 Afrique": {
    lat: 14.7167, lng: -17.4677, flag: "🇸🇳",
    location: { fr: "Dakar", ar: "داكار", en: "Dakar" },
  },
  "France 24 ME": {
    lat: 30.0444, lng: 31.2357, flag: "🇪🇬",
    location: { fr: "Le Caire", ar: "القاهرة", en: "Cairo" },
  },
  "France 24 Europe": {
    lat: 48.8566, lng: 2.3522, flag: "🇫🇷",
    location: { fr: "Paris", ar: "باريس", en: "Paris" },
  },
  "New York Times": {
    lat: 40.7128, lng: -74.0060, flag: "🇺🇸",
    location: { fr: "New York", ar: "نيويورك", en: "New York" },
  },
};

const DZ_DEFAULT: GeoPoint = {
  lat: 36.7538, lng: 3.0588, flag: "🇩🇿",
  location: { fr: "Algérie", ar: "الجزائر", en: "Algeria" },
};

export function getGeoForSource(source: string): GeoPoint {
  if (SOURCE_GEO[source]) return SOURCE_GEO[source];
  const hostname = source.replace(/^www\./, "");
  return SOURCE_GEO[hostname] ?? DZ_DEFAULT;
}
