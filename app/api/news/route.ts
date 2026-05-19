import { NextRequest, NextResponse } from "next/server";
import { getAllArticles, getArticlesByCategory, upsertArticle } from "@/lib/store";
import { fetchSanityArticles } from "@/lib/sanity";
import type { Category, Article } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lang = searchParams.get("lang");
  const category = searchParams.get("category") as Category | null;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
  const source = searchParams.get("source"); // "sanity" | "all" | null

  let articles: Article[] = [];

  if (source === "sanity") {
    articles = await fetchSanityArticles();
  } else {
    const [sanityArticles] = await Promise.allSettled([fetchSanityArticles()]);
    const memArticles = getAllArticles();

    if (sanityArticles.status === "fulfilled" && sanityArticles.value.length > 0) {
      const sanityIds = new Set(sanityArticles.value.map((a) => a.id));
      const memOnly = memArticles.filter((a) => !sanityIds.has(a.id));
      articles = [...sanityArticles.value, ...memOnly];
    } else {
      articles = memArticles;
    }
  }

  if (lang === "fr" || lang === "ar") {
    articles = articles.filter((a) => a.lang === lang);
  }
  if (category) {
    articles = articles.filter((a) => a.category === category);
  }

  articles = articles.slice(0, limit);

  return NextResponse.json({ data: articles, error: null });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, category, source, lang } = body;

    if (!title?.fr || !title?.ar || !content?.fr || !content?.ar || !category || !source || !lang) {
      return NextResponse.json(
        { data: null, error: "Missing required fields: title (fr/ar), content (fr/ar), category, source, lang" },
        { status: 400 }
      );
    }

    const id = `api-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const slugify = (t: string) =>
      t.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

    const article: Article = {
      id,
      title: { fr: title.fr, ar: title.ar },
      slug: { fr: slugify(title.fr), ar: slugify(title.ar) },
      excerpt: {
        fr: content.fr?.slice(0, 200) ?? title.fr,
        ar: content.ar?.slice(0, 200) ?? title.ar,
      },
      content: { fr: content.fr, ar: content.ar },
      category,
      source,
      sourceUrl: body.sourceUrl ?? "#",
      imageUrl: body.imageUrl ?? `https://picsum.photos/seed/${id}/800/450`,
      publishedAt: new Date().toISOString(),
      lang,
      tags: body.tags ?? [],
      curatedBy: body.curatedBy ?? "API",
    };

    upsertArticle(article);
    return NextResponse.json({ data: article, error: null }, { status: 201 });
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON body" }, { status: 400 });
  }
}
