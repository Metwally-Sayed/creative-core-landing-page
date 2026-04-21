# CMS Sub-project #3: Simple Collections (Locations & FAQ)

**Status:** Approved — ready for implementation plan
**Date:** 2026-04-21
**Branch:** `rebuild`
**Sub-project:** 3 of 5 in the CMS buildout

## Context

Builds on sub-project #2 (Media Center). The admin area has JWT-protected routes, a navigable shell, and a working media library. This sub-project adds editable Locations and FAQ collections backed by Postgres, with drag-to-reorder and full CRUD in the admin.

Sub-projects remaining after this:
4. Rich collection: Projects
5. Page builder + globals

Collections explicitly deferred to a later sub-project: Team, Code-of-Honor, Awards.

## Goal

Move Locations and FAQ from static TypeScript files to Supabase Postgres tables. Admins can create, edit, delete, and reorder items through dedicated admin pages. The public-facing frontend reads from the database with a 60-second revalidation window.

## Scope decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Collections in scope | Locations, FAQ | Team / CoH / Awards deferred |
| Storage | Supabase Postgres (existing connection) | Already set up in sub-project #2 |
| Drag-and-drop library | `@dnd-kit/core` + `@dnd-kit/sortable` | react-beautiful-dnd is deprecated |
| Reorder strategy | `sort_order` int4 column; bulk update on drop | Simple and reliable |
| Frontend revalidation | `export const revalidate = 60` + `revalidatePath` after mutations | Cache is warm for visitors; flushes immediately after admin saves |
| Seeding | One-time `scripts/seed-collections.ts` migrates static data to DB | Static files stay until frontend is updated |
| Auth | Every server action calls `auth()` first | Consistent with sub-project #2 |

## Data model

### Table: `locations`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `name` | `text` | NOT NULL — e.g. "New York" |
| `country` | `text` | NOT NULL — e.g. "United States" |
| `address` | `text` | NULLABLE |
| `sort_order` | `int4` | NOT NULL DEFAULT 0 |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` |

### Table: `faq_items`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `question` | `text` | NOT NULL |
| `answer` | `text` | NOT NULL |
| `sort_order` | `int4` | NOT NULL DEFAULT 0 |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` |

Both tables have RLS enabled with deny policies for anon and authenticated roles. The service-role key (used server-side only) bypasses RLS.

## Route & file structure

```
src/app/(admin)/admin/
├── locations/
│   ├── page.tsx           # Server component — fetches initial list, renders LocationsList
│   ├── LocationsList.tsx  # Client — drag-reorder, add/edit modal, delete confirm
│   └── actions.ts         # list, create, update, delete, reorder server actions
└── faq/
    ├── page.tsx           # Server component — fetches initial list, renders FaqList
    ├── FaqList.tsx        # Client — drag-reorder, add/edit modal, delete confirm
    └── actions.ts         # list, create, update, delete, reorder server actions

supabase/migrations/
└── 20260421000001_create_collections.sql   # creates both tables in one migration

scripts/
└── seed-collections.ts    # one-time: seeds static data into DB

src/lib/
├── locations-data.ts      # server fetch fn for public frontend (replaces static file)
└── faq-data.ts            # server fetch fn for public frontend (replaces static file)
```

### Modifications to existing files

| Path | Change |
|------|--------|
| `src/components/admin/admin-nav-items.ts` | Add Locations and FAQ nav entries (between Media and Projects) |
| Frontend component(s) using static locations data | Replace static import with `getLocations()` from `src/lib/locations-data.ts`; add `export const revalidate = 60` |
| Frontend component(s) using static FAQ data | Replace static import with `getFaqItems()` from `src/lib/faq-data.ts`; add `export const revalidate = 60` |

## Server actions

### `src/app/(admin)/admin/locations/actions.ts`

| Action | Signature | Purpose |
|--------|-----------|---------|
| `listLocations` | `()` → `Location[]` | Ordered by `sort_order` ASC |
| `createLocation` | `(data: LocationInput)` → `Location` | Inserts row; `sort_order` = max + 1 |
| `updateLocation` | `(id: string, patch: Partial<LocationInput>)` → `Location` | Updates fields + `updated_at` |
| `deleteLocation` | `(id: string)` → `void` | Deletes row |
| `reorderLocations` | `(orderedIds: string[])` → `void` | Bulk-updates `sort_order` to match array index |

### `src/app/(admin)/admin/faq/actions.ts`

| Action | Signature | Purpose |
|--------|-----------|---------|
| `listFaqItems` | `()` → `FaqItem[]` | Ordered by `sort_order` ASC |
| `createFaqItem` | `(data: FaqItemInput)` → `FaqItem` | Inserts row; `sort_order` = max + 1 |
| `updateFaqItem` | `(id: string, patch: Partial<FaqItemInput>)` → `FaqItem` | Updates fields + `updated_at` |
| `deleteFaqItem` | `(id: string)` → `void` | Deletes row |
| `reorderFaqItems` | `(orderedIds: string[])` → `void` | Bulk-updates `sort_order` to match array index |

