# CMS Sub-project #4: Projects (Rich Collection)

**Status:** Approved — ready for implementation plan
**Date:** 2026-04-21
**Branch:** `rebuild`
**Sub-project:** 4 of 5 in the CMS buildout

## Context

Builds on sub-projects #1–#3 (Auth, Media Center, Simple Collections). The admin area has JWT-protected routes, a media library with `AssetPicker`, and working Locations/FAQ collections. This sub-project moves the 23-project static catalog into Supabase Postgres with full rich-content editing in the admin.

Sub-projects remaining after this:
5. Page builder + globals

Collections deferred to a later sub-project: Team, Code-of-Honor, Awards.

## Goal

Replace the static `project-catalog.ts` file with Supabase-backed tables. Admins can create, edit, delete, reorder, and publish/unpublish projects through a dedicated admin edit page. All repeating content blocks (story sections, gallery images, metrics, credits, overview facts) are managed via drag-to-reorder lists using the same `@dnd-kit` pattern already in place. The public frontend reads from the database with 60-second revalidation.

## Scope decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Content depth | Full rich content — all fields | All text, image, and array fields editable |
| Repeating blocks | Separate child tables with `sort_order` | Consistent with sub-project #3 DnD pattern |
| Images | `AssetPicker` (media library) + URL fallback | Reuses sub-project #2 component; URL fallback for external assets |
| Draft/published | `published bool DEFAULT false` on projects table | Unpublished projects hidden from public site |
| Related projects | Junction table with multi-select admin UI | Explicit admin selection, up to 3 related |
| URL structure | `slug` column (unique) used in public routes | SEO-friendly; replaces numeric IDs |
| Frontend revalidation | `unstable_cache` + `revalidateTag("projects")` | Same pattern as sub-project #3 |
| Seeding | `scripts/seed-projects.ts` migrates static catalog | One-time, idempotent |
| Auth | Every server action calls `auth()` first | Consistent with all prior sub-projects |

## Data model

### Table: `projects`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `slug` | `text` | NOT NULL, UNIQUE |
| `title` | `text` | NOT NULL |
| `tags` | `text[]` | NOT NULL DEFAULT `'{}'` |
| `aspect_ratio` | `text` | NOT NULL DEFAULT `'landscape'` — portrait/landscape/square |
| `cover_image_url` | `text` | NOT NULL DEFAULT `''` |
| `published` | `bool` | NOT NULL DEFAULT `false` |
| `sort_order` | `int4` | NOT NULL DEFAULT `0` |
| `hero_label` | `text` | NOT NULL DEFAULT `''` |
| `hero_title` | `text` | NOT NULL DEFAULT `''` |
| `hero_subtitle` | `text` | NOT NULL DEFAULT `''` |
| `hero_summary` | `text` | NOT NULL DEFAULT `''` |
| `hero_image_url` | `text` | NOT NULL DEFAULT `''` |
| `client` | `text` | NOT NULL DEFAULT `''` |
| `project_type` | `text` | NOT NULL DEFAULT `''` |
| `deliverables` | `text` | NOT NULL DEFAULT `''` |
| `launch_label` | `text` | NOT NULL DEFAULT `''` |
| `launch_url` | `text` | NOT NULL DEFAULT `''` |
| `intro` | `text[]` | NOT NULL DEFAULT `'{}'` — array of paragraphs |
| `showcase_image_url` | `text` | NOT NULL DEFAULT `''` |
| `showcase_alt` | `text` | NOT NULL DEFAULT `''` |
| `showcase_label` | `text` | NOT NULL DEFAULT `''` |
| `feature_eyebrow` | `text` | NOT NULL DEFAULT `''` |
| `feature_title` | `text` | NOT NULL DEFAULT `''` |
| `feature_body` | `text` | NOT NULL DEFAULT `''` |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` |

### Table: `project_sections`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `project_id` | `uuid` | NOT NULL, FK → `projects(id)` ON DELETE CASCADE |
| `eyebrow` | `text` | NOT NULL DEFAULT `''` |
| `title` | `text` | NOT NULL DEFAULT `''` |
| `body` | `text[]` | NOT NULL DEFAULT `'{}'` — array of paragraphs |
| `image_url` | `text` | NOT NULL DEFAULT `''` |
| `image_alt` | `text` | NOT NULL DEFAULT `''` |
| `image_layout` | `text` | NOT NULL DEFAULT `'right'` — left/right |
| `tone` | `text` | NOT NULL DEFAULT `'light'` — light/navy |
| `sort_order` | `int4` | NOT NULL DEFAULT `0` |

### Table: `project_gallery`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `project_id` | `uuid` | NOT NULL, FK → `projects(id)` ON DELETE CASCADE |
| `image_url` | `text` | NOT NULL DEFAULT `''` |
| `image_alt` | `text` | NOT NULL DEFAULT `''` |
| `image_label` | `text` | NOT NULL DEFAULT `''` |
| `sort_order` | `int4` | NOT NULL DEFAULT `0` |

### Table: `project_metrics`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `project_id` | `uuid` | NOT NULL, FK → `projects(id)` ON DELETE CASCADE |
| `label` | `text` | NOT NULL DEFAULT `''` |
| `value` | `text` | NOT NULL DEFAULT `''` |
| `sort_order` | `int4` | NOT NULL DEFAULT `0` |

### Table: `project_credits`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `project_id` | `uuid` | NOT NULL, FK → `projects(id)` ON DELETE CASCADE |
| `label` | `text` | NOT NULL DEFAULT `''` |
| `value` | `text` | NOT NULL DEFAULT `''` |
| `sort_order` | `int4` | NOT NULL DEFAULT `0` |

### Table: `project_overview`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `project_id` | `uuid` | NOT NULL, FK → `projects(id)` ON DELETE CASCADE |
| `label` | `text` | NOT NULL DEFAULT `''` |
| `value` | `text` | NOT NULL DEFAULT `''` |
| `sort_order` | `int4` | NOT NULL DEFAULT `0` |

### Table: `project_related`

| Column | Type | Constraints |
|--------|------|-------------|
| `project_id` | `uuid` | NOT NULL, FK → `projects(id)` ON DELETE CASCADE |
| `related_project_id` | `uuid` | NOT NULL, FK → `projects(id)` ON DELETE CASCADE |
| `sort_order` | `int4` | NOT NULL DEFAULT `0` |
| — | — | PRIMARY KEY (`project_id`, `related_project_id`) |

All tables have RLS enabled with deny policies for anon and authenticated roles. The service-role key bypasses RLS.

## Route & file structure

```
src/app/(admin)/admin/projects/
├── page.tsx                    # Server component — list page
├── ProjectsList.tsx            # Client — DnD list, published toggle, delete
├── actions.ts                  # All server actions
├── new/
│   └── page.tsx                # Redirects to /admin/projects/new-form or renders empty editor
└── [id]/
    ├── page.tsx                # Server component — fetches full project, renders editor
    └── ProjectEditor.tsx       # Client — full multi-section edit form

