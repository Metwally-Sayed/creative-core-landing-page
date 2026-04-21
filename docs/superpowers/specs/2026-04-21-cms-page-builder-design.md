# CMS Sub-project #5: Page Builder + Globals

**Status:** Approved — ready for implementation plan
**Date:** 2026-04-21
**Branch:** `rebuild`
**Sub-project:** 5 of 5 in the CMS buildout

---

## Context

Builds on sub-projects #1–#4 (Auth, Media Center, Simple Collections, Projects). All infrastructure is in place: protected admin routes, Supabase service-role client, `AssetPicker`, `@dnd-kit` reorder, `unstable_cache` + `revalidateTag` ISR pattern, and `ImageField`.

The remaining hardcoded content lives in:
- Static page files (`src/app/[lang]/about/page.tsx`, `services`, `work`, `products`)
- Hardcoded emails and social links in `Footer.tsx`
- i18n message keys for hero copy in `messages/en.json`

This sub-project moves all of that into Supabase and exposes it through a page builder and a settings panel in the admin.

---

## Goal

Give admins full control over every public page's content and composition through a section-based page builder, plus a settings panel for site-wide globals (emails, social links, SEO defaults). No code changes required to update copy, add sections, or reorder content.

---

## Scope Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Page storage | Relational `pages` + `page_sections` tables | Consistent with projects/project_sections pattern; DnD reorder works naturally |
| Section model | Fixed library of 7 types + `rich_text` | Structured output; prevents layout chaos; YAGNI on freeform blocks |
| Rich text | Plain `<textarea>` → stored as sanitised HTML | No WYSIWYG dependency; server-sanitised before render |
| Pages covered | All public pages (home, about, services, work, products + any new) | Full admin control; no hardcoded page content remains |
| Homepage route | `src/app/[lang]/page.tsx` fetches slug `"home"` | Keeps Next.js root route; avoids catch-all conflict |
| Other pages | `src/app/[lang]/[slug]/page.tsx` catch-all | Single dynamic route handles all builder-managed pages |
| Settings | Single-row `site_settings` table with named columns | We know exactly what globals exist; typed columns beat key/value |
| Auth | Every server action calls `auth()` first | Consistent with all sub-projects |
| Revalidation | `revalidateTag("pages")` + `revalidateTag("settings")`, 60s ISR | Same pattern as projects and collections |

---

## Data Model

