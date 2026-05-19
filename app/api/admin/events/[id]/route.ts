import { NextRequest, NextResponse } from "next/server";
import { pool, initDB } from "@/lib/db";
import { checkAdminCookie } from "@/lib/admin-auth";
import type { DbEvent } from "@/lib/db-events";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminCookie())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await initDB();
  const body = (await req.json()) as Partial<DbEvent>;
  const { rows } = await pool.query<DbEvent>(
    `UPDATE custom_events SET
       date=$1, end_date=$2,
       title_fr=$3, title_ar=$4, title_en=$5,
       category=$6, icon=$7,
       description_fr=$8, description_ar=$9, description_en=$10,
       location_fr=$11, location_ar=$12, location_en=$13,
       website=$14, tags=$15, is_approx=$16, featured=$17
     WHERE id=$18 RETURNING *`,
    [
      body.date, body.end_date || null,
      body.title_fr, body.title_ar, body.title_en,
      body.category, body.icon || "📅",
      body.description_fr || null, body.description_ar || null, body.description_en || null,
      body.location_fr || null, body.location_ar || null, body.location_en || null,
      body.website || null,
      body.tags || null,
      body.is_approx ?? false,
      body.featured ?? false,
      id,
    ]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ event: rows[0] });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminCookie())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await initDB();
  await pool.query("DELETE FROM custom_events WHERE id=$1", [id]);
  return NextResponse.json({ ok: true });
}
