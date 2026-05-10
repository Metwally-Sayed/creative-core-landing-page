<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Repo Notes

- Treat `nextjs-app/` as the repo root for app work. The outer workspace folder is not the git root.
- Public routes live under `src/app/[lang]/...` and use `next-intl`; admin routes live under `src/app/(admin)/admin/...`.
- Route handling is composed in `src/proxy.ts` (`proxy.ts`, not `middleware.ts`, on Next.js 16).
- `src/lib/supabase.ts` is server-only and uses the Supabase service-role key; never import it into Client Components.
- Admin writes revalidate cache tags via `revalidateTag(_, "max")`; current tags in use include `settings`, `pages`, `projects`, `nav_links`, `faq`, and `locations`. Prefer extending tag-based invalidation over full-route refreshes.

## Commands In Use

- `npm run dev` — start the Next.js dev server.
- `npm run build` — production build.
- `npm run start` — run the production server after a successful build.
- `npm run lint` — run ESLint.
- `npx tsx scripts/hash-password.ts` — legacy helper for generating `ADMIN_PASSWORD_HASH`; `.env.example` still references it, but current admin auth uses `/admin/signup`.
- `npx tsx scripts/setup-media-bucket.ts` — create the Supabase storage bucket defined by `SUPABASE_STORAGE_BUCKET` (defaults to `media`).
- `npx tsx scripts/seed-collections.ts` — seed starter rows for `locations` and `faq_items`.
- `npx tsx scripts/seed-pages.ts` — upsert the default page-builder pages and sections.
- `npx tsx scripts/seed-from-snapshot.ts` — reset and reseed projects plus related media from `tmp/seed-projects.en-ar.snapshot.txt`.

## Env Setup

- `.env.example` currently includes `PAYLOAD_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_SERVER_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally `SUPABASE_STORAGE_BUCKET`.
- Admin auth currently requires `AUTH_SECRET`; the first admin account is created through `/admin/signup` and stored in the `admin_users` table.
- TODO: `.env.example` still documents `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH`, but current auth source does not read them; treat `scripts/hash-password.ts` as legacy unless the signup flow is removed.
- Media/admin server actions and seed scripts expect `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally `SUPABASE_STORAGE_BUCKET`.
- Generate `AUTH_SECRET` with `openssl rand -base64 32`.
