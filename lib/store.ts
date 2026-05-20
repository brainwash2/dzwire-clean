import { query } from "./db";
import type { Article, Digest, WeatherData, Holiday, Category, Locale } from "./types";
import { seedArticles } from "./seed";

// Global Cache references preserved across serverless evaluation frames
declare global {
  var __articlesCache: Map<string, Article> | undefined;
  var __viewsCache: Map<string, number> | undefined;
  var __digestCache: Digest | undefined;
  var __weatherCache: WeatherData | undefined;
  var __holidaysCache: Holiday[] | undefined;
}

if (!global.__articlesCache) {
  global.__articlesCache = new Map<string, Article>();
  global.__viewsCache = new Map<string, number>();
}

/**
 * Maps database rows to the standard Article interface
 */
function mapRowToArticle(row: any): Article {
  return {
    id: row.id,
    title: { fr: row.title_fr, ar: row.title_ar, en: row.title_en || undefined },
    slug: { fr: row.slug_fr, ar: row.slug_ar, en: row.slug_en || undefined },
    excerpt: { fr: row.excerpt_fr, ar: row.excerpt_ar, en: row.excerpt_en || undefined },
    content: { fr: row.content_fr, ar: row.content_ar, en: row.content_en || undefined },
    category: row.category as Category,
    source: row.source,
    sourceUrl: row.source_url,
    imageUrl: row.image_url,
    publishedAt: new Date(row.published_at).toISOString(),
    lang: row.lang as Locale,
    tags: row.tags ? row.tags.split(",").map((t: string) => t.trim()) : [],
    curatedBy: row.curated_by || undefined,
    isSponsored: row.is_sponsored || false,
    isPremium: row.is_premium || false,
  };
}

// -----------------------------------------------------------------------------
// READ LAYER (Synchronous in-memory lookup)
// -----------------------------------------------------------------------------

