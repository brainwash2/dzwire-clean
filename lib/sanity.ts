import { createClient } from "@sanity/client";
import type { Article, Locale } from "./types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const sanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2024-01-01",
      useCdn: true,
      token: process.env.SANITY_API_READ_TOKEN,
    })
  : null;

export const sanityWriteClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2024-01-01",
      useCdn: false,
      token: process.env.SANITY_WRITE_TOKEN,
    })
  : null;

interface SanityArticle {
  _id: string;
  title_fr?: string;
  title_ar?: string;
  title_en?: string;
  excerpt_fr?: string;
  excerpt_ar?: string;
  excerpt_en?: string;
  content_fr?: string;
  content_ar?: string;
  content_en?: string;
  slug_fr?: { current?: string };
  slug_ar?: { current?: string };
  slug_en?: { current?: string };
  category?: string;
  source?: string;
  sourceUrl?: string;
  imageUrl?: string;
  publishedAt?: string;
  isPremium?: boolean;
  lang?: string;
  tags?: string[];
}

export function sanityArticleToStoreArticle(doc: SanityArticle): Article | null {
  if (!doc._id || !doc.title_fr) return null;
  return {
    id: doc._id,
    title: {
      fr: doc.title_fr ?? "",
      ar: doc.title_ar ?? doc.title_fr ?? "",
      en: doc.title_en ?? undefined,
    },
    excerpt: {
      fr: doc.excerpt_fr ?? "",
      ar: doc.excerpt_ar ?? doc.excerpt_fr ?? "",
      en: doc.excerpt_en ?? undefined,
    },
    content: {
      fr: doc.content_fr ?? doc.excerpt_fr ?? "",
      ar: doc.content_ar ?? doc.content_fr ?? doc.excerpt_fr ?? "",
      en: doc.content_en ?? undefined,
    },
    slug: {
      fr: doc.slug_fr?.current ?? doc._id,
      ar: doc.slug_ar?.current ?? doc._id,
      en: doc.slug_en?.current ?? undefined,
    },
    category: (doc.category as Article["category"]) ?? "politique",
    source: doc.source ?? "Sanity",
    sourceUrl: doc.sourceUrl ?? "#",
    imageUrl: doc.imageUrl ?? `https://picsum.photos/seed/${doc._id}/800/450`,
    publishedAt: doc.publishedAt ?? new Date().toISOString(),
    isPremium: doc.isPremium ?? false,
    lang: (doc.lang as Locale) ?? "fr",
    tags: doc.tags ?? [],
    curatedBy: "DzWire",
  };
}

export async function fetchSanityArticles(): Promise<Article[]> {
  if (!sanityClient) return [];
  try {
    const docs: SanityArticle[] = await sanityClient.fetch(
      `*[_type == "article"] | order(publishedAt desc)[0...60]{
        _id, title_fr, title_ar, title_en,
        excerpt_fr, excerpt_ar, excerpt_en,
        content_fr, content_ar, content_en,
        slug_fr, slug_ar, slug_en,
        category, source, sourceUrl, imageUrl,
        publishedAt, isPremium, lang, tags
      }`,
      {},
      { next: { revalidate: 300 } }
    );
    return docs.map(sanityArticleToStoreArticle).filter(Boolean) as Article[];
  } catch {
    return [];
  }
}

export async function writeArticleToSanity(article: Article): Promise<boolean> {
  if (!sanityWriteClient) return false;
  try {
    const docId = `rss-${article.id.replace(/[^a-z0-9]/gi, "-").slice(0, 80)}`;
    await sanityWriteClient.createOrReplace({
      _type: "article",
      _id: docId,
      title_fr: article.title.fr,
      title_ar: article.title.ar,
      title_en: article.title.en,
      excerpt_fr: article.excerpt.fr,
      excerpt_ar: article.excerpt.ar,
      excerpt_en: article.excerpt.en,
      content_fr: article.content.fr,
      content_ar: article.content.ar,
      content_en: article.content.en,
      slug_fr: { _type: "slug", current: article.slug.fr },
      slug_ar: { _type: "slug", current: article.slug.ar },
      slug_en: article.slug.en
        ? { _type: "slug", current: article.slug.en }
        : undefined,
      category: article.category,
      source: article.source,
      sourceUrl: article.sourceUrl,
      imageUrl: article.imageUrl,
      publishedAt: article.publishedAt,
      isPremium: article.isPremium ?? false,
      lang: article.lang,
      tags: article.tags,
    });
    return true;
  } catch {
    return false;
  }
}
