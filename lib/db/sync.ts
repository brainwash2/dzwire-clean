import { query } from "../db";
import type { Article } from "../types";

/**
 * Ensures a relational mapping entry exists for dynamic Sanity documents inside PostgreSQL.
 * Maps Sanity string IDs strictly to metadata tables.
 */
export async function syncSanityDocumentMeta(article: Article): Promise<void> {
  try {
    await query(
      `INSERT INTO system_metadata (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [
        `sanity_sync:${article.id}`,
        JSON.stringify({
          slugs: article.slug,
          category: article.category,
          updatedAt: new Date().toISOString(),
        }),
      ]
    );
  } catch (error) {
    console.error(`[DB SYNC ERROR] Failed to map Sanity document meta ${article.id}:`, error);
  }
}

/**
 * Automatically cleans up relational metadata mapping records when an article is deleted in Sanity.
 */
export async function purgeSanityDocumentMeta(id: string): Promise<void> {
  try {
    await query(`DELETE FROM system_metadata WHERE key = $1`, [`sanity_sync:${id}`]);
  } catch (error) {
    console.error(`[DB SYNC ERROR] Failed to delete Sanity document meta ${id}:`, error);
  }
}
