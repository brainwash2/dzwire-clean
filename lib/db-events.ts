import { pool, initDB } from "./db";
import type { DzEvent, EventCategory } from "./events";

export interface DbEvent {
  id: string;
  date: string;
  end_date?: string | null;
  title_fr: string;
  title_ar: string;
  title_en: string;
  category: string;
  icon: string;
  description_fr?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  location_fr?: string | null;
  location_ar?: string | null;
  location_en?: string | null;
  website?: string | null;
  tags?: string | null;
  is_approx: boolean;
  featured: boolean;
  created_at?: string;
}

export function dbEventToDzEvent(e: DbEvent): DzEvent {
  return {
    id: `db-${e.id}`,
    date: e.date,
    endDate: e.end_date ?? undefined,
    title: { fr: e.title_fr, ar: e.title_ar, en: e.title_en },
    category: e.category as EventCategory,
    icon: e.icon,
    description:
      e.description_fr || e.description_ar || e.description_en
        ? { fr: e.description_fr ?? "", ar: e.description_ar ?? "", en: e.description_en ?? "" }
        : undefined,
    location:
      e.location_fr || e.location_ar || e.location_en
        ? { fr: e.location_fr ?? "", ar: e.location_ar ?? "", en: e.location_en ?? "" }
        : undefined,
    website: e.website ?? undefined,
    tags: e.tags ? e.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    isApprox: e.is_approx,
    featured: e.featured,
  };
}

export async function getCustomEvents(): Promise<DzEvent[]> {
  try {
    await initDB();
    const { rows } = await pool.query<DbEvent>(
      "SELECT * FROM custom_events ORDER BY date ASC"
    );
    return rows.map(dbEventToDzEvent);
  } catch {
    return [];
  }
}
