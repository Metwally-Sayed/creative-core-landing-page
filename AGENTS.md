<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Repo Notes

- Treat `nextjs-app/` as the repo root for app work. The outer workspace folder is not the git root.
- Public routes live under `src/app/[lang]/...` and use `next-intl`; admin routes live under `src/app/(admin)/admin/...`.
- Route handling is composed in `src/proxy.ts` (`proxy.ts`, not `middleware.ts`, on Next.js 16).

## Commands In Use

- `npm run dev` — start the Next.js dev server.
- `npm run build` — production build.
- `npm run lint` — run ESLint.
- `npx tsx scripts/hash-password.ts` — interactively generate `ADMIN_PASSWORD_HASH` for `.env.local`.
- `npx tsx scripts/setup-media-bucket.ts` — create the Supabase storage bucket defined by `SUPABASE_STORAGE_BUCKET` (defaults to `media`).

## Env Setup

- Admin auth expects `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD_HASH`.
- Media/admin server actions expect `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally `SUPABASE_STORAGE_BUCKET`.
- Generate `AUTH_SECRET` with `openssl rand -base64 32`.