### Table: `pages`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `slug` | `text` | NOT NULL, UNIQUE (e.g. `home`, `about`, `services`) |
| `title` | `text` | NOT NULL |
| `meta_title` | `text` | NOT NULL DEFAULT `''` |
| `meta_description` | `text` | NOT NULL DEFAULT `''` |
| `og_image_url` | `text` | NOT NULL DEFAULT `''` |
| `published` | `bool` | NOT NULL DEFAULT `false` |
| `sort_order` | `int4` | NOT NULL DEFAULT `0` |
| `translations` | `jsonb` | NOT NULL DEFAULT `'{}'` |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` |

### Table: `page_sections`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `page_id` | `uuid` | NOT NULL, FK → `pages(id)` ON DELETE CASCADE |
| `type` | `text` | NOT NULL — one of the 7 section types |
| `sort_order` | `int4` | NOT NULL DEFAULT `0` |
| `content` | `jsonb` | NOT NULL DEFAULT `'{}'` |
| `translations` | `jsonb` | NOT NULL DEFAULT `'{}'` |

### Table: `site_settings`

Single-row table (enforced by a `CHECK (id = 1)` constraint).

| Column | Type |
|--------|------|
| `id` | `int4` PK DEFAULT `1` |
| `site_name` | `text` NOT NULL DEFAULT `'Hello Monday'` |
| `tagline` | `text` NOT NULL DEFAULT `''` |
| `contact_email` | `text` NOT NULL DEFAULT `'hello@hellomonday.com'` |
| `business_email` | `text` NOT NULL DEFAULT `'newbusiness@hellomonday.com'` |
| `social_twitter` | `text` NOT NULL DEFAULT `''` |
| `social_instagram` | `text` NOT NULL DEFAULT `''` |
| `social_linkedin` | `text` NOT NULL DEFAULT `''` |
| `social_vimeo` | `text` NOT NULL DEFAULT `''` |
| `seo_title` | `text` NOT NULL DEFAULT `''` |
| `seo_description` | `text` NOT NULL DEFAULT `''` |
| `seo_og_image_url` | `text` NOT NULL DEFAULT `''` |

All three tables get RLS enabled with deny-all policies for `anon` and `authenticated` roles (service-role bypasses).

---

## Section Library

Seven fixed section types. Each maps to an existing or thin-wrapper component.

### `hero`
```jsonb
{
  "headline": "We make things",
  "highlight": "move",
  "body": "A creative studio...",
  "cta_label": "See our work",
  "cta_url": "/work",
  "image_url": ""
}
```
Renders: `CreativeHero` (already exists, already used on homepage)

### `text_image`
```jsonb
{
  "eyebrow": "Approach",
  "title": "Design that holds up",
  "body": ["Paragraph one.", "Paragraph two."],
  "image_url": "",
  "image_alt": "",
  "image_layout": "right",
  "tone": "light"
}
```
Renders: new `TextImageSection` wrapper (thin, reuses StoryChapter-style layout)

### `projects_grid`
```jsonb
{
  "eyebrow": "Selected Work",
  "heading": "Projects",
  "filter_tags": []
}
```
Renders: existing `Projects` component (fetches live project data)

### `faq`
```jsonb
{
  "eyebrow": "Questions",
  "heading": "FAQ"
}
```
Renders: existing `FaqQuoteSection` (fetches live FAQ rows)

### `product_feature`
```jsonb
{
  "eyebrow": "Platform",
  "title": "Build better products",
  "body": "Description...",
  "image_url": "",
  "cta_label": "Learn more",
  "cta_url": ""
}
```
Renders: existing `ProductSection`

### `metrics`
```jsonb
{
  "heading": "Impact",
  "items": [
    { "label": "Projects", "value": "200+" },
    { "label": "Awards", "value": "40" }
  ]
}
```
Renders: new `MetricsSection` (simple grid of label/value pairs)

### `rich_text`
```jsonb
{
  "html": "<p>Freeform content here.</p>"
}
```
Renders: new `RichTextSection` — sanitises HTML server-side with a whitelist, renders via `dangerouslySetInnerHTML`. Only basic tags allowed (`p`, `h2`–`h4`, `a`, `strong`, `em`, `ul`, `ol`, `li`, `blockquote`).

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `supabase/migrations/20260421000004_create_pages.sql` | 3 tables + RLS |
| Create | `scripts/seed-pages.ts` | Seed current static page content into DB |
| Create | `src/lib/page-data.ts` | Cached fetchers: `getPage(slug)`, `getPages()`, `getSettings()` + TypeScript types |
| Create | `src/components/builder/SectionRenderer.tsx` | Switch on `section.type` → render component |
| Create | `src/components/builder/sections/TextImageSection.tsx` | Thin wrapper for text+image layout |
| Create | `src/components/builder/sections/MetricsSection.tsx` | Label/value grid |
| Create | `src/components/builder/sections/RichTextSection.tsx` | Sanitised HTML renderer |
| Modify | `src/app/[lang]/page.tsx` | Fetch `getPage("home")` → render via `SectionRenderer` |
| Create | `src/app/[lang]/[slug]/page.tsx` | Catch-all route for all other builder-managed pages |
| Replace | `src/app/[lang]/about/page.tsx` | Remove static file (catch-all handles it) |
| Replace | `src/app/[lang]/services/page.tsx` | Remove static file |
| Replace | `src/app/[lang]/work/page.tsx` | Remove static file |
| Replace | `src/app/[lang]/products/page.tsx` | Remove static file |
| Create | `src/app/(admin)/admin/pages/actions.ts` | Server actions: CRUD pages + sections + reorder + toggle |
| Replace | `src/app/(admin)/admin/pages/page.tsx` | Replace stub with server-rendered list |
| Create | `src/app/(admin)/admin/pages/PagesList.tsx` | DnD list client component |
| Create | `src/app/(admin)/admin/pages/new/page.tsx` | New page form |
| Create | `src/app/(admin)/admin/pages/[id]/page.tsx` | Edit page server component |
| Create | `src/app/(admin)/admin/pages/[id]/PageEditor.tsx` | Full editor: meta + sections |
| Create | `src/app/(admin)/admin/pages/[id]/SectionEditor.tsx` | Per-section inline form by type |
| Create | `src/app/(admin)/admin/settings/actions.ts` | `getSettings()` + `updateSettings()` server actions |
| Replace | `src/app/(admin)/admin/settings/page.tsx` | Replace stub with settings form |
| Modify | `src/components/sections/Footer.tsx` | Read emails + social links from `getSettings()` |
| Modify | `src/app/[lang]/layout.tsx` | Read SEO defaults from `getSettings()` for `<head>` |

---

## Admin UI

### `/admin/pages` — Page List
- Same DnD reorder as Projects list
- Row: drag handle · page title · slug badge · published toggle (Eye/EyeOff) · edit pencil · delete trash
- "+ New Page" button → modal (title + slug) → creates row → redirects to editor

### `/admin/pages/[id]` — Page Editor
- Sticky header: page title input + Save button
- Two tabs: **Meta** and **Sections**
- **Meta tab**: `meta_title`, `meta_description`, `og_image_url` (via `ImageField`), `published` toggle
- **Sections tab**:
  - DnD-reorderable list; each row shows type badge + first-field preview (collapsed)
  - Clicking a row expands an inline form with that type's fields
  - `ImageField` for all image fields (AssetPicker + URL fallback)
  - Rich text block: plain `<textarea>`
  - "Add section" button → dropdown of 7 types → appends to list

### `/admin/settings` — Global Settings
- Single form, all fields visible
- Groups: Site Identity · Contact · Social · SEO
- One Save button → `updateSettings()` server action → `revalidateTag("settings")`

---

## Public Rendering

### Catch-all route (`src/app/[lang]/[slug]/page.tsx`)
- `export const dynamicParams = true`
- `export const revalidate = 60`
- `generateStaticParams()` fetches all published page slugs (excluding `home`)
- `generateMetadata()` uses page `meta_title`, `meta_description`, `og_image_url`
- Renders `<SectionRenderer sections={page.sections} />`
- Returns `notFound()` if page is unpublished or slug not found

### Homepage (`src/app/[lang]/page.tsx`)
- Fetches `getPage("home")` instead of composing static sections
- Falls back gracefully if "home" page doesn't exist in DB

### `SectionRenderer`
```tsx
switch (section.type) {
  case "hero":           return <CreativeHero {...section.content} />
  case "text_image":     return <TextImageSection {...section.content} />
  case "projects_grid":  return <Projects projects={projects} {...section.content} />
  case "faq":            return <FaqQuoteSection faqItems={faqItems} {...section.content} />
  case "product_feature":return <ProductSection {...section.content} />
  case "metrics":        return <MetricsSection {...section.content} />
  case "rich_text":      return <RichTextSection html={section.content.html} />
}
```

Note: `projects_grid` and `faq` sections require their live data — `SectionRenderer` receives pre-fetched `projects` and `faqItems` from the parent server component when any such section is present on the page.

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| Page not found / unpublished | `notFound()` → 404 |
| `getPage` DB error | Error boundary; fall back to static 500 page |
| Settings row missing | `getSettings()` returns hardcoded defaults (emails, empty socials) |
| Section type unknown | `SectionRenderer` returns `null` (silently skips) |
| Rich text HTML sanitisation strips all | Renders empty `<div>` |

---

## Out of Scope (explicitly deferred)

- WYSIWYG / rich text editor (plain textarea is sufficient)
- Page revision history
- Scheduled publish/unpublish
- Per-page custom CSS
- Team, Code-of-Honor, Awards collections (separate future sub-project)
- Multi-language page builder UI (AR translations stored in `translations jsonb` but no editor UI for them yet)
