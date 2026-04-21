# CMS Sub-project #1.5: Localization (EN/AR) with RTL Support

**Status:** Approved — ready for implementation plan
**Date:** 2026-04-21
**Branch:** `rebuild`
**Sub-project:** 1.5 of 5 in the CMS buildout (inserted between auth and media to unblock multilingual foundations)

## Context

The `rebuild` branch of the Hello Monday site currently hard-codes `lang="en"` in the root layout and has no i18n library. Before investing in the CMS content layer (sub-projects #2–5), the site needs a bilingual foundation (English + Arabic) with RTL-compatible layouts, so every content type designed later carries localization through cleanly.

This spec covers **structure only** — real Arabic copy is deferred to a translator. Placeholders are used throughout the `ar.json` message file.

## Relation to other sub-projects

- **Sub-project #1 (auth & admin shell)** — paused during i18n work. Resumes after #1.5.
- **Sub-project #1.5 (this spec)** — adds i18n routing, RTL CSS, font loading, translation files.
- **Sub-project #2 (media)** and **#3 (simple collections)** will NOT need to re-architect for i18n once this lands.
- **Sub-project #4 (projects collection)** will introduce bilingual CMS fields that leverage the patterns established here.

## Goal

Deliver a bilingual public site (`/en/*` and `/ar/*`), with full RTL layout support for Arabic, a locale switcher, Arabic-capable fonts conditionally loaded on AR routes, and all UI chrome strings extracted to translation files. Real AR translations are out of scope (placeholders only).

## Scope decisions (from brainstorm)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| URL strategy | Path prefix for all locales (`/en/...`, `/ar/...`) | Clean, SEO-friendly, `next-intl`-native |
| Library | `next-intl` | App Router-native, Server Component-first, mature |
| AR completeness | Structure only (placeholders) | Unblocks dev without waiting on translator |
| Existing catalogs | Defer bilingual conversion | Catalogs slated for replacement by CMS in sub-project #4 |
| Default locale behavior | Detect once from `Accept-Language`, persist in cookie | Standard pattern, respected by `next-intl` |
| Arabic fonts | Dedicated AR pair (Noto Naskh Arabic + IBM Plex Sans Arabic) | Preserves English brand, gives Arabic readers intentional typography |
| Admin localization | Admin stays English-only | Single admin, no value in localizing |

## Architecture

### Stack additions

- `next-intl` (latest stable for Next.js 16)
- `next/font/google`: `IBM_Plex_Sans_Arabic`, `Noto_Naskh_Arabic`
- Tailwind logical-property utilities already ship in Tailwind v4 — no plugin needed

### Route restructure

All public routes move under a `[lang]` dynamic segment. The admin route group from sub-project #1 stays at its current path. API routes are not moved.

```
src/app/
├── layout.tsx                     # NEW — minimal root: <html><body>{children}</body></html>
├── [lang]/                        # NEW route group
│   ├── layout.tsx                 # MOVED+REWORKED from old root layout (fonts, Lenis, etc.)
│   ├── page.tsx                   # MOVED from src/app/page.tsx
│   ├── about/page.tsx             # MOVED from src/app/about/page.tsx
│   ├── services/page.tsx
│   ├── work/page.tsx
│   ├── product/page.tsx
│   ├── products/page.tsx
│   └── projects/[id]/page.tsx
├── (admin)/                       # unchanged — from sub-project #1
└── api/                           # unchanged — not localized
```

### Locale configuration

Single source of truth for locales lives in `src/i18n/config.ts`:

```ts
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};
```

### Composed proxy

Next.js 16 uses `src/proxy.ts` (replacing `middleware.ts`). Both i18n routing and admin auth protection need to run — they dispatch by URL:

```ts
// src/proxy.ts (simplified)
import createIntlMiddleware from "next-intl/middleware";
import { auth } from "@/auth";
import { locales, defaultLocale } from "@/i18n/config";

const intlProxy = createIntlMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  if (pathname === "/admin/login" || pathname.startsWith("/admin")) {
    // Delegate to Auth.js proxy logic (reuses logic from sub-project #1)
    return adminAuthProxy(request);
  }

  // Everything else is public and localized
  return intlProxy(request);
}

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/admin/:path*",
    "/api/auth/:path*",
  ],
};
```

The Auth.js proxy logic from sub-project #1 is extracted into a small helper so `proxy.ts` can compose both.

### Path handling

| URL | Outcome |
|-----|---------|
| `/` | Middleware redirects to `/en/` or `/ar/` based on cookie/`Accept-Language` |
| `/en/work` | Work page, English |
| `/ar/work` | Work page, Arabic (UI strings in AR placeholders; catalog content falls back to English) |
| `/work` (no prefix) | Redirect to `/{locale}/work` per cookie |
| `/admin/*` | Untouched by i18n; Auth.js proxy applies |
| `/api/*` | Untouched by i18n |

### next-intl server config

`src/i18n/request.ts` (the Server Component config that `next-intl` calls to load messages):

```ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { locales, defaultLocale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  const candidate = await requestLocale;
  const locale = hasLocale(locales, candidate) ? candidate : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

Imported from `next.config.ts` via the `next-intl/plugin` wrapper.

## Translation files

```
messages/
├── en.json
└── ar.json
```

### Scope of extraction

Strings extracted from hardcoded locations in components and page.tsx files:

| Region | Examples |
|--------|----------|
| `nav` | "Work", "Services", "About", "Product" |
| `common` | "Start Your Project", "See Our Work", "Scroll to explore", "Read more", "Get Quote" |
| `home` | Hero headline lines, hero body ("Brand strategy, identity, content…"), product section copy |
| `work` | "Selected Work" label, filter chip labels (All, Design, Strategy, Experience, Digital), layout subtitle |
| `services` | "What we do", section eyebrows, awards intro |
| `about` | "Who we are", jump-link labels, Code of Honor intro |
| `product` | Editorial section titles, CTA copy |
| `footer` | Section headers (Contact, Careers, Collaborate), social link labels, locale switch label |
| `quote` | Form step labels, field labels, button labels, validation messages |
| `locale` | Switcher labels ("English", "العربية"), aria-label for the toggle |

### NOT extracted

- Catalog entries (project titles, team names, service descriptions, location addresses) — stays English. AR routes render English catalog data.
- Admin strings — admin is English-only.
- Metadata (`<title>`, `<meta description>`) — polished SEO localization is a separate sub-project.

### Message file format

Flat-nested, one level deep per region. No ICU plurals in initial set (add only when a use case appears).

```json
// messages/en.json
{
  "nav": { "work": "Work", "services": "Services", "about": "About", "product": "Product" },
  "common": { "startProject": "Start Your Project", "seeWork": "See Our Work", "scrollToExplore": "Scroll to explore" },
  "home": { "heroBody": "Brand strategy, identity, content, and 3D visuals that convert." },
  "locale": { "switchToArabic": "العربية", "switchToEnglish": "English", "toggleAria": "Switch language" }
}
```

```json
// messages/ar.json — placeholders only
{
  "nav": { "work": "[AR] Work", "services": "[AR] Services", "about": "[AR] About", "product": "[AR] Product" },
  "common": { "startProject": "[AR] Start Your Project", "seeWork": "[AR] See Our Work", "scrollToExplore": "[AR] Scroll to explore" },
  "home": { "heroBody": "[AR] Brand strategy, identity, content, and 3D visuals that convert." },
  "locale": { "switchToArabic": "العربية", "switchToEnglish": "English", "toggleAria": "تبديل اللغة" }
}
```

A few strings that are already Arabic (the locale switcher label, the toggle aria-label) are real Arabic — not placeholders — because they are structural rather than copy.

## Fonts

### Loading strategy

English fonts (Playfair Display + Inter) load on every public route — established by `next/font` in the `[lang]/layout.tsx`. Arabic fonts load alongside them only when the resolved locale is AR.

```tsx
// src/app/[lang]/layout.tsx (sketch)
import { Inter, Playfair_Display, IBM_Plex_Sans_Arabic, Noto_Naskh_Arabic } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "700"], variable: "--font-plex-arabic" });
const notoNaskh = Noto_Naskh_Arabic({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-noto-naskh" });

// All four variable class names attach to <html>; CSS decides which stack wins via [dir="rtl"].
```

Per `next/font` semantics, a font referenced in code is statically extracted; it doesn't conditionally "not load" just because a page didn't render it. To keep Arabic out of EN page bundles, we gate the Arabic font classes to apply only when `lang === "ar"` (still declared in every `[lang]/layout.tsx` render, but with `display: "swap"` so EN pages won't block on AR font loads).

### CSS variable swap

In `src/app/globals.css`:

```css
:root {
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-serif: var(--font-playfair), Georgia, serif;
}
[dir="rtl"] {
  --font-sans: var(--font-plex-arabic), var(--font-inter), system-ui, sans-serif;
  --font-serif: var(--font-noto-naskh), var(--font-playfair), Georgia, serif;
}
```

All existing uses of `font-sans` and `font-serif` pick up the swap automatically. Components that reference `--font-inter` or `--font-playfair` directly (via arbitrary-value Tailwind) get audited in the RTL pass.

## RTL CSS audit

Every file used by a public-site page gets swept for directional utilities. Admin components are excluded.

### Class substitutions

| LTR | Logical (RTL-aware) |
|-----|---------------------|
| `ml-*` | `ms-*` |
| `mr-*` | `me-*` |
| `pl-*` | `ps-*` |
| `pr-*` | `pe-*` |
| `left-*` | `start-*` |
| `right-*` | `end-*` |
| `border-l*` | `border-s*` |
| `border-r*` | `border-e*` |
| `rounded-l-*` / `rounded-tl-*` | `rounded-s-*` / `rounded-ss-*` |
| `rounded-r-*` / `rounded-tr-*` | `rounded-e-*` / `rounded-se-*` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `space-x-*` | add `rtl:space-x-reverse` |
| `-translate-x-*` / `translate-x-*` | audit case-by-case; may need `rtl:translate-x-*` variant |

### Targeted files

Confirmed to contain directional utilities and layout assumptions that need RTL verification:

- `src/components/sections/Hero.tsx`
- `src/components/sections/CreativeHero.tsx`
- `src/components/sections/Projects.tsx`
- `src/components/sections/ProductSection.tsx`
- `src/components/sections/FaqQuoteSection.tsx`
- `src/components/sections/Footer.tsx`
- `src/components/Header.tsx`
- `src/components/QuoteBriefDialog.tsx`
- `src/components/LiquidCard.tsx`
- `src/components/CustomCursor.tsx`
- `src/components/projects/*` (all files)
- `src/components/work/*`
- `src/components/about/*`
- `src/components/services/*`
- `src/components/product/*`
- `src/components/editorial/*`
- `src/components/ui/*` — only the primitives actually imported by public-site files

A grep-driven sweep (see implementation plan) confirms coverage.

### Arrow icons

Icons like `ArrowUpRight` point the wrong way in RTL. Approach: add a small `<DirAwareArrow>` wrapper that applies `rtl:scale-x-[-1]` via a Tailwind arbitrary variant, or swap to different icons in RTL. The choice is case-by-case during the audit.

### Animation audit

`framer-motion` initial/exit values that use a directional axis need RTL mirroring. Example:

```tsx
// Before
<motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} />
// After
const dir = useDirection(); // returns 1 for ltr, -1 for rtl
<motion.div initial={{ x: -40 * dir, opacity: 0 }} animate={{ x: 0, opacity: 1 }} />
```

A tiny hook `useDirection()` that reads from `useLocale()` centralizes this.

## Locale switcher

`<LocaleSwitch>` component in the header, to the left of the "Get Quote" CTA. On mobile, lives in the drawer menu.

### UX

- Current locale shown bold; alternate shown muted: `EN | ع`
- Clickable region covers both labels
- Clicking:
  1. Sets `NEXT_LOCALE` cookie (handled by `next-intl`'s `Link` or `redirect` helpers)
  2. Navigates to the same pathname with the other locale prefix
  3. Page re-renders with the new locale
- aria-label: "Switch language" (translated)
- Keyboard accessible (standard button)

### Implementation sketch

```tsx
"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next-intl/client";

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const next = locale === "en" ? "ar" : "en";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: next })}
      aria-label="Switch language"
    >
      <span className={locale === "en" ? "font-semibold" : "opacity-60"}>EN</span>
      <span className="mx-1 opacity-40">|</span>
      <span className={locale === "ar" ? "font-semibold" : "opacity-60"}>ع</span>
    </button>
  );
}
```

## Files to create

| Path | Purpose |
|------|---------|
| `src/i18n/config.ts` | Locale list, default, direction map |
| `src/i18n/request.ts` | `getRequestConfig` for server-side message loading |
| `src/i18n/navigation.ts` | Re-exports `next-intl/navigation` helpers bound to our locale config |
| `messages/en.json` | English UI chrome strings |
| `messages/ar.json` | Arabic placeholders (same keys as en) |
| `src/app/[lang]/layout.tsx` | Public-site layout — fonts, `<html lang dir>`, NextIntlClientProvider, Lenis |
| `src/app/[lang]/page.tsx` | Homepage (moved) |
| `src/app/[lang]/about/page.tsx` | (moved) |
| `src/app/[lang]/services/page.tsx` | (moved) |
| `src/app/[lang]/work/page.tsx` | (moved) |
| `src/app/[lang]/product/page.tsx` | (moved) |
| `src/app/[lang]/products/page.tsx` | (moved) |
| `src/app/[lang]/projects/[id]/page.tsx` | (moved) |
| `src/components/LocaleSwitch.tsx` | Header language toggle |
| `src/hooks/useDirection.ts` | Returns 1 (ltr) or -1 (rtl); used by motion animations |

## Files to modify

| Path | Change |
|------|--------|
| `src/app/layout.tsx` | Replace with a minimal passthrough root: `export default function RootLayout({ children }) { return children; }`. The full `<html>`/`<body>` structure moves to `[lang]/layout.tsx` so `lang` and `dir` attributes can reflect the resolved locale. This is the current `next-intl` recommended pattern for localized root layouts. |
| `src/app/globals.css` | Add `--font-*` variable swap under `[dir="rtl"]` |
| `next.config.ts` | Wrap export with `createNextIntlPlugin('./src/i18n/request.ts')` |
| `src/proxy.ts` | Compose `next-intl` middleware + Auth.js admin gate (extracted from sub-project #1) |
| `src/components/Header.tsx` | Extract strings to translation keys; add `<LocaleSwitch>`; convert directional utilities |
| `src/components/sections/Footer.tsx` | Extract strings; add mobile `<LocaleSwitch>`; RTL audit |
| All files listed in "Targeted files" above | Convert LTR utilities to logical properties; translate hardcoded strings |
| `src/app/page.tsx` → redirect stub OR deleted depending on `next-intl` config | The pathname-less root is handled by the middleware redirect |

## Environment variables

No new env vars required for this sub-project.

## Error handling

| Situation | Behavior |
|-----------|----------|
| Unknown locale in URL (`/fr/work`) | `hasLocale()` check in `request.ts` returns false → 404 |
| Missing key in `messages/*.json` | `next-intl` throws at render time in dev, shows key name in prod — the manual verification pass catches these |
| Cookie is set to an unsupported value | Middleware ignores it and falls back to `Accept-Language` |
| RTL-broken component | Visible during manual AR smoke test; filed as fix |
| Malformed JSON in message files | `next-intl` surfaces at import time; fail fast in dev |

## Testing

No automated test framework yet (per sub-project #1 decision). Manual verification:

1. `/` redirects to `/en/` or `/ar/` based on `Accept-Language` (simulate with `curl -H "Accept-Language: ar" -I http://localhost:3000/`).
2. `/en/` loads with `<html lang="en" dir="ltr">`.
3. `/ar/` loads with `<html lang="ar" dir="rtl">` and Arabic fonts applied.
4. Switching locale via `<LocaleSwitch>` on any page navigates to the same pathname with the other prefix.
5. Cookie `NEXT_LOCALE` is set after manual switch; next visit to `/` honors it.
6. Every public page renders correctly in both locales: Home, Work, About, Services, Product(s), Projects/[id].
7. Visual RTL check: scroll through every public page in `/ar/`, compare to `/en/`:
   - Navigation, logo, CTA positions mirror correctly
   - Cards, grids flow right-to-left where appropriate
   - Directional icons (arrows) point the correct way
   - Animations slide in from the correct direction
   - No overlapping or clipped content
8. Admin is unaffected: `/admin` still redirects to `/admin/login` (not `/en/admin/login`).
9. `npm run build` succeeds with zero type errors.
10. Bundle-size smoke: diff `.next/analyze` output before/after — Arabic font bundle should only load on AR routes.

## Out of scope (explicitly deferred)

- Real Arabic translations (pro translator)
- Catalog bilingual conversion (deferred to CMS sub-projects)
- Admin localization
- Localized 404 / error pages
- Localized SEO metadata / `hreflang` tags / sitemap
- Advanced RTL motion (complex scroll-linked animations)
- Pluralization / ICU message format
- Locale-aware date/number/currency formatting (add when UI needs it)
- Right-to-left typing indicators, bidirectional input handling in forms (defer to CMS editor work)

## Risks

| Risk | Mitigation |
|------|------------|
| Composing two proxies in Next 16 is undocumented | Isolate in `composeProxy` helper; verify manually; fall back to conditional logic per path |
| RTL audit misses a component | Grep-driven sweep + side-by-side visual check; flagged as iterative |
| `next/font` doesn't conditionally load Arabic fonts | Use `display: "swap"` + check bundle analysis; worst case, Arabic fonts load on EN too (acceptable tradeoff) |
| `framer-motion` x-axis values hard-coded in 10+ places | `useDirection()` hook + audit; non-critical animations can stay LTR-only with a `rtl:hidden` fallback |
| Tailwind logical utilities missing in v4 for some properties | v4 supports `ms/me/ps/pe/start/end` natively; any gap handled with arbitrary variants (`rtl:...`) |
| Placeholder `[AR]` copy shipped to production by mistake | Add a lint/CI warning if any `[AR]` string is present in a prod build (follow-up) |

## Transition

Next step: invoke `superpowers:writing-plans` to produce a bite-sized task-by-task implementation plan for this spec.
