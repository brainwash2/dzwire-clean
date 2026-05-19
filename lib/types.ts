export type Locale = "fr" | "ar" | "en";

export interface BilingualText {
  fr: string;
  ar: string;
  en?: string;
}

export interface Article {
  id: string;
  title: BilingualText;
  slug: BilingualText;
  excerpt: BilingualText;
  content: BilingualText;
  category: Category;
  source: string;
  sourceUrl: string;
  imageUrl: string;
  publishedAt: string;
  lang: Locale;
  tags: string[];
  curatedBy?: string;
  isSponsored?: boolean;
  isPremium?: boolean;
}

export type Category =
  | "politique"
  | "energie-economie"
  | "tech-innovation"
  | "culture-gaming"
  | "medias-sociaux"
  | "sport";

export interface Digest {
  textFr: string;
  textAr: string;
  textEn?: string;
  generatedAt: string;
}

export interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed: number;
  condition: string;
  icon: string;
}

export interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
}
