import type { Locale, BilingualText, Category } from "./types";

export const LOCALES: Locale[] = ["fr", "ar", "en"];
export const DEFAULT_LOCALE: Locale = "fr";

export const categoryLabels: Record<Category, Record<Locale, string>> = {
  politique: { fr: "Politique", ar: "السياسة", en: "Politics" },
  "energie-economie": { fr: "Énergie & Économie", ar: "الطاقة والاقتصاد", en: "Energy & Economy" },
  "tech-innovation": { fr: "Tech & Innovation", ar: "التكنولوجيا والابتكار", en: "Tech & Innovation" },
  "culture-gaming": { fr: "Culture & Gaming", ar: "الثقافة والألعاب", en: "Culture & Gaming" },
  "medias-sociaux": { fr: "Médias Sociaux", ar: "وسائل التواصل الاجتماعي", en: "Social Media" },
  sport: { fr: "Sport", ar: "الرياضة", en: "Sport" },
};

export const categoryEmojis: Record<Category, string> = {
  politique: "🏛️",
  "energie-economie": "⚡",
  "tech-innovation": "💡",
  "culture-gaming": "🎮",
  "medias-sociaux": "📱",
  sport: "⚽",
};

export const CATEGORIES: Category[] = [
  "politique",
  "energie-economie",
  "tech-innovation",
  "culture-gaming",
  "medias-sociaux",
  "sport",
];

export const ui: Record<Locale, Record<string, string>> = {
  fr: {
    home: "Accueil",
    search: "Recherche",
    premium: "Premium",
    digest: "Bulletin du Jour",
    readMore: "Lire la suite",
    latestNews: "Dernières actualités",
    relatedArticles: "Articles similaires",
    weather: "Météo Alger",
    holidays: "Jours fériés",
    cookieMessage:
      "Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre politique de confidentialité.",
    accept: "Accepter",
    reject: "Refuser",
    premiumTitle: "Bientôt disponible",
    premiumMessage:
      "L'abonnement premium DzWire arrive bientôt. Restez connecté !",
    close: "Fermer",
    source: "Source",
    publishedAt: "Publié le",
    share: "Partager",
    taggedAs: "Tagué",
    allNews: "Toutes les actualités",
    newsletter: "Newsletter",
    newsletterPlaceholder: "Votre adresse email",
    subscribe: "S'abonner",
    footerTagline: "L'Algérie à portée de main",
    quickLinks: "Liens rapides",
    socialLinks: "Réseaux sociaux",
    loading: "Chargement...",
    noArticles: "Aucun article disponible.",
    seeAll: "Tout voir →",
    signIn: "Connexion",
    signOut: "Déconnexion",
    privacyPolicy: "Politique de confidentialité",
    copyright: "Tous droits réservés.",
    taglineShort: "Actualités algériennes en français et en arabe.",
  },
  ar: {
    home: "الرئيسية",
    search: "بحث",
    premium: "بريميوم",
    digest: "النشرة اليومية",
    readMore: "اقرأ المزيد",
    latestNews: "آخر الأخبار",
    relatedArticles: "مقالات مشابهة",
    weather: "طقس الجزائر",
    holidays: "العطل الرسمية",
    cookieMessage:
      "نستخدم ملفات تعريف الارتباط لتحسين تجربتك. بالمتابعة، فإنك توافق على سياسة الخصوصية الخاصة بنا.",
    accept: "قبول",
    reject: "رفض",
    premiumTitle: "قريباً",
    premiumMessage: "اشتراك DzWire المميز قادم قريباً. ابقَ على اتصال!",
    close: "إغلاق",
    source: "المصدر",
    publishedAt: "نُشر في",
    share: "شارك",
    taggedAs: "وُسم بـ",
    allNews: "جميع الأخبار",
    newsletter: "النشرة الإخبارية",
    newsletterPlaceholder: "بريدك الإلكتروني",
    subscribe: "اشترك",
    footerTagline: "الجزائر في متناول يدك",
    quickLinks: "روابط سريعة",
    socialLinks: "التواصل الاجتماعي",
    loading: "جار التحميل...",
    noArticles: "لا توجد مقالات متاحة.",
    seeAll: "← عرض الكل",
    signIn: "دخول",
    signOut: "تسجيل الخروج",
    privacyPolicy: "سياسة الخصوصية",
    copyright: "جميع الحقوق محفوظة.",
    taglineShort: "أخبار جزائرية بالفرنسية والعربية.",
  },
  en: {
    home: "Home",
    search: "Search",
    premium: "Premium",
    digest: "Daily Digest",
    readMore: "Read more",
    latestNews: "Latest news",
    relatedArticles: "Related articles",
    weather: "Algiers Weather",
    holidays: "Public Holidays",
    cookieMessage:
      "We use cookies to improve your experience. By continuing, you accept our privacy policy.",
    accept: "Accept",
    reject: "Decline",
    premiumTitle: "Coming soon",
    premiumMessage: "DzWire Premium is coming soon. Stay tuned!",
    close: "Close",
    source: "Source",
    publishedAt: "Published on",
    share: "Share",
    taggedAs: "Tagged as",
    allNews: "All news",
    newsletter: "Newsletter",
    newsletterPlaceholder: "Your email address",
    subscribe: "Subscribe",
    footerTagline: "Algeria at your fingertips",
    quickLinks: "Quick links",
    socialLinks: "Social media",
    loading: "Loading...",
    noArticles: "No articles available.",
    seeAll: "See all →",
    signIn: "Sign in",
    signOut: "Sign out",
    privacyPolicy: "Privacy policy",
    copyright: "All rights reserved.",
    taglineShort: "Algerian news in French, Arabic, and English.",
  },
};

export function t(locale: Locale, key: string): string {
  return ui[locale]?.[key] ?? ui.fr[key] ?? key;
}

export function getText(text: BilingualText, locale: Locale): string {
  if (locale === "ar") return text.ar;
  if (locale === "en") return text.en ?? text.fr;
  return text.fr;
}

export function getDigestText(
  digest: { textFr: string; textAr: string; textEn?: string },
  locale: Locale
): string {
  if (locale === "ar") return digest.textAr;
  if (locale === "en") return digest.textEn ?? digest.textFr;
  return digest.textFr;
}

export function formatDate(dateString: string, locale: Locale): string {
  const date = new Date(dateString);
  const localeStr =
    locale === "ar" ? "ar-DZ" : locale === "en" ? "en-GB" : "fr-DZ";
  return date.toLocaleDateString(localeStr, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function getDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
