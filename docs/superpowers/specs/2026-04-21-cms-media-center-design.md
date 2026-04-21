# CMS Sub-project #2: Media Center

**Status:** Approved — ready for implementation plan
**Date:** 2026-04-21
**Branch:** `rebuild`
**Sub-project:** 2 of 5 in the CMS buildout

## Context

Builds on sub-project #1 (Auth & Admin Shell). The admin area is live with JWT-protected routes and a navigable shell. This sub-project adds a full media management system under `/admin/media`.

Sub-projects remaining after this:
3. Simple collections (Locations, FAQ, Team, Code-of-Honor, Awards)
4. Rich collection: Projects
5. Page builder + globals

## Goal

A working media library where the admin can upload, browse, edit metadata for, and delete images, videos, and documents. Also delivers a reusable `<AssetPicker>` modal component ready for sub-project #4 (Projects) to consume.

## Scope decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage backend | Supabase Storage | Already chosen by the team; MCP connected |
| File types | Images, video, documents | Full agency asset coverage |
| Upload UX | Drag-and-drop + multi-select + URL import | Covers all real workflows |
| Metadata | title, alt_text, tags (Postgres table) | Enough for content management without over-engineering |
| Integration stub | `<AssetPicker>` modal now, Projects wires it in sub-project #4 | Decouples delivery, no blocker |
| Auth | Service-role key server-side only; never exposed to browser | Security baseline |

## Architecture

### Upload strategy (hybrid)

**File picker + drag-and-drop → direct browser upload**
1. Client calls server action `getSignedUploadUrl()` → receives one-time signed URL + final public URL
2. Client uploads directly to Supabase Storage via `fetch PUT` to the signed URL
3. Progress tracked per file via `XMLHttpRequest` upload events
4. On completion, client calls `saveMediaAsset()` to insert the metadata row

**URL import → server-side proxy**
1. Client calls server action `importFromUrl(url)`
2. Server fetches the remote resource, checks `Content-Length` and MIME type before streaming
3. Server streams file to Supabase Storage using the service-role key
4. Server inserts the `media_assets` row and returns the new asset

Both paths share the same `media_assets` row shape.

### Stack

- Supabase Storage (`media` bucket, public read / server-write)
- Supabase Postgres (`media_assets` table)
- `@supabase/supabase-js` server client (service-role)
- Next.js server actions for all mutations
- Existing `shadcn/ui` primitives — no new component library

## Data model

### Supabase Storage bucket: `media`

- Public read (CDN-served URLs)
- Authenticated write via service-role key only (RLS blocks all direct client writes)
- Folder structure: `images/`, `videos/`, `documents/`

### Postgres table: `media_assets`

| Column | Type | Constraints / Default |
|--------|------|-----------------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `storage_path` | `text` | NOT NULL — path within bucket |
| `public_url` | `text` | NOT NULL — full CDN URL |
| `file_type` | `text` | NOT NULL — `image \| video \| document` |
| `mime_type` | `text` | NOT NULL |
| `size_bytes` | `int8` | NOT NULL |
| `title` | `text` | NOT NULL — editable display name |
| `alt_text` | `text` | NULLABLE — images only |
| `tags` | `text[]` | NOT NULL DEFAULT `'{}'` |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` |

## Route & file structure

```
src/app/(admin)/admin/media/
├── page.tsx              # Server component — initial asset fetch, renders shell
├── MediaLibrary.tsx      # Client component — grid, filters, search, upload tray
├── UploadZone.tsx        # Client — drag-drop overlay + file picker button
├── UrlImportForm.tsx     # Client — URL input + submit
├── AssetCard.tsx         # Single asset card (thumbnail/icon, hover actions)
├── AssetEditModal.tsx    # Dialog — edit title, alt_text, tags
└── actions.ts            # All server actions

src/components/admin/
└── AssetPicker.tsx       # Shared modal — grid view, returns selected asset to caller

