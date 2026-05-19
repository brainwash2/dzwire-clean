import { NextRequest, NextResponse } from "next/server";
import { pool, initDB } from "@/lib/db";
import { checkAdminCookie } from "@/lib/admin-auth";
import type { DbEvent } from "@/lib/db-events";

export async function GET(req: NextRequest) {
  if (!(await checkAdminCookie())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initDB();
  const { rows } = await pool.query<DbEvent>(
    "SELECT * FROM custom_events ORDER BY date ASC, created_at DESC"
  );
  return NextResponse.json({ events: rows });
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminCookie())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initDB();
  const body = (await req.json()) as Omit<DbEvent, "id" | "created_at">;
  const id = crypto.randomUUID();
  const { rows } = await pool.query<DbEvent>(
    `INSERT INTO custom_events
       (id, date, end_date, title_fr, title_ar, title_en, category, icon,
        description_fr, description_ar, description_en,
        location_fr, location_ar, location_en,
        website, tags, is_approx, featured)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     RETURNING *`,
    [
      id,
      body.date, body.end_date || null,
      body.title_fr, body.title_ar, body.title_en,
      body.category, body.icon || "📅",
      body.description_fr || null, body.description_ar || null, body.description_en || null,
      body.location_fr || null, body.location_ar || null, body.location_en || null,
      body.website || null,
      body.tags || null,
      body.is_approx ?? false,
      body.featured ?? false,
    ]
  );
  return NextResponse.json({ event: rows[0] }, { status: 201 });
}