supabase/migrations/
└── 20260421000002_create_projects.sql

scripts/
└── seed-projects.ts            # One-time: seeds 23 projects from static catalog

src/lib/
└── project-data.ts             # Public cached fetch functions + ProjectDb types
```

### Modified existing files

| Path | Change |
|------|--------|
| `src/components/sections/Projects.tsx` | Accept `projects: ProjectSummaryDb[]` prop; remove static import |
| `src/app/[lang]/page.tsx` | Await `getProjects()`, pass to `<Projects>` |
| `src/app/[lang]/projects/[id]/page.tsx` | Read from DB via `getProject(slug)`; update `generateStaticParams` |
| `src/components/projects/ProjectDetailView.tsx` | Accept DB types instead of static catalog types; map DB fields to existing render props |

## Server actions (`src/app/(admin)/admin/projects/actions.ts`)

| Action | Signature | Purpose |
|--------|-----------|---------|
| `listProjects` | `()` → `ProjectSummaryDb[]` | All projects ordered by `sort_order`, summary fields only |
| `getProject` | `(id: string)` → `ProjectFullDb` | Full project with all child records fetched in parallel |
| `createProject` | `(input: ProjectInput)` → `ProjectSummaryDb` | Inserts projects row; `sort_order = max + 1` |
| `updateProject` | `(id, input: ProjectFullInput)` → `void` | Updates main row + upserts/deletes all child records |
| `deleteProject` | `(id: string)` → `void` | Deletes row; CASCADE handles children |
| `reorderProjects` | `(orderedIds: string[])` → `void` | Bulk `sort_order` update |
| `togglePublished` | `(id: string, published: boolean)` → `void` | Single-field update for inline toggle |
| `setRelatedProjects` | `(projectId: string, relatedIds: string[])` → `void` | Replaces `project_related` rows for this project |

All actions call `auth()` first. All mutations call `revalidateTag("projects", "max")`.

## Types

```ts
// Summary — used for grid and list page
export interface ProjectSummaryDb {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  aspect_ratio: "portrait" | "landscape" | "square";
  cover_image_url: string;
  published: boolean;
  sort_order: number;
}

// Child record types
export interface ProjectSection {
  id: string;
  project_id: string;
  eyebrow: string;
  title: string;
  body: string[];
  image_url: string;
  image_alt: string;
  image_layout: "left" | "right";
  tone: "light" | "navy";
  sort_order: number;
}

export interface ProjectGalleryImage {
  id: string;
  project_id: string;
  image_url: string;
  image_alt: string;
  image_label: string;
  sort_order: number;
}

export interface ProjectFact {
  id: string;
  project_id: string;
  label: string;
  value: string;
  sort_order: number;
}

