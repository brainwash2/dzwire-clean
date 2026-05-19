import type { Article, Digest, WeatherData, Holiday, Category } from "./types";
import { seedArticles } from "./seed";

declare global {
  var __store_initialized: boolean | undefined;
  var __articles: Map<string, Article> | undefined;
  var __digest: Digest | undefined;
  var __weather: WeatherData | undefined;
  var __holidays: Holiday[] | undefined;
  var __viewCounts: Map<string, number> | undefined;
}

if (!global.__articles) {
  global.__articles = new Map<string, Article>();
  global.__store_initialized = false;
}

if (!global.__viewCounts) {
  global.__viewCounts = new Map<string, number>();
}

if (!global.__store_initialized && global.__articles.size === 0) {
  for (const article of seedArticles) {
    global.__articles.set(article.id, article);
  }
  global.__store_initialized = true;
}

export function getAllArticles(): Article[] {
  return Array.from(global.__articles!.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getArticleById(id: string): Article | undefined {
  return global.__articles!.get(id);
}

export function getArticleBySlug(
  locale: string,
  category: string,
  slug: string
): Article | undefined {
  return Array.from(global.__articles!.values()).find((a) => {
    if (a.category !== category) return false;
    const s = a.slug as unknown as Record<string, string | undefined>;
    return s[locale] === slug || s.fr === slug || s.ar === slug;
  });
}

export function getArticlesByCategory(category: Category): Article[] {
  return getAllArticles().filter((a) => a.category === category);
}

export function upsertArticle(article: Article): void {
  global.__articles!.set(article.id, article);
}

export function upsertArticles(articles: Article[]): void {
  for (const article of articles) {
    global.__articles!.set(article.id, article);
  }
}

export function incrementViewCount(id: string): number {
  const current = global.__viewCounts!.get(id) ?? 0;
  const next = current + 1;
  global.__viewCounts!.set(id, next);
  return next;
}

export function getViewCount(id: string): number {
  return global.__viewCounts!.get(id) ?? 0;
}

export function getMostRead(limit = 5): Array<Article & { views: number }> {
  const articles = getAllArticles();
  return articles
    .map((a) => ({ ...a, views: global.__viewCounts!.get(a.id) ?? 0 }))
    .sort((a, b) => b.views - a.views || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export function getBreakingArticle(): Article | null {
  const recent = getAllArticles().find((a) => {
    const ageMs = Date.now() - new Date(a.publishedAt).getTime();
    return ageMs < 2 * 60 * 60 * 1000;
  });
  return recent ?? null;
}

export function getDigest(): Digest | undefined {
  return global.__digest;
}

export function setDigest(digest: Digest): void {
  global.__digest = digest;
}

export function getWeather(): WeatherData | undefined {
  return global.__weather;
}

export function setWeather(weather: WeatherData): void {
  global.__weather = weather;
}

export function getHolidays(): Holiday[] {
  return global.__holidays ?? [];
}

export function setHolidays(holidays: Holiday[]): void {
  global.__holidays = holidays;
}
