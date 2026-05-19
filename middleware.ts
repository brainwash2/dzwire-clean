import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["fr", "ar", "en"];
const DEFAULT_LOCALE = "fr";
const COOKIE_NAME = "NEXT_LOCALE";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value;
  let locale = DEFAULT_LOCALE;

  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const acceptLanguage = request.headers.get("accept-language") ?? "";
    const primary = acceptLanguage.split(",")[0]?.split(";")[0]?.trim().toLowerCase() ?? "";
    if (primary.startsWith("ar")) {
      locale = "ar";
    } else if (primary.startsWith("en")) {
      locale = "en";
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set(COOKIE_NAME, locale, { path: "/" });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