// Full project — used for edit page and detail page
export interface ProjectFullDb extends ProjectSummaryDb {
  hero_label: string;
  hero_title: string;
  hero_subtitle: string;
  hero_summary: string;
  hero_image_url: string;
  client: string;
  project_type: string;
  deliverables: string;
  launch_label: string;
  launch_url: string;
  intro: string[];
  showcase_image_url: string;
  showcase_alt: string;
  showcase_label: string;
  feature_eyebrow: string;
  feature_title: string;
  feature_body: string;
  sections: ProjectSection[];
  gallery: ProjectGalleryImage[];
  metrics: ProjectFact[];
  credits: ProjectFact[];
  overview: ProjectFact[];
  related_ids: string[];
  created_at: string;
  updated_at: string;
}
```

## Admin UI

### List page (`/admin/projects`)

```
┌──────────────────────────────────────────────┐
│  Projects                          [+ New]   │
├──────────────────────────────────────────────┤
│  ⠿  [img] Google Gemini API  Design  ● Live  ✏  🗑 │
│  ⠿  [img] Spotify Wrapped   Exp     ○ Draft ✏  🗑 │
│  ⠿  [img] Nike Campaign     Strategy ● Live  ✏  🗑 │
└──────────────────────────────────────────────┘
```

- Drag handle for reorder (calls `reorderProjects`)
- Thumbnail from `cover_image_url`
- Title + first tag
- Published toggle (●/○) — calls `togglePublished` inline, no confirm needed
- Edit → navigates to `/admin/projects/[id]`
- Delete → AlertDialog confirm → `deleteProject`

### Edit page (`/admin/projects/[id]`)

Dedicated full-page form. Sticky header with project title, Back button, and Save button. Save calls `updateProject` once with all data. Vertically-scrollable sections:

1. **Basic Info** — title, slug (auto-derived from title, editable), tags (comma-separated input), aspect ratio (select), cover image (AssetPicker + URL fallback), published toggle
2. **Hero** — hero_label, hero_title, hero_subtitle, hero_summary, hero_image (AssetPicker + URL)
3. **Overview Bar** — client, project_type, deliverables, launch_label, launch_url
4. **Intro Paragraphs** — textarea (one paragraph per line, split on save)
5. **Overview Facts** — DnD list of label/value rows (same pattern as metrics/credits)
6. **Primary Showcase** — image (AssetPicker + URL), alt, label
7. **Feature Block** — eyebrow, title, body
8. **Story Sections** — DnD list; each row shows eyebrow + title; edit opens Dialog modal with all section fields
9. **Gallery** — DnD list of images (AssetPicker + URL per image, alt, label)
10. **Impact Metrics** — DnD list of label/value rows
11. **Credits** — DnD list of label/value rows
12. **Related Projects** — multi-select checkboxes from published projects list

### Image field pattern (AssetPicker + URL fallback)

Each image field renders:
```
[ Pick from media library ]  or  [ https://... URL input ]
```
Toggled by a small "Use URL instead" / "Use media library" link below the picker.

## Public data layer (`src/lib/project-data.ts`)

```ts
export const getProjects = unstable_cache(
  async (): Promise<ProjectSummaryDb[]> => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, slug, title, tags, aspect_ratio, cover_image_url, published, sort_order")
      .eq("published", true)
      .order("sort_order");
    if (error) throw error;
    return data as ProjectSummaryDb[];
  },
  ["projects"],
  { revalidate: 60, tags: ["projects"] }
);

export const getProject = unstable_cache(
  async (slug: string): Promise<ProjectFullDb | null> => {
    // Fetch main row + all child tables in parallel
    // Returns null if not found or not published
  },
  ["projects"],
  { revalidate: 60, tags: ["projects"] }
);
```

## Public frontend integration

- `Projects.tsx` accepts `projects: ProjectSummaryDb[]` prop. `cover_image_url` maps to current `image` field. `aspect_ratio` maps to current `aspectRatio`. Removes `studioLocations`-style static import.
- `[lang]/page.tsx` awaits `getProjects()` and passes to `<Projects projects={projects} />`. Adds `export const revalidate = 60`.
- `[lang]/projects/[id]/page.tsx` calls `getProject(params.id)` (slug used as the route param). `generateStaticParams` reads published slugs from Supabase at build time. `ProjectDetailView` receives `ProjectFullDb` fields mapped to its existing render props.
- `ProjectDetailView.tsx` updated to accept `ProjectFullDb` — field names change (e.g. `hero_title` instead of `heroTitle`) but the render logic stays identical.

## Seeding

`scripts/seed-projects.ts` reads from `src/lib/project-catalog.ts` and inserts rows into all 7 tables. For projects that only have summary data (IDs 2–23), the detail fields are populated using the same `buildDefaultDetail()` logic, then stored in the DB. Idempotent — skips if `projects` table is non-empty.

## Error handling

| Situation | Behavior |
|-----------|---------|
| Required field empty (title) | Client-side validation; Save button disabled |
| Slug collision | Server returns error; shown inline in Basic Info section |
| Supabase error on save | Error banner at top of edit page |
| Delete fails | Toast error; project remains in list |
| Reorder fails | Reverts on next render |
| Project not found (public) | `notFound()` — 404 page |
| Unpublished project accessed directly | `notFound()` on public route |

## Out of scope (explicitly deferred)

- Color palette showcase (hardcoded in ProjectDetailView)
- Testimonial carousel content (hardcoded in ProjectDetailView)
- Process timeline steps (hardcoded in ProjectDetailView)
- Image upload directly on project edit page (use media library separately)
- Bulk publish/unpublish
- Project duplication
- Revision history
