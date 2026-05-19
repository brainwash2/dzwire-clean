import { createHash } from "crypto";
import { cookies } from "next/headers";
import { pool, initDB } from "./db";

export const ADMIN_COOKIE = "dzwire_admin_token";
const COOKIE_TTL = 60 * 60 * 24 * 7; // 7 days

function salt(): string {
  return process.env.SESSION_SECRET ?? "dzwire-fallback-salt";
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(`${salt()}::pw::${password}`).digest("hex");
}

export function makeToken(passwordHash: string): string {
  return createHash("sha256").update(`${salt()}::tok::${passwordHash}`).digest("hex");
}

export async function isAdminSetup(): Promise<boolean> {
  await initDB();
  const { rows } = await pool.query<{ value: string }>(
    "SELECT value FROM admin_settings WHERE key = 'admin_password_hash' LIMIT 1"
  );
  return rows.length > 0;
}

export async function checkAdminCookie(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (!token) return false;
    await initDB();
    const { rows } = await pool.query<{ value: string }>(
      "SELECT value FROM admin_settings WHERE key = 'admin_token' LIMIT 1"
    );
    return !!rows[0] && rows[0].value === token;
  } catch {
    return false;
  }
}

export { COOKIE_TTL };
