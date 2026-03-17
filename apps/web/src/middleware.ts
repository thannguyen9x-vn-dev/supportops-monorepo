import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { defaultLocale, locales } from "./i18n/config";

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always"
});

const publicPaths = ["/login", "/register", "/forgot-password", "/pricing", "/reset-password"];
const refreshCookieNames = ["supportops_refresh_token", "refresh_token"];

function getLocaleFromPath(pathname: string): string {
  const match = pathname.match(/^\/(en|vi)(\/|$)/);
  return match?.[1] ?? defaultLocale;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = intlMiddleware(request);

  const pathWithoutLocale = pathname.replace(/^\/(en|vi)/, "") || "/";
  const isPublicRoute = publicPaths.some((path) => pathWithoutLocale.startsWith(path));
  const hasRefreshToken = refreshCookieNames.some((cookieName) => request.cookies.has(cookieName));

  if (!isPublicRoute && !hasRefreshToken) {
    const locale = getLocaleFromPath(pathname);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};
