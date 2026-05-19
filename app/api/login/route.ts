import { NextRequest, NextResponse } from "next/server";
import {
  buildLoginUrl,
  PKCE_CV_COOKIE,
  PKCE_STATE_COOKIE,
  PKCE_NONCE_COOKIE,
  RETURN_TO_COOKIE,
  TEMP_COOKIE_TTL,
} from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const returnTo = req.nextUrl.searchParams.get("returnTo") ?? "/fr";
    const host = req.headers.get("host") ?? req.nextUrl.host;
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const baseUrl = `${proto}://${host}`;
    const redirectUri = `${baseUrl}/api/callback`;

    const { url, codeVerifier, state, nonce } = await buildLoginUrl({
      redirectUri,
      returnTo,
    });

    const cookieOpts = {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      maxAge: TEMP_COOKIE_TTL,
      path: "/",
    };

    const res = NextResponse.redirect(url.toString());
    res.cookies.set(PKCE_CV_COOKIE, codeVerifier, cookieOpts);
    res.cookies.set(PKCE_STATE_COOKIE, state, cookieOpts);
    res.cookies.set(PKCE_NONCE_COOKIE, nonce, cookieOpts);
    res.cookies.set(RETURN_TO_COOKIE, returnTo, cookieOpts);
    return res;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
