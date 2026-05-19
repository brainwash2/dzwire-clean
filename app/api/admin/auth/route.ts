import { NextRequest, NextResponse } from "next/server";
import { pool, initDB } from "@/lib/db";
import { hashPassword, makeToken, isAdminSetup, ADMIN_COOKIE, COOKIE_TTL } from "@/lib/admin-auth";

// POST /api/admin/auth  body: { action: "setup"|"login", password: string }
export async function POST(req: NextRequest) {
  try {
    await initDB();
    const { action, password } = (await req.json()) as { action: string; password: string };

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const setup = await isAdminSetup();

    if (action === "setup") {
      if (setup) return NextResponse.json({ error: "Admin already configured." }, { status: 409 });
      const ph = hashPassword(password);
      const tok = makeToken(ph);
      await pool.query(
        `INSERT INTO admin_settings (key, value) VALUES ($1,$2),($3,$4)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        ["admin_password_hash", ph, "admin_token", tok]
      );
      const res = NextResponse.json({ ok: true });
      res.cookies.set(ADMIN_COOKIE, tok, { httpOnly: true, maxAge: COOKIE_TTL, path: "/" });
      return res;
    }

    if (action === "login") {
      if (!setup) return NextResponse.json({ error: "Admin not set up yet." }, { status: 400 });
      const { rows } = await pool.query<{ value: string }>(
        "SELECT value FROM admin_settings WHERE key = 'admin_password_hash' LIMIT 1"
      );
      const expectedHash = rows[0]?.value;
      if (!expectedHash || hashPassword(password) !== expectedHash) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
      }
      const { rows: tokRows } = await pool.query<{ value: string }>(
        "SELECT value FROM admin_settings WHERE key = 'admin_token' LIMIT 1"
      );
      const res = NextResponse.json({ ok: true });
      res.cookies.set(ADMIN_COOKIE, tokRows[0]!.value, { httpOnly: true, maxAge: COOKIE_TTL, path: "/" });
      return res;
    }

    if (action === "logout") {
      const res = NextResponse.json({ ok: true });
      res.cookies.delete(ADMIN_COOKIE);
      return res;
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("Admin auth error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
