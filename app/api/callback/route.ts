import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCode,
  SESSION_COOKIE,
  PKCE_CV_COOKIE,
  PKCE_STATE_COOKIE,
  PKCE_NONCE_COOKIE,
  RETURN_TO_COOKIE,
} from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const cv = req.cookies.get(PKCE_CV_COOKIE)?.value;
    const state = req.cookies.get(PKCE_STATE_COOKIE)?.value;
    const nonce = req.cookies.get(PKCE_NONCE_COOKIE)?.value;
    const returnTo = req.cookies.get(RETURN_TO_COOKIE)?.value ?? "/fr";

    if (!cv || !state || !nonce) {
      return NextResponse.redirect(new URL("/fr", req.nextUrl.origin));
    }

    const host = req.headers.get("host") ?? req.nextUrl.host;
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const baseUrl = `${proto}://${host}`;
    const redirectUri = `${baseUrl}/api/callback`;

    const currentUrl = new URL(req.url);

    const sessionId = await exchangeCode({
      currentUrl,
      redirectUri,
      codeVerifier: cv,
      expectedState: state,
      expectedNonce: nonce,
    });

    const destination = returnTo.startsWith("/") ? returnTo : "/fr";
    const res = NextResponse.redirect(new URL(destination, baseUrl));

    res.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    res.cookies.delete(PKCE_CV_COOKIE);
    res.cookies.delete(PKCE_STATE_COOKIE);
    res.cookies.delete(PKCE_NONCE_COOKIE);
    res.cookies.delete(RETURN_TO_COOKIE);

    return res;
  } catch (err) {
    console.error("[auth/callback]", err);
    return NextResponse.redirect(new URL("/fr?auth_error=1", req.nextUrl.origin));
  }
}
