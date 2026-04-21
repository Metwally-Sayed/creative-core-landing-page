import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes are not localized — sub-project #1 (auth) will add its own
  // protection logic here when that work resumes. For now, just pass through.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  // Auth.js API routes (from sub-project #1) — pass through untouched.
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Everything else is a public route — apply i18n locale handling.
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except:
    //   - /_next (Next.js internals)
    //   - /_vercel (Vercel internals)
    //   - Any file with an extension (static assets)
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
