import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["fr", "ar", "en"];
const DEFAULT = "fr";

// Define routes that require authentication
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // 1. Enforce authentication on admin routes
  if (isAdminRoute(request)) {
    const session = await auth();
    // Redirect unauthenticated requests to your localized home page
    if (!session.userId) {
      return NextResponse.redirect(new URL(`/${DEFAULT}`, request.url));
    }
  }

  // 2. Perform locale validation and routing redirects
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) {
    return NextResponse.next();
  }

  // Detect locale from cookies or browser headers
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  let locale = DEFAULT;
  if (cookie && LOCALES.includes(cookie)) {
    locale = cookie;
  } else {
    const accept = request.headers.get("accept-language") || "";
    if (accept.startsWith("ar")) locale = "ar";
    else if (accept.startsWith("en")) locale = "en";
  }

  const newUrl = new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url);
  const response = NextResponse.redirect(newUrl);
  response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
  return response;
});

export const config = {
  // Matches all routes except static files, assets, and APIs (excluding our admin API)
  matcher: ["/((?!api|_next|.*\\..*).*)", "/api/admin/(.*)"],
};