export function getAllArticles(): Article[] {
  return Array.from(global.__articlesCache!.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getArticleById(id: string): Article | undefined {
  return global.__articlesCache!.get(id);
}

export function getArticleBySlug(
  locale: string,
  category: string,
  slug: string
): Article | undefined {
  return Array.from(global.__articlesCache!.values()).find((a) => {
    if (a.category !== category) return false;
    const s = a.slug as unknown as Record<string, string | undefined>;
    return s[locale] === slug || s.fr === slug || s.ar === slug;
  });
}

export function getArticlesByCategory(category: Category): Article[] {
  return getAllArticles().filter((a) => a.category === category);
}

export function getViewCount(id: string): number {
  return global.__viewsCache!.get(id) ?? 0;
}

export function getMostRead(limit = 5): Array<Article & { views: number }> {
  const articles = getAllArticles();
  return articles
    .map((a) => ({ ...a, views: global.__viewsCache!.get(a.id) ?? 0 }))
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
  return global.__digestCache;
}

export function getWeather(): WeatherData | undefined {
  return global.__weatherCache;
}

export function getHolidays(): Holiday[] {
  return global.__holidaysCache ?? [];
}

// -----------------------------------------------------------------------------
// WRITE-THROUGH LAYER (Sync inside memory, Async flush to Database)
// -----------------------------------------------------------------------------

export function upsertArticle(article: Article): void {
  global.__articlesCache!.set(article.id, article);

  const tagsString = article.tags.join(",");
  query(
    `INSERT INTO articles (
      id, title_fr, title_ar, title_en, slug_fr, slug_ar, slug_en,
      excerpt_fr, excerpt_ar, excerpt_en, content_fr, content_ar, content_en,
      category, source, source_url, image_url, published_at, lang, tags, curated_by, is_sponsored, is_premium
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
    ON CONFLICT (id) DO UPDATE SET
      title_fr = EXCLUDED.title_fr, title_ar = EXCLUDED.title_ar, title_en = EXCLUDED.title_en,
      slug_fr = EXCLUDED.slug_fr, slug_ar = EXCLUDED.slug_ar, slug_en = EXCLUDED.slug_en,
      excerpt_fr = EXCLUDED.excerpt_fr, excerpt_ar = EXCLUDED.excerpt_ar, excerpt_en = EXCLUDED.excerpt_en,
      content_fr = EXCLUDED.content_fr, content_ar = EXCLUDED.content_ar, content_en = EXCLUDED.content_en,
      category = EXCLUDED.category, source = EXCLUDED.source, source_url = EXCLUDED.source_url,
      image_url = EXCLUDED.image_url, published_at = EXCLUDED.published_at, lang = EXCLUDED.lang,
      tags = EXCLUDED.tags, curated_by = EXCLUDED.curated_by, is_sponsored = EXCLUDED.is_sponsored, is_premium = EXCLUDED.is_premium`,
    [
      article.id, article.title.fr, article.title.ar, article.title.en || null,
      article.slug.fr, article.slug.ar, article.slug.en || null,
      article.excerpt.fr, article.excerpt.ar, article.excerpt.en || null,
      article.content.fr, article.content.ar, article.content.en || null,
      article.category, article.source, article.sourceUrl, article.imageUrl,
      new Date(article.publishedAt), article.lang, tagsString, article.curatedBy || null,
      article.isSponsored || false, article.isPremium || false
    ]
  ).catch((e) => console.error("[Async Write Fail]:", e));
}

export function upsertArticles(articles: Article[]): void {
  for (const article of articles) {
    upsertArticle(article);
  }
}

export function incrementViewCount(id: string): number {
  const current = global.__viewsCache!.get(id) ?? 0;
  const next = current + 1;
  global.__viewsCache!.set(id, next);

  // Background non-blocking increment query
  query(
    `INSERT INTO article_views (article_id, count) VALUES ($1, 1)
     ON CONFLICT (article_id) DO UPDATE SET count = article_views.count + 1`,
    [id]
  ).catch((e) => console.error("[Async View Sync Error]:", e));

  return next;
}

export function setDigest(digest: Digest): void {
  global.__digestCache = digest;
  query(
    `INSERT INTO system_metadata (key, value) VALUES ('daily_digest', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [JSON.stringify(digest)]
  ).catch((e) => console.error("[Async Digest Sync Error]:", e));
}

export function setWeather(weather: WeatherData): void {
  global.__weatherCache = weather;
  query(
    `INSERT INTO system_metadata (key, value) VALUES ('current_weather', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [JSON.stringify(weather)]
  ).catch((e) => console.error("[Async Weather Sync Error]:", e));
}

export function setHolidays(holidays: Holiday[]): void {
  global.__holidaysCache = holidays;
  query(
    `INSERT INTO system_metadata (key, value) VALUES ('upcoming_holidays', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [JSON.stringify(holidays)]
  ).catch((e) => console.error("[Async Holidays Sync Error]:", e));
}

// -----------------------------------------------------------------------------
// MODULE-LEVEL INITIALIZER (Executes once per serverless cold start)
// -----------------------------------------------------------------------------

export async function initializeStoreCache() {
  try {
    const { rows: articles } = await query(`SELECT * FROM articles ORDER BY published_at DESC LIMIT 200`);
    
    if (articles.length === 0) {
      console.log("[STORE CACHE] Database is empty. Seeding defaults...");
      for (const article of seedArticles) {
        global.__articlesCache!.set(article.id, article);
        upsertArticle(article); // Writes through to DB
      }
    } else {
      console.log(`[STORE CACHE] Loading ${articles.length} articles from PostgreSQL...`);
      for (const row of articles) {
        global.__articlesCache!.set(row.id, mapRowToArticle(row));
      }
    }

    // Load Views
    const { rows: views } = await query(`SELECT * FROM article_views`);
    for (const v of views) {
      global.__viewsCache!.set(v.article_id, v.count);
    }

    // Load Metadata
    const { rows: meta } = await query(`SELECT * FROM system_metadata`);
    for (const m of meta) {
      if (m.key === 'daily_digest') global.__digestCache = JSON.parse(m.value);
      if (m.key === 'current_weather') global.__weatherCache = JSON.parse(m.value);
      if (m.key === 'upcoming_holidays') global.__holidaysCache = JSON.parse(m.value);
    }
  } catch (e) {
    console.error("[STORE CACHE WARN] Initialization failure. Fallback to local seeds:", e);
    // If DB is offline, fall back to seed data to keep routing from failing
    for (const article of seedArticles) {
      global.__articlesCache!.set(article.id, article);
    }
  }
}

// Top-level block prevents serverless execution path from evaluation until maps are filled
try {
  await initializeStoreCache();
} catch (e) {
  console.error("Top-level Store execution failed:", e);
}
