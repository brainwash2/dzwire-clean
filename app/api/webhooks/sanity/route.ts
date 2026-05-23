import { NextRequest, NextResponse } from "next/server";
import { upsertArticle, query } from "@/lib/store";
import type { Article, Category, Locale } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Real-time Sanity CMS to PostgreSQL Database Synchronization Webhook
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-sanity-webhook-token");
    const secret = process.env.SANITY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("Missing SANITY_WEBHOOK_SECRET in environment variables");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // Verify webhook authority
    if (token !== secret) {
      console.warn("[SECURITY] Unauthorized Sanity Webhook execution attempt rejected.");
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const payload = await request.json();
    const { _id, _type, _action } = payload;

    console.log(`[SANITY WEBHOOK] Received action '${_action}' on document '${_id}' of type '${_type}'`);

    // Handle Deletions
    if (_action === "delete" || payload.isDeleted === true) {
      console.log(`[SANITY WEBHOOK] Deleting article ${_id} from PostgreSQL and memory cache...`);
      
      // Clear from in-memory cache
      if (global.__articlesCache) {
        global.__articlesCache.delete(_id);
      }
      
      // Delete from PostgreSQL
      await query(`DELETE FROM articles WHERE id = $1`, [_id]);
      
      return NextResponse.json({ success: true, deleted: _id });
    }

    // Handle Article Upserts
    if (_type === "article") {
      const mappedArticle: Article = {
        id: _id,
        title: {
          fr: payload.title_fr || "",
          ar: payload.title_ar || "",
          en: payload.title_en || ""
        },
        slug: {
          fr: payload.slug_fr?.current || payload._id,
          ar: payload.slug_ar?.current || payload._id,
          en: payload.slug_en?.current || payload._id
        },
        excerpt: {
          fr: payload.excerpt_fr || "",
          ar: payload.excerpt_ar || "",
          en: payload.excerpt_en || ""
        },
        content: {
          fr: payload.content_fr || "",
          ar: payload.content_ar || "",
          en: payload.content_en || ""
        },
        category: (payload.category || "politique") as Category,
        source: payload.source || "DzWire Editorial",
        sourceUrl: payload.sourceUrl || "https://dzwire-news.vercel.app",
        imageUrl: payload.imageUrl || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60",
        publishedAt: payload.publishedAt || new Date().toISOString(),
        lang: (payload.lang || "fr") as Locale,
        tags: payload.tags || ["Editorial"],
        isSponsored: payload.isSponsored || false,
        isPremium: payload.isPremium || false
      };

      console.log(`[SANITY WEBHOOK] Syncing published article '${mappedArticle.title.fr || mappedArticle.title.ar}' to Postgres...`);
      
      // Writes through to memory cache AND PostgreSQL database atomically
      upsertArticle(mappedArticle);

      return NextResponse.json({ success: true, synced: _id });
    }

    return NextResponse.json({ success: true, message: "Ignored document type" });
  } catch (error) {
    console.error("[SANITY WEBHOOK ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Sync execution failure" },
      { status: 500 }
    );
  }
}
