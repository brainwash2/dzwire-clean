import type { Locale, Category } from "@/lib/types";

export const LOCALES: Locale[] = ["fr", "ar", "en"];

export function getDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

// -------------------------------------------------------------------
// Embedded translations – used by the t() function
// -------------------------------------------------------------------
const messages: Record<Locale, Record<string, string>> = {
  fr: {
    home: "Accueil",
    premium: "Premium",
    signIn: "Connexion",
    signOut: "Déconnexion",
  },
  ar: {
    home: "الرئيسية",
    premium: "بريميوم",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
  },
  en: {
    home: "Home",
    premium: "Premium",
    signIn: "Sign in",
    signOut: "Sign out",
  },
};

export function t(locale: Locale, key: string): string {
  return messages[locale]?.[key] ?? key;
}

// -------------------------------------------------------------------
// Categories + emojis (used by page.tsx and other components)
// -------------------------------------------------------------------
export const CATEGORIES: Category[] = [
  "politique",
  "energie-economie",
  "tech-innovation",
  "culture-gaming",
  "medias-sociaux",
  "sport",
];

export const categoryLabels: Record<Category, Record<Locale, string>> = {
  politique: {
    fr: "Politique",
    ar: "سياسة",
    en: "Politics",
  },
  "energie-economie": {
    fr: "Économie",
    ar: "اقتصاد",
    en: "Economy",
  },
  "tech-innovation": {
    fr: "Tech",
    ar: "تكنولوجيا",
    en: "Tech",
  },
  "culture-gaming": {
    fr: "Culture",
    ar: "ثقافة",
    en: "Culture",
  },
  "medias-sociaux": {
    fr: "Médias Sociaux",
    ar: "وسائل التواصل",
    en: "Social Media",
  },
  sport: {
    fr: "Sport",
    ar: "رياضة",
    en: "Sports",
  },
};

export const categoryEmojis: Record<Category, string> = {
  politique: "🏛️",
  "energie-economie": "⚡",
  "tech-innovation": "💻",
  "culture-gaming": "🎮",
  "medias-sociaux": "📱",
  sport: "⚽",
};

// -------------------------------------------------------------------
// Generic helpers (used by ArticleCard, MostRead, seo, etc.)
// -------------------------------------------------------------------
export function getText(
  obj: { fr?: string; ar?: string; en?: string } | null | undefined,
  locale: Locale
): string {
  if (!obj) return "";
  return obj[locale] ?? obj.fr ?? "";
}

export function formatDate(date: string | Date, locale: Locale): string {
  return new Date(date).toLocaleDateString(
    locale === "ar" ? "ar-DZ" : locale === "en" ? "en-GB" : "fr-DZ",
    { year: "numeric", month: "long", day: "numeric" }
  );
}

export function getDigestText(
  digest: { textFr?: string; textAr?: string; textEn?: string },
  locale: Locale
): string {
  if (!digest) return "";
  if (locale === "ar") return digest.textAr ?? digest.textFr ?? "";
  if (locale === "en") return digest.textEn ?? digest.textFr ?? "";
  return digest.textFr ?? "";
}
