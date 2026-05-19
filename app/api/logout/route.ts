import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-server";
import { deleteSession, initDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
    if (sessionId) {
      await initDB();
      await deleteSession(sessionId);
    }
  } catch {}

  const locale = req.cookies.get("NEXT_LOCALE")?.value ?? "fr";
  const res = NextResponse.redirect(new URL(`/${locale}`, req.nextUrl.origin));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