Every action calls `auth()` first and throws `UNAUTHORIZED` if no session. Every mutation calls `revalidateTag("locations")` (or `"faq"`) after success so the public `unstable_cache` clears immediately.

## UI

### Admin list page pattern (same for both collections)

```
┌─────────────────────────────────────────┐
│  Locations                    [+ Add]   │
├─────────────────────────────────────────┤
│  ⠿  New York · United States    ✏  🗑   │
│  ⠿  Copenhagen · Denmark        ✏  🗑   │
│  ⠿  Aarhus · Denmark            ✏  🗑   │
│  ⠿  Amsterdam · Netherlands     ✏  🗑   │
└─────────────────────────────────────────┘
```

- **Drag handle** (⠿): `@dnd-kit/sortable` — drag row to reorder; on drop calls `reorderLocations` / `reorderFaqItems`
- **Optimistic reorder**: local state updates immediately; server action persists in background
- **Edit button** (✏): opens a `<Dialog>` modal with the item's current values pre-filled
- **Delete button** (🗑): shows `<AlertDialog>` confirm; on confirm calls delete action and removes from local state
- **Add button**: opens the same modal with empty fields
- **Empty state**: "No items yet. Click + Add to create the first one."

### Add/Edit modal fields

**Locations:**
- Name (required text input)
- Country (required text input)
- Address (optional text input)

**FAQ:**
- Question (required text input)
- Answer (required textarea)

### Shared modal behaviour
- Save button disabled while submitting (`useTransition`)
- Required field validation client-side before calling server action
- Server error displayed inline in modal
- On success: modal closes, list updates optimistically

## Types

```ts
// src/app/(admin)/admin/locations/actions.ts
export interface Location {
  id: string;
  name: string;
  country: string;
  address: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
export interface LocationInput {
  name: string;
  country: string;
  address?: string | null;
}

// src/app/(admin)/admin/faq/actions.ts
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
export interface FaqItemInput {
  question: string;
  answer: string;
}
```

## Frontend integration

`src/lib/locations-data.ts`:
```ts
import { supabase } from "@/lib/supabase";
import { unstable_cache } from "next/cache";

export const getLocations = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data;
  },
  ["locations"],
  { revalidate: 60, tags: ["locations"] }
);
```

Same pattern for `src/lib/faq-data.ts` with tag `"faq"`.

Mutations call `revalidateTag("locations")` / `revalidateTag("faq")` after success so the public cache clears immediately.

The existing frontend components that currently import from the static files (`studio-locations.ts`, inline FAQ array) are updated to `await getLocations()` / `await getFaqItems()` instead. Their parent page/layout files get `export const revalidate = 60` as a safety fallback.

## Error handling

| Situation | Behavior |
|-----------|---------|
| Required field empty | Rejected client-side in modal; button stays disabled |
| Supabase error on create/update | Error message shown inline in modal |
| Delete fails | Toast error (via `sonner`); item remains in list |
| Reorder fails | Reverts to last known server order on next render (no optimistic rollback needed — user can drag again) |
| Missing env var | `src/lib/supabase.ts` throws at module load with clear message |
| Unauthenticated action | Every action calls `auth()` first; throws `UNAUTHORIZED` |

## Seeding

`scripts/seed-collections.ts` reads from the existing static files and inserts rows into the DB. Run once after migration:

```bash
npx tsx scripts/seed-collections.ts
```

The script is idempotent — it skips rows if the table is already non-empty.

## Navigation

Add to `src/components/admin/admin-nav-items.ts` (between Media and Projects):

```ts
{ label: "Locations", href: "/admin/locations", icon: MapPin },
{ label: "FAQ", href: "/admin/faq", icon: HelpCircle },
```

## Out of scope (explicitly deferred)

- Team members, Code-of-Honor, Awards (separate sub-project)
- Pagination (both collections are small; load all rows)
- Rich text / markdown in FAQ answers (plain text for now)
- Image fields on Locations or FAQ
- Bulk delete

## Manual test checklist

1. Unauthenticated GET `/admin/locations` → redirected to `/admin/login`
2. Authenticated: `/admin/locations` loads with seeded data
3. Add a location → appears at bottom of list
4. Edit a location → changes reflected immediately
5. Delete a location → removed from list; confirm dialog shown first
6. Drag to reorder → new order persists on page reload
7. Same tests 2–6 for `/admin/faq`
8. Public page using locations data updates within 60 seconds of admin save (or immediately if `revalidateTag` wired correctly)
9. Save with empty required field → blocked client-side
10. `SUPABASE_URL` missing → server throws clear error at boot
