import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";
import { auth } from "@/auth";

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Auth.js API routes — pass through so auth flows work.
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Login page — pass through so unauthenticated users can log in.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // All other /admin/* routes require an active session.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const session = await auth();
    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname + search);
      return NextResponse.redirect(loginUrl);
    }
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
