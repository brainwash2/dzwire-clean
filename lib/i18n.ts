import type { Locale, Category } from "@/lib/types";

export const LOCALES: Locale[] = ["fr", "ar", "en"];

export function getDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

// -------------------------------------------------------------------
// Embedded translations – populated for all layout components
// -------------------------------------------------------------------
const messages: Record<Locale, Record<string, string>> = {
  fr: {
    // Nav & Header
    home: "Accueil",
    premium: "Premium",
    signIn: "Connexion",
    signOut: "Déconnexion",
    search: "Rechercher",
    
    // Homepage Elements
    seeAll: "Voir tout",
    latestNews: "Dernières actualités",

    // Footer Links
    footerTagline: "L'information algérienne de référence, livrée en temps réel.",
    taglineShort: "Politique, économie, technologie et sport.",
    quickLinks: "Raccourcis",
    socialLinks: "Suivez-nous",
    newsletter: "Newsletter",
    copyright: "Tous droits réservés.",
    privacyPolicy: "Confidentialité",
    newsletterPlaceholder: "votre.email@domaine.com",
    subscribe: "S'abonner",

    // Cookie Banner
    cookieMessage: "Ce site utilise des cookies pour optimiser votre expérience de lecture.",
    accept: "Accepter",
    refuse: "Refuser",
    reject: "Refuser"
  },
  ar: {
    // Nav & Header
    home: "الرئيسية",
    premium: "بريميوم",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    search: "البحث",

    // Homepage Elements
    seeAll: "عرض الكل",
    latestNews: "آخر الأخبار",

    // Footer Links
    footerTagline: "الأخبار الجزائرية الموثوقة، في وقتها الفعلي.",
    taglineShort: "سياسة، اقتصاد، تكنولوجيا ورياضة.",
    quickLinks: "روابط سريعة",
    socialLinks: "تابعنا",
    newsletter: "النشرة البريدية",
    copyright: "جميع الحقوق محفوظة.",
    privacyPolicy: "سياسة الخصوصية",
    newsletterPlaceholder: "بريدك الإلكتروني...",
    subscribe: "اشتراك",

    // Cookie Banner
    cookieMessage: "يستخدم هذا الموقع ملفات تعريف الارتباط لتحسين تجربتك.",
    accept: "موافق",
    refuse: "رفض",
    reject: "رفض"
  },
  en: {
    // Nav & Header
    home: "Home",
    premium: "Premium",
    signIn: "Sign in",
    signOut: "Sign out",
    search: "Search",

    // Homepage Elements
    seeAll: "See all",
    latestNews: "Latest news",

    // Footer Links
    footerTagline: "The definitive Algerian news hub, delivered in real time.",
    taglineShort: "Politics, economy, technology, and sports.",
    quickLinks: "Quick Links",
    socialLinks: "Social Links",
    newsletter: "Newsletter",
    copyright: "All rights reserved.",
    privacyPolicy: "Privacy Policy",
    newsletterPlaceholder: "your.email@domain.com",
    subscribe: "Subscribe",

    // Cookie Banner
    cookieMessage: "This site uses cookies to optimize your reading experience.",
    accept: "Accept",
    refuse: "Reject",
    reject: "Reject"
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