src/lib/supabase.ts       # Server-side Supabase client (service-role)
scripts/create-media-bucket.ts  # One-time CLI: creates bucket + RLS policies
```

### Modifications to existing files

| Path | Change |
|------|--------|
| `src/app/(admin)/admin/media/page.tsx` | Replace stub with real media library |
| `src/app/globals.css` | No changes needed |
| `package.json` | Add `@supabase/supabase-js` |
| `.env.example` | Document three new env vars |

## Server actions (`actions.ts`)

| Action | Signature | Purpose |
|--------|-----------|---------|
| `getSignedUploadUrl` | `(filename: string, mimeType: string)` → `{ signedUrl, storagePath, publicUrl }` | Issues one-time upload URL for direct browser upload |
| `saveMediaAsset` | `(data: SaveMediaAssetInput)` → `MediaAsset` | Inserts row after upload completes |
| `importFromUrl` | `(url: string)` → `MediaAsset` | Server fetches + uploads + inserts |
| `updateMediaAsset` | `(id: string, patch: Partial<MediaAssetPatch>)` → `MediaAsset` | Updates title/alt_text/tags, sets updated_at |
| `deleteMediaAsset` | `(id: string)` → `void` | Deletes from Storage then DB |
| `listMediaAssets` | `(filter?: { fileType?: string })` → `MediaAsset[]` | Used for initial server render |

Every action calls `auth()` first and throws `UNAUTHORIZED` if no session.

## UI

### Media library page (`/admin/media`)

```
┌─────────────────────────────────────────────────────────┐
│  Media                              [+ Upload]  [URL ↓] │
├─────────────────────────────────────────────────────────┤
│  [All] [Images] [Videos] [Documents]   🔍 Search...     │
├─────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │ img  │ │ img  │ │  📄  │ │  ▶   │ │ img  │ │ img  ││
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│
│  photo.jpg  hero.png  brief.pdf  reel.mp4  ...          │
├─────────────────────────────────────────────────────────┤
│  [file.jpg ████████░░ 80%]  [doc.pdf ██████████ Done]   │
└─────────────────────────────────────────────────────────┘
```

- **Upload zone**: drag files anywhere on the page; also a `+ Upload` button
- **Upload tray**: persistent tray at the bottom shows per-file progress bars while uploading
- **Filter tabs**: All / Images / Videos / Documents
- **Search**: client-side filter on `title` + `tags`
- **Asset card**: image thumbnail or file-type icon; hover shows Edit + Delete buttons
- **Edit modal**: form with `title`, `alt_text` (images only), `tags` (comma-separated → array)
- **Delete**: confirmation prompt → deletes from Storage + DB

### AssetPicker modal (shared)

Same grid layout as the media library, rendered inside a `<Dialog>`. Clicking an asset calls `onSelect({ id, public_url, title, alt_text })` and closes the modal. Sub-project #4 (Projects) imports `<AssetPicker>` and wires it to image fields.

## Environment variables (new)

| Name | Purpose | Example |
|------|---------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server only) | From Supabase dashboard → API settings |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket name | `media` |

`src/lib/supabase.ts` validates all three at module load and throws a clear error listing missing names. `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser.

## Error handling

| Situation | Behavior |
|-----------|---------|
| Image/PDF >20 MB, video >200 MB | Rejected client-side before upload, size limit shown |
| Unsupported MIME type | Rejected client-side, accepted types listed |
| Supabase Storage upload error | Per-file error state in tray, retry button |
| URL import: unreachable | Server returns error, shown inline in import form |
| URL import: HTML/non-media response | Server detects non-media MIME type, rejects with message |
| URL import: Content-Length too large | Server rejects before streaming |
| Storage delete succeeds, DB delete fails | Row left orphaned, logged server-side; asset reappears in grid (safe failure, no data loss) |
| Missing env var at boot | `src/lib/supabase.ts` throws listing every missing name |
| Unauthenticated action call | Every server action calls `auth()` first, throws `UNAUTHORIZED` |

## File size limits

| Type | Max size |
|------|---------|
| Images (JPEG, PNG, WebP, SVG, GIF) | 20 MB |
| Documents (PDF) | 20 MB |
| Video (MP4, WebM, MOV) | 200 MB |

## Out of scope (explicitly deferred)

- Image optimization / automatic WebP conversion (add in sub-project #5 if needed)
- Video transcoding
- Folder / album organization (flat list is sufficient for now)
- Bulk delete
- Duplicate detection
- Usage tracking ("used in N projects") — deferred to sub-project #4
- Pagination (infinite scroll / load more) — load all assets for now; revisit if library grows large

## Manual test checklist

1. Unauthenticated GET `/admin/media` → redirected to `/admin/login`
2. Authenticated: `/admin/media` loads and shows empty state
3. Drag and drop a JPEG — appears in grid with correct title/thumbnail
4. Multi-select upload (3 files) — all show progress bars, all appear in grid on completion
5. Upload a PDF — shows document icon, not a broken image
6. Upload an MP4 — shows video icon
7. URL import of a public image URL — asset appears in grid
8. URL import of an HTML page URL — error message shown, no asset created
9. Edit asset: change title, add tags — changes persist on reload
10. Edit image asset: alt_text field visible; edit non-image: alt_text field hidden
11. Delete asset — removed from grid and from Supabase Storage bucket
12. File too large (>20 MB image) — rejected before upload with clear message
13. Unsupported file type — rejected client-side
14. Missing `SUPABASE_URL` env var — server throws with clear error
15. `<AssetPicker>` modal renders, selecting an asset calls `onSelect` with correct shape

## Transition

Next step: write a detailed implementation plan (ordered tasks, file-by-file) via the `superpowers:writing-plans` skill.
