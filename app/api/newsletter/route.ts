import { NextRequest, NextResponse } from "next/server";
import { initDB, pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email: string = (body?.email ?? "").trim().toLowerCase();
    const locale: string = body?.locale ?? "fr";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    await initDB();

    await pool.query(
      `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id         SERIAL PRIMARY KEY,
        email      VARCHAR NOT NULL UNIQUE,
        locale     VARCHAR DEFAULT 'fr',
        subscribed_at TIMESTAMPTZ DEFAULT NOW(),
        confirmed  BOOLEAN DEFAULT false
      )`
    );

    await pool.query(
      `INSERT INTO newsletter_subscribers (email, locale)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET locale = EXCLUDED.locale`,
      [email, locale]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await initDB();
    await pool.query(
      `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id         SERIAL PRIMARY KEY,
        email      VARCHAR NOT NULL UNIQUE,
        locale     VARCHAR DEFAULT 'fr',
        subscribed_at TIMESTAMPTZ DEFAULT NOW(),
        confirmed  BOOLEAN DEFAULT false
      )`
    );
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS count FROM newsletter_subscribers`
    );
    return NextResponse.json({ count: Number(rows[0]?.count ?? 0) });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
