# CMS Sub-project #5: Page Builder + Globals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give admins full control over every public page's content through a section-based page builder, plus a settings panel for site-wide globals (emails, social links, SEO defaults).

**Architecture:** Relational `pages` + `page_sections` tables mirror the projects/project_sections pattern. A fixed library of 7 section types is rendered by a `SectionRenderer` switch. A single-row `site_settings` table stores globals fetched by layout/footer server components.

**Tech Stack:** Next.js 16 App Router, Supabase (service-role), `unstable_cache` + `revalidateTag`, `@dnd-kit/core` + `@dnd-kit/sortable`, `isomorphic-dompurify` (HTML sanitization), server actions with `auth()` guard.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `supabase/migrations/20260421000004_create_pages.sql` | 3 tables + RLS |
| Create | `src/lib/page-data.ts` | Types + cached fetchers: `getPage`, `getPages`, `getSettings` |
| Create | `src/app/(admin)/admin/settings/actions.ts` | `getSettings` + `updateSettings` server actions |
| Modify | `src/app/(admin)/admin/settings/page.tsx` | Replace stub with settings form |
| Create | `src/app/(admin)/admin/settings/SettingsForm.tsx` | Client component for settings form |
| Modify | `src/components/sections/Footer.tsx` | Accept `settings` prop, read emails + socials from it |
| Modify | `src/app/[lang]/layout.tsx` | Fetch settings in parallel, pass to Footer |
| Create | `src/app/(admin)/admin/pages/actions.ts` | Server actions: CRUD pages + sections + reorder + toggle |
| Modify | `src/app/(admin)/admin/pages/page.tsx` | Replace stub with server-rendered list |
| Create | `src/app/(admin)/admin/pages/PagesList.tsx` | DnD list client component |
| Create | `src/app/(admin)/admin/pages/new/page.tsx` | New page form |
| Create | `src/app/(admin)/admin/pages/[id]/page.tsx` | Edit page server component |
| Create | `src/app/(admin)/admin/pages/[id]/PageEditor.tsx` | Full editor: meta + sections |
| Create | `src/app/(admin)/admin/pages/[id]/SectionEditor.tsx` | Per-section inline form by type |
| Create | `src/components/builder/SectionRenderer.tsx` | Switch on `section.type` → render component |
| Create | `src/components/builder/sections/TextImageSection.tsx` | Text + image layout wrapper |
| Create | `src/components/builder/sections/MetricsSection.tsx` | Label/value grid |
| Create | `src/components/builder/sections/RichTextSection.tsx` | Sanitised HTML renderer |
| Modify | `src/app/[lang]/page.tsx` | Fetch `getPage("home")` → render via SectionRenderer |
| Create | `src/app/[lang]/[slug]/page.tsx` | Catch-all for builder-managed pages |
| Delete | `src/app/[lang]/about/page.tsx` | Replaced by catch-all |
| Delete | `src/app/[lang]/services/page.tsx` | Replaced by catch-all |
| Delete | `src/app/[lang]/work/page.tsx` | Replaced by catch-all |
| Delete | `src/app/[lang]/products/page.tsx` | Replaced by catch-all |
| Create | `scripts/seed-pages.ts` | Seed home + current static pages into DB |

---

## Task 1: SQL Migration — 3 Tables + RLS

**Files:**
- Create: `supabase/migrations/20260421000004_create_pages.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/20260421000004_create_pages.sql

-- ── pages ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text        NOT NULL UNIQUE,
  title            text        NOT NULL,
  meta_title       text        NOT NULL DEFAULT '',
  meta_description text        NOT NULL DEFAULT '',
  og_image_url     text        NOT NULL DEFAULT '',
  published        boolean     NOT NULL DEFAULT false,
  sort_order       int4        NOT NULL DEFAULT 0,
  translations     jsonb       NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny anon" ON pages FOR ALL TO anon USING (false);
CREATE POLICY "deny authenticated" ON pages FOR ALL TO authenticated USING (false);

-- ── page_sections ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_sections (
  id           uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id      uuid  NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type         text  NOT NULL,
  sort_order   int4  NOT NULL DEFAULT 0,
  content      jsonb NOT NULL DEFAULT '{}',
  translations jsonb NOT NULL DEFAULT '{}'
);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny anon" ON page_sections FOR ALL TO anon USING (false);
CREATE POLICY "deny authenticated" ON page_sections FOR ALL TO authenticated USING (false);

-- ── site_settings ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id               int4 PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name        text NOT NULL DEFAULT 'Hello Monday',
  tagline          text NOT NULL DEFAULT '',
  contact_email    text NOT NULL DEFAULT 'hello@hellomonday.com',
  business_email   text NOT NULL DEFAULT 'newbusiness@hellomonday.com',
  social_twitter   text NOT NULL DEFAULT '',
  social_instagram text NOT NULL DEFAULT '',
  social_linkedin  text NOT NULL DEFAULT '',
  social_vimeo     text NOT NULL DEFAULT '',
  seo_title        text NOT NULL DEFAULT '',
  seo_description  text NOT NULL DEFAULT '',
  seo_og_image_url text NOT NULL DEFAULT ''
);

-- Seed the single row
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny anon" ON site_settings FOR ALL TO anon USING (false);
CREATE POLICY "deny authenticated" ON site_settings FOR ALL TO authenticated USING (false);
```

- [ ] **Step 2: Apply the migration**

```bash
cd /Users/metwally/Desktop/Kimi_Agent_Clone\ Hello\ Monday\ Site\ 2/nextjs-app
npx supabase db push
```

Expected: migration applies without error. Verify in Supabase dashboard that `pages`, `page_sections`, `site_settings` tables exist.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260421000004_create_pages.sql
git commit -m "feat: add pages, page_sections, and site_settings migrations"
```

---

## Task 2: `src/lib/page-data.ts` — Types + Cached Fetchers

**Files:**
- Create: `src/lib/page-data.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/lib/page-data.ts
import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SectionType =
  | "hero"
  | "text_image"
  | "projects_grid"
  | "faq"
  | "product_feature"
  | "metrics"
  | "rich_text";

export interface PageSectionDb {
  id: string;
  page_id: string;
  type: SectionType;
  sort_order: number;
  content: Record<string, unknown>;
  translations: Record<string, unknown>;
}

export interface PageDb {
  id: string;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
  published: boolean;
  sort_order: number;
  translations: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PageFullDb extends PageDb {
  sections: PageSectionDb[];
}

export interface PageSummaryDb {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  sort_order: number;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  tagline: string;
  contact_email: string;
  business_email: string;
  social_twitter: string;
  social_instagram: string;
  social_linkedin: string;
  social_vimeo: string;
  seo_title: string;
  seo_description: string;
  seo_og_image_url: string;
}

export interface PageInput {
  title: string;
  slug: string;
}

export interface PageSectionInput {
  type: SectionType;
  content: Record<string, unknown>;
}

export interface PageFullInput {
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
  published: boolean;
  sections: PageSectionInput[];
}

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  site_name: "Hello Monday",
  tagline: "",
  contact_email: "hello@hellomonday.com",
  business_email: "newbusiness@hellomonday.com",
  social_twitter: "",
  social_instagram: "",
  social_linkedin: "",
  social_vimeo: "",
  seo_title: "",
  seo_description: "",
  seo_og_image_url: "",
};

// ─── Cached fetchers ──────────────────────────────────────────────────────────

export const getPages = unstable_cache(
  async (): Promise<PageSummaryDb[]> => {
    const { data, error } = await supabase
      .from("pages")
      .select("id, slug, title, published, sort_order")
      .order("sort_order");
    if (error) throw error;
    return data as PageSummaryDb[];
  },
  ["pages"],
  { revalidate: 60, tags: ["pages"] }
);

export const getPage = unstable_cache(
  async (slug: string): Promise<PageFullDb | null> => {
    const { data: row, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error || !row) return null;

    const { data: sections } = await supabase
      .from("page_sections")
      .select("*")
      .eq("page_id", row.id)
      .order("sort_order");

    return { ...row, sections: sections ?? [] } as PageFullDb;
  },
  ["pages"],
  { revalidate: 60, tags: ["pages"] }
);

export const getSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error || !data) return DEFAULT_SETTINGS;
    return data as SiteSettings;
  },
  ["settings"],
  { revalidate: 60, tags: ["settings"] }
);
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors from `page-data.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/page-data.ts
git commit -m "feat: add page-data types and cached fetchers for pages, sections, settings"
```

---

## Task 3: Settings Admin — Actions + Page + Form

**Files:**
- Create: `src/app/(admin)/admin/settings/actions.ts`
- Modify: `src/app/(admin)/admin/settings/page.tsx`
- Create: `src/app/(admin)/admin/settings/SettingsForm.tsx`

- [ ] **Step 1: Create settings actions**

```typescript
// src/app/(admin)/admin/settings/actions.ts
"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
import type { SiteSettings } from "@/lib/page-data";
import { DEFAULT_SETTINGS } from "@/lib/page-data";

export async function getSettingsAdmin(): Promise<SiteSettings> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error || !data) return DEFAULT_SETTINGS;
  return data as SiteSettings;
}

export async function updateSettings(
  input: Omit<SiteSettings, "id">
): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase
    .from("site_settings")
    .update(input)
    .eq("id", 1);
  if (error) throw error;

  revalidateTag("settings");
}
```

- [ ] **Step 2: Create SettingsForm client component**

```typescript
// src/app/(admin)/admin/settings/SettingsForm.tsx
"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "./actions";
import type { SiteSettings } from "@/lib/page-data";

interface Props {
  initialSettings: SiteSettings;
}

export default function SettingsForm({ initialSettings }: Props) {
  const [form, setForm] = useState<Omit<SiteSettings, "id">>({
    site_name: initialSettings.site_name,
    tagline: initialSettings.tagline,
    contact_email: initialSettings.contact_email,
    business_email: initialSettings.business_email,
    social_twitter: initialSettings.social_twitter,
    social_instagram: initialSettings.social_instagram,
    social_linkedin: initialSettings.social_linkedin,
    social_vimeo: initialSettings.social_vimeo,
    seo_title: initialSettings.seo_title,
    seo_description: initialSettings.seo_description,
    seo_og_image_url: initialSettings.seo_og_image_url,
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const field = (
    key: keyof typeof form,
    label: string,
    type: "text" | "textarea" = "text"
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))] uppercase tracking-wide">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          rows={3}
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))] resize-none"
        />
      ) : (
        <input
          type="text"
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
        />
      )}
    </div>
  );

  const handleSave = () => {
    startTransition(async () => {
      await updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
          Site Identity
        </h2>
        {field("site_name", "Site Name")}
        {field("tagline", "Tagline")}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
          Contact
        </h2>
        {field("contact_email", "General Email")}
        {field("business_email", "New Business Email")}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
          Social
        </h2>
        {field("social_linkedin", "LinkedIn URL")}
        {field("social_instagram", "Instagram URL")}
        {field("social_twitter", "Twitter / X URL")}
        {field("social_vimeo", "Vimeo URL")}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
          SEO Defaults
        </h2>
        {field("seo_title", "Default Meta Title")}
        {field("seo_description", "Default Meta Description", "textarea")}
        {field("seo_og_image_url", "Default OG Image URL")}
      </section>

      <button
        onClick={handleSave}
        disabled={isPending}
        className="rounded-md bg-[hsl(var(--admin-accent))] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {isPending ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Replace settings page stub**

```typescript
// src/app/(admin)/admin/settings/page.tsx
import { getSettingsAdmin } from "./actions";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSettingsAdmin();

  return (
    <>
      <h1 className="mb-8 text-2xl font-semibold">Settings</h1>
      <SettingsForm initialSettings={settings} />
    </>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/(admin)/admin/settings/actions.ts src/app/(admin)/admin/settings/page.tsx src/app/(admin)/admin/settings/SettingsForm.tsx
git commit -m "feat: add settings admin panel with CRUD server action and settings form"
```

---

## Task 4: Wire Footer + Layout to Settings

**Files:**
- Modify: `src/components/sections/Footer.tsx`
- Modify: `src/app/[lang]/layout.tsx`

- [ ] **Step 1: Update Footer to accept settings prop**

In `src/components/sections/Footer.tsx`, find line 134:
```typescript
export default function Footer({ locations }: { locations: Location[] }) {
```
Replace with:
```typescript
import type { SiteSettings } from "@/lib/page-data";

export default function Footer({
  locations,
  settings,
}: {
  locations: Location[];
  settings?: SiteSettings;
}) {
```

Then find the hardcoded `contactItems` array (lines 139–164) and replace the two email values with settings-driven ones:
```typescript
  const contactItems: ContactItem[] = [
    {
      label: tFooter("collaborateLabel"),
      sublabel: tFooter("collaborateSublabel"),
      value: settings?.business_email ?? "newbusiness@hellomonday.com",
      href: `mailto:${settings?.business_email ?? "newbusiness@hellomonday.com"}`,
    },
    {
      label: tFooter("generalLabel"),
      sublabel: tFooter("generalSublabel"),
      value: settings?.contact_email ?? "hello@hellomonday.com",
      href: `mailto:${settings?.contact_email ?? "hello@hellomonday.com"}`,
    },
    {
      label: tFooter("careersLabel"),
      sublabel: tFooter("careersSublabel"),
      value: tFooter("applyHere"),
      href: "#careers",
    },
    {
      label: tFooter("internshipsLabel"),
      sublabel: tFooter("internshipsSublabel"),
      value: tFooter("applyHere"),
      href: "#careers",
    },
  ];
```

Then find the social links section (the map over `['LinkedIn', 'Instagram', 'Twitter', 'Vimeo']`) and replace it:
```tsx
                <div className="flex gap-8">
                  {[
                    { label: "LinkedIn", url: settings?.social_linkedin },
                    { label: "Instagram", url: settings?.social_instagram },
                    { label: "Twitter", url: settings?.social_twitter },
                    { label: "Vimeo", url: settings?.social_vimeo },
                  ]
                    .filter((s) => s.url)
                    .map(({ label, url }) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold uppercase tracking-widest text-[color:var(--footer-link)] transition-colors hover:text-[color:var(--footer-fg)]"
                      >
                        {label}
                      </a>
                    ))}
                </div>
```

- [ ] **Step 2: Update layout.tsx to fetch settings and pass to Footer**

In `src/app/[lang]/layout.tsx`, find:
```typescript
  const locations = await getLocations();
```
Replace with:
```typescript
  import { getSettings } from "@/lib/page-data";
  // (add this import at top of file alongside other imports)
  
  const [locations, settings] = await Promise.all([getLocations(), getSettings()]);
```

Then find `<Footer locations={locations} />` and replace with:
```tsx
              <Footer locations={locations} settings={settings} />
```

Also add the import at the top of layout.tsx with the other imports:
```typescript
import { getSettings } from "@/lib/page-data";
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -20
```

Expected: successful build, no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Footer.tsx src/app/[lang]/layout.tsx
git commit -m "feat: wire Footer and layout to site_settings for emails and social links"
```

---

## Task 5: Pages Admin — Server Actions

**Files:**
- Create: `src/app/(admin)/admin/pages/actions.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/app/(admin)/admin/pages/actions.ts
"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import type {
  PageSummaryDb,
  PageFullDb,
  PageSectionDb,
  PageInput,
  PageFullInput,
} from "@/lib/page-data";

export async function listPages(): Promise<PageSummaryDb[]> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("pages")
    .select("id, slug, title, published, sort_order")
    .order("sort_order");
  if (error) throw error;
  return data as PageSummaryDb[];
}

export async function getPageAdmin(id: string): Promise<PageFullDb> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: row, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !row) throw new Error("Page not found");

  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_id", id)
    .order("sort_order");

  return { ...row, sections: sections ?? [] } as PageFullDb;
}

export async function createPage(input: PageInput): Promise<string> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("pages")
    .insert({ title: input.title, slug: input.slug })
    .select("id")
    .single();
  if (error) throw error;

  revalidateTag("pages");
  return data.id;
}

export async function updatePage(
  id: string,
  input: PageFullInput
): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error: pageErr } = await supabase
    .from("pages")
    .update({
      title: input.title,
      slug: input.slug,
      meta_title: input.meta_title,
      meta_description: input.meta_description,
      og_image_url: input.og_image_url,
      published: input.published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (pageErr) throw pageErr;

  // Delete all sections then reinsert in order
  const { error: delErr } = await supabase
    .from("page_sections")
    .delete()
    .eq("page_id", id);
  if (delErr) throw delErr;

  if (input.sections.length > 0) {
    const rows = input.sections.map((s, i) => ({
      page_id: id,
      type: s.type,
      content: s.content,
      sort_order: i,
    }));
    const { error: insErr } = await supabase
      .from("page_sections")
      .insert(rows);
    if (insErr) throw insErr;
  }

  revalidateTag("pages");
}

export async function deletePage(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) throw error;

  revalidateTag("pages");
}

export async function togglePublished(
  id: string,
  published: boolean
): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase
    .from("pages")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  revalidateTag("pages");
}

export async function reorderPages(ids: string[]): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  await Promise.all(
    ids.map((id, i) =>
      supabase.from("pages").update({ sort_order: i }).eq("id", id)
    )
  );
  revalidateTag("pages");
}

export async function createPageAndRedirect(input: PageInput): Promise<never> {
  const id = await createPage(input);
  redirect(`/admin/pages/${id}`);
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/(admin)/admin/pages/actions.ts
git commit -m "feat: add pages admin server actions (CRUD, reorder, toggle)"
```

---

## Task 6: Pages Admin List — DnD List UI

**Files:**
- Modify: `src/app/(admin)/admin/pages/page.tsx`
- Create: `src/app/(admin)/admin/pages/PagesList.tsx`

- [ ] **Step 1: Create PagesList client component**

```typescript
// src/app/(admin)/admin/pages/PagesList.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePage, reorderPages, togglePublished } from "./actions";
import type { PageSummaryDb } from "@/lib/page-data";

function SortableRow({
  page,
  onDelete,
  onToggle,
}: {
  page: PageSummaryDb;
  onDelete: (p: PageSummaryDb) => void;
  onToggle: (p: PageSummaryDb) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center gap-3 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-4 py-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        <span className="font-medium text-[hsl(var(--admin-text))] truncate block">
          {page.title}
        </span>
        <span className="text-xs text-[hsl(var(--admin-text-muted))]">
          /{page.slug}
        </span>
      </div>

      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          page.published
            ? "bg-green-100 text-green-700"
            : "bg-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))]"
        }`}
      >
        {page.published ? "Published" : "Draft"}
      </span>

      <button
        onClick={() => onToggle(page)}
        className="rounded p-1.5 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-hover))] hover:text-[hsl(var(--admin-text))]"
        aria-label={page.published ? "Unpublish" : "Publish"}
      >
        {page.published ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>

      <Link
        href={`/admin/pages/${page.id}`}
        className="rounded p-1.5 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-hover))] hover:text-[hsl(var(--admin-text))]"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>

      <button
        onClick={() => onDelete(page)}
        className="rounded p-1.5 text-[hsl(var(--admin-text-muted))] hover:bg-red-50 hover:text-red-600"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function PagesList({
  initialPages,
}: {
  initialPages: PageSummaryDb[];
}) {
  const [pages, setPages] = useState(initialPages);
  const [toDelete, setToDelete] = useState<PageSummaryDb | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(pages, oldIndex, newIndex);
    setPages(reordered);
    startTransition(() => {
      reorderPages(reordered.map((p) => p.id));
    });
  };

  const handleToggle = (page: PageSummaryDb) => {
    const updated = pages.map((p) =>
      p.id === page.id ? { ...p, published: !p.published } : p
    );
    setPages(updated);
    startTransition(() => {
      togglePublished(page.id, !page.published);
    });
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setPages((prev) => prev.filter((p) => p.id !== toDelete.id));
    await deletePage(toDelete.id);
    setToDelete(null);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pages.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {pages.map((page) => (
              <SortableRow
                key={page.id}
                page={page}
                onDelete={setToDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{toDelete?.title}&rdquo; and all its sections. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **Step 2: Replace pages/page.tsx stub**

```typescript
// src/app/(admin)/admin/pages/page.tsx
import Link from "next/link";
import { listPages } from "./actions";
import PagesList from "./PagesList";

export default async function AdminPagesPage() {
  const pages = await listPages();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pages</h1>
        <Link
          href="/admin/pages/new"
          className="rounded-md bg-[hsl(var(--admin-accent))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          + New Page
        </Link>
      </div>
      {pages.length === 0 ? (
        <p className="text-sm text-[hsl(var(--admin-text-muted))]">
          No pages yet. Create your first page.
        </p>
      ) : (
        <PagesList initialPages={pages} />
      )}
    </>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/(admin)/admin/pages/page.tsx src/app/(admin)/admin/pages/PagesList.tsx
git commit -m "feat: add pages admin list with DnD reorder, publish toggle, and delete"
```

---

## Task 7: New Page Form

**Files:**
- Create: `src/app/(admin)/admin/pages/new/page.tsx`

- [ ] **Step 1: Create the file**

```typescript
// src/app/(admin)/admin/pages/new/page.tsx
"use client";

import { useState, useTransition } from "react";
import { createPageAndRedirect } from "../actions";

export default function NewPagePage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug may only contain lowercase letters, numbers, and hyphens.");
      return;
    }
    setError("");
    startTransition(() => {
      createPageAndRedirect({ title: title.trim(), slug: slug.trim() });
    });
  };

  const autoSlug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <>
      <h1 className="mb-8 text-2xl font-semibold">New Page</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug) setSlug(autoSlug(e.target.value));
            }}
            placeholder="About Us"
            className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
            Slug
          </label>
          <div className="flex items-center gap-1">
            <span className="text-sm text-[hsl(var(--admin-text-muted))]">/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(autoSlug(e.target.value))}
              placeholder="about-us"
              className="flex-1 rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
            />
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-[hsl(var(--admin-accent))] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isPending ? "Creating…" : "Create Page"}
          </button>
          <a
            href="/admin/pages"
            className="rounded-md border border-[hsl(var(--admin-border))] px-5 py-2 text-sm font-medium text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-hover))] transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(admin)/admin/pages/new/page.tsx
git commit -m "feat: add new page creation form with auto-slug generation"
```

---

## Task 8: Page Editor — Meta + Sections

**Files:**
- Create: `src/app/(admin)/admin/pages/[id]/page.tsx`
- Create: `src/app/(admin)/admin/pages/[id]/PageEditor.tsx`
- Create: `src/app/(admin)/admin/pages/[id]/SectionEditor.tsx`

- [ ] **Step 1: Create SectionEditor component**

```typescript
// src/app/(admin)/admin/pages/[id]/SectionEditor.tsx
"use client";

import type { SectionType, PageSectionInput } from "@/lib/page-data";

interface Props {
  section: PageSectionInput & { id: string };
  onChange: (updated: PageSectionInput & { id: string }) => void;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "textarea" | "url";
}) {
  const cls =
    "w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea rows={4} className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function c(section: PageSectionInput, key: string): string {
  return String(section.content[key] ?? "");
}

export default function SectionEditor({ section, onChange }: Props) {
  const set = (key: string, value: unknown) =>
    onChange({ ...section, content: { ...section.content, [key]: value } });

  const fields: Record<SectionType, JSX.Element> = {
    hero: (
      <div className="space-y-3">
        <Field label="Headline" value={c(section, "headline")} onChange={(v) => set("headline", v)} type="textarea" />
        <Field label="Highlight word" value={c(section, "highlight")} onChange={(v) => set("highlight", v)} />
        <Field label="Body text" value={c(section, "body")} onChange={(v) => set("body", v)} type="textarea" />
        <Field label="CTA Label" value={c(section, "cta_label")} onChange={(v) => set("cta_label", v)} />
        <Field label="CTA URL" value={c(section, "cta_url")} onChange={(v) => set("cta_url", v)} type="url" />
      </div>
    ),
    text_image: (
      <div className="space-y-3">
        <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
        <Field label="Title" value={c(section, "title")} onChange={(v) => set("title", v)} />
        <Field label="Body (first paragraph)" value={c(section, "body_0")} onChange={(v) => {
          const arr = [v, c(section, "body_1")].filter(Boolean);
          set("body", arr);
        }} type="textarea" />
        <Field label="Body (second paragraph, optional)" value={c(section, "body_1")} onChange={(v) => {
          const arr = [c(section, "body_0"), v].filter(Boolean);
          set("body", arr);
        }} type="textarea" />
        <Field label="Image URL" value={c(section, "image_url")} onChange={(v) => set("image_url", v)} type="url" />
        <Field label="Image Alt" value={c(section, "image_alt")} onChange={(v) => set("image_alt", v)} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">Image Layout</label>
          <select
            className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm"
            value={c(section, "image_layout") || "right"}
            onChange={(e) => set("image_layout", e.target.value)}
          >
            <option value="right">Right</option>
            <option value="left">Left</option>
          </select>
        </div>
      </div>
    ),
    projects_grid: (
      <div className="space-y-3">
        <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
        <Field label="Heading" value={c(section, "heading")} onChange={(v) => set("heading", v)} />
        <p className="text-xs text-[hsl(var(--admin-text-muted))]">Shows live project data from the Projects collection.</p>
      </div>
    ),
    faq: (
      <div className="space-y-3">
        <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
        <Field label="Heading" value={c(section, "heading")} onChange={(v) => set("heading", v)} />
        <p className="text-xs text-[hsl(var(--admin-text-muted))]">Shows live FAQ data from the FAQ collection.</p>
      </div>
    ),
    product_feature: (
      <div className="space-y-3">
        <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
        <Field label="Title" value={c(section, "title")} onChange={(v) => set("title", v)} />
        <Field label="Body" value={c(section, "body")} onChange={(v) => set("body", v)} type="textarea" />
        <Field label="Image URL" value={c(section, "image_url")} onChange={(v) => set("image_url", v)} type="url" />
        <Field label="CTA Label" value={c(section, "cta_label")} onChange={(v) => set("cta_label", v)} />
        <Field label="CTA URL" value={c(section, "cta_url")} onChange={(v) => set("cta_url", v)} type="url" />
      </div>
    ),
    metrics: (
      <div className="space-y-3">
        <Field label="Heading" value={c(section, "heading")} onChange={(v) => set("heading", v)} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
            Items (JSON array of {"{"}"label","value"{"}"})
          </label>
          <textarea
            rows={5}
            className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
            value={JSON.stringify(section.content.items ?? [], null, 2)}
            onChange={(e) => {
              try { set("items", JSON.parse(e.target.value)); } catch { /* ignore invalid JSON mid-edit */ }
            }}
          />
        </div>
      </div>
    ),
    rich_text: (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
          HTML (allowed: p, h2–h4, a, strong, em, ul, ol, li, blockquote)
        </label>
        <textarea
          rows={10}
          className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
          value={c(section, "html")}
          onChange={(e) => set("html", e.target.value)}
        />
      </div>
    ),
  };

  return (
    <div className="rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
        {section.type.replace(/_/g, " ")}
      </p>
      {fields[section.type] ?? (
        <p className="text-xs text-[hsl(var(--admin-text-muted))]">Unknown section type.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create PageEditor component**

```typescript
// src/app/(admin)/admin/pages/[id]/PageEditor.tsx
"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { updatePage } from "./actions";
import SectionEditor from "./SectionEditor";
import type { PageFullDb, PageSectionInput, SectionType } from "@/lib/page-data";

const SECTION_TYPES: SectionType[] = [
  "hero",
  "text_image",
  "projects_grid",
  "faq",
  "product_feature",
  "metrics",
  "rich_text",
];

function SortableSection({
  section,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: {
  section: PageSectionInput & { id: string };
  expanded: boolean;
  onToggle: () => void;
  onChange: (s: PageSectionInput & { id: string }) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))]"
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="flex-1 text-sm font-medium text-[hsl(var(--admin-text))]">
          {section.type.replace(/_/g, " ")}
        </span>
        <button
          onClick={onRemove}
          className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:text-red-600"
          aria-label="Remove section"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={onToggle}
          className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-[hsl(var(--admin-border))] p-4">
          <SectionEditor section={section} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

export default function PageEditor({ page }: { page: PageFullDb }) {
  const [tab, setTab] = useState<"meta" | "sections">("meta");
  const [title, setTitle] = useState(page.title);
  const [metaTitle, setMetaTitle] = useState(page.meta_title);
  const [metaDescription, setMetaDescription] = useState(page.meta_description);
  const [ogImageUrl, setOgImageUrl] = useState(page.og_image_url);
  const [published, setPublished] = useState(page.published);
  const [sections, setSections] = useState<Array<PageSectionInput & { id: string }>>(
    page.sections.map((s) => ({ id: s.id, type: s.type, content: s.content }))
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    setSections(arrayMove(sections, oldIdx, newIdx));
  };

  const addSection = (type: SectionType) => {
    const id = crypto.randomUUID();
    setSections((prev) => [...prev, { id, type, content: {} }]);
    setExpanded(id);
  };

  const handleSave = () => {
    startTransition(async () => {
      await updatePage(page.id, {
        title,
        slug: page.slug,
        meta_title: metaTitle,
        meta_description: metaDescription,
        og_image_url: ogImageUrl,
        published,
        sections: sections.map(({ type, content }) => ({ type, content })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const inputCls =
    "w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]";

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 mb-6 flex items-center gap-4 border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] pb-4 pt-1">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-base font-semibold text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
          placeholder="Page title"
        />
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-md bg-[hsl(var(--admin-accent))] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1">
        {(["meta", "sections"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "bg-[hsl(var(--admin-accent))] text-white"
                : "text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-hover))]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "meta" && (
        <div className="max-w-xl space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">Slug (read-only)</label>
            <input type="text" readOnly value={page.slug} className={`${inputCls} opacity-60`} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">Meta Title</label>
            <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">Meta Description</label>
            <textarea rows={3} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">OG Image URL</label>
            <input type="url" value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} className={inputCls} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-[hsl(var(--admin-border))] accent-[hsl(var(--admin-accent))]"
            />
            <span className="text-sm text-[hsl(var(--admin-text))]">Published</span>
          </label>
        </div>
      )}

      {tab === "sections" && (
        <div className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-3">
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    expanded={expanded === section.id}
                    onToggle={() => setExpanded(expanded === section.id ? null : section.id)}
                    onChange={(updated) =>
                      setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
                    }
                    onRemove={() =>
                      setSections((prev) => prev.filter((s) => s.id !== section.id))
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex flex-wrap gap-2 pt-2">
            {SECTION_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => addSection(type)}
                className="rounded-md border border-dashed border-[hsl(var(--admin-border))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--admin-text-muted))] hover:border-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent))] transition-colors"
              >
                + {type.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create page editor server component with its own actions import**

First, create the actions file for the `[id]` route (it re-uses the parent actions):

```typescript
// src/app/(admin)/admin/pages/[id]/actions.ts
"use server";

export { updatePage } from "../actions";
```

Then create the page:

```typescript
// src/app/(admin)/admin/pages/[id]/page.tsx
import { notFound } from "next/navigation";
import { getPageAdmin } from "../actions";
import PageEditor from "./PageEditor";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let page;
  try {
    page = await getPageAdmin(id);
  } catch {
    notFound();
  }

  return <PageEditor page={page} />;
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors (fix any type issues before proceeding).

- [ ] **Step 5: Commit**

```bash
git add src/app/(admin)/admin/pages/[id]/
git commit -m "feat: add page editor with meta tab, DnD sections tab, and per-type section forms"
```

---

## Task 9: Install dompurify + Builder Section Components

**Files:**
- Create: `src/components/builder/sections/TextImageSection.tsx`
- Create: `src/components/builder/sections/MetricsSection.tsx`
- Create: `src/components/builder/sections/RichTextSection.tsx`

- [ ] **Step 1: Install isomorphic-dompurify**

```bash
npm install isomorphic-dompurify
npm install --save-dev @types/dompurify
```

Expected: installs without error.

- [ ] **Step 2: Create TextImageSection**

```typescript
// src/components/builder/sections/TextImageSection.tsx
interface Props {
  eyebrow?: string;
  title?: string;
  body?: string[];
  image_url?: string;
  image_alt?: string;
  image_layout?: "left" | "right";
  tone?: "light" | "navy";
}

export default function TextImageSection({
  eyebrow,
  title,
  body = [],
  image_url,
  image_alt,
  image_layout = "right",
  tone = "light",
}: Props) {
  const isNavy = tone === "navy";
  const imageFirst = image_layout === "left";

  return (
    <section
      className={`py-20 px-5 md:px-20 ${isNavy ? "bg-[hsl(var(--accent))] text-white" : "bg-background text-foreground"}`}
    >
      <div className="mx-auto max-w-7xl">
        <div
          className={`grid grid-cols-1 items-center gap-12 md:grid-cols-2 ${imageFirst ? "md:[&>*:first-child]:order-2" : ""}`}
        >
          <div className={imageFirst ? "order-2 md:order-1" : ""}>
            {eyebrow && (
              <p className={`mb-3 text-xs font-bold uppercase tracking-widest ${isNavy ? "text-white/60" : "text-[hsl(var(--secondary))]"}`}>
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mb-6 font-serif text-3xl font-bold leading-snug md:text-4xl">
                {title}
              </h2>
            )}
            {body.map((paragraph, i) => (
              <p key={i} className={`mb-4 text-base leading-relaxed ${isNavy ? "text-white/80" : "text-foreground/80"}`}>
                {paragraph}
              </p>
            ))}
          </div>
          {image_url && (
            <div className={`overflow-hidden rounded-xl ${imageFirst ? "order-1 md:order-2" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image_url}
                alt={image_alt ?? ""}
                className="w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create MetricsSection**

```typescript
// src/components/builder/sections/MetricsSection.tsx
interface MetricItem {
  label: string;
  value: string;
}

interface Props {
  heading?: string;
  items?: MetricItem[];
}

export default function MetricsSection({ heading, items = [] }: Props) {
  return (
    <section className="py-20 px-5 md:px-20 bg-background">
      <div className="mx-auto max-w-7xl">
        {heading && (
          <h2 className="mb-12 font-serif text-3xl font-bold md:text-4xl">{heading}</h2>
        )}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="font-serif text-4xl font-bold text-[hsl(var(--secondary))] md:text-5xl">
                {item.value}
              </span>
              <span className="text-sm text-foreground/60 uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create RichTextSection**

```typescript
// src/components/builder/sections/RichTextSection.tsx
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["p", "h2", "h3", "h4", "a", "strong", "em", "ul", "ol", "li", "blockquote"];
const ALLOWED_ATTR = ["href", "target", "rel"];

interface Props {
  html: string;
}

export default function RichTextSection({ html }: Props) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });

  if (!clean) return null;

  return (
    <section className="py-16 px-5 md:px-20">
      <div
        className="mx-auto max-w-3xl prose prose-neutral"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </section>
  );
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/builder/ package.json package-lock.json
git commit -m "feat: add TextImageSection, MetricsSection, RichTextSection builder components"
```

---

## Task 10: SectionRenderer

**Files:**
- Create: `src/components/builder/SectionRenderer.tsx`

- [ ] **Step 1: Create the file**

```typescript
// src/components/builder/SectionRenderer.tsx
import CreativeHero from "@/components/sections/CreativeHero";
import Projects from "@/components/sections/Projects";
import FaqQuoteSection from "@/components/sections/FaqQuoteSection";
import ProductSection from "@/components/sections/ProductSection";
import TextImageSection from "@/components/builder/sections/TextImageSection";
import MetricsSection from "@/components/builder/sections/MetricsSection";
import RichTextSection from "@/components/builder/sections/RichTextSection";
import type { PageSectionDb } from "@/lib/page-data";
import type { ProjectSummaryDb } from "@/lib/project-data";
import type { FaqItem } from "@/lib/faq-data";
import type { CreativeHeroConfig } from "@/lib/hero-types";

interface Props {
  sections: PageSectionDb[];
  projects?: ProjectSummaryDb[];
  faqItems?: FaqItem[];
}

export default function SectionRenderer({ sections, projects = [], faqItems = [] }: Props) {
  return (
    <>
      {sections.map((section) => {
        const c = section.content;

        switch (section.type) {
          case "hero": {
            const config: CreativeHeroConfig = {
              headline: String(c.headline ?? ""),
              highlight: String(c.highlight ?? ""),
              body: String(c.body ?? ""),
              primaryCta: c.cta_label
                ? { label: String(c.cta_label), href: String(c.cta_url ?? "#") }
                : undefined,
            };
            return <CreativeHero key={section.id} config={config} />;
          }

          case "text_image":
            return (
              <TextImageSection
                key={section.id}
                eyebrow={String(c.eyebrow ?? "")}
                title={String(c.title ?? "")}
                body={Array.isArray(c.body) ? (c.body as string[]) : []}
                image_url={String(c.image_url ?? "")}
                image_alt={String(c.image_alt ?? "")}
                image_layout={(c.image_layout as "left" | "right") ?? "right"}
                tone={(c.tone as "light" | "navy") ?? "light"}
              />
            );

          case "projects_grid":
            return <Projects key={section.id} projects={projects} />;

          case "faq":
            return <FaqQuoteSection key={section.id} faqItems={faqItems} />;

          case "product_feature":
            return <ProductSection key={section.id} />;

          case "metrics":
            return (
              <MetricsSection
                key={section.id}
                heading={String(c.heading ?? "")}
                items={Array.isArray(c.items) ? (c.items as Array<{ label: string; value: string }>) : []}
              />
            );

          case "rich_text":
            return <RichTextSection key={section.id} html={String(c.html ?? "")} />;

          default:
            return null;
        }
      })}
    </>
  );
}
```

- [ ] **Step 2: Verify the FaqItem type path is correct**

```bash
grep -n "export" src/lib/faq-data.ts | head -10
```

If `FaqItem` is not exported from `faq-data.ts`, adjust the import. Check what type `faqItems` actually is in the existing `FaqQuoteSection` props and match it.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Fix any type errors before committing.

- [ ] **Step 4: Commit**

```bash
git add src/components/builder/SectionRenderer.tsx
git commit -m "feat: add SectionRenderer switching on section type to render builder components"
```

---

## Task 11: Catch-all Public Route + Remove Static Pages

**Files:**
- Create: `src/app/[lang]/[slug]/page.tsx`
- Delete: `src/app/[lang]/about/page.tsx`
- Delete: `src/app/[lang]/services/page.tsx`
- Delete: `src/app/[lang]/work/page.tsx`
- Delete: `src/app/[lang]/products/page.tsx`

- [ ] **Step 1: Check which static page files exist**

```bash
ls src/app/\[lang\]/
```

Note which of `about/`, `services/`, `work/`, `products/` directories exist — only delete what's there.

- [ ] **Step 2: Create catch-all route**

```typescript
// src/app/[lang]/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPage, getPages } from "@/lib/page-data";
import { getProjects } from "@/lib/project-data";
import { getFaqItems } from "@/lib/faq-data";
import SectionRenderer from "@/components/builder/SectionRenderer";
import type { Metadata } from "next";

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const pages = await getPages();
  return pages
    .filter((p) => p.published && p.slug !== "home")
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page || !page.published) return {};
  return {
    title: page.meta_title || page.title,
    description: page.meta_description || undefined,
    openGraph: page.og_image_url ? { images: [page.og_image_url] } : undefined,
  };
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page || !page.published) notFound();

  const needsProjects = page.sections.some((s) => s.type === "projects_grid");
  const needsFaq = page.sections.some((s) => s.type === "faq");

  const [projects, faqItems] = await Promise.all([
    needsProjects ? getProjects() : Promise.resolve([]),
    needsFaq ? getFaqItems() : Promise.resolve([]),
  ]);

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <SectionRenderer
        sections={page.sections}
        projects={projects}
        faqItems={faqItems}
      />
    </div>
  );
}
```

- [ ] **Step 3: Delete static page files that exist**

For each directory that exists from the check above (`about`, `services`, `work`, `products`):

```bash
rm -rf "src/app/[lang]/about"
rm -rf "src/app/[lang]/services"  
rm -rf "src/app/[lang]/work"
rm -rf "src/app/[lang]/products"
```

Only run the `rm` for directories that actually exist.

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Fix any type errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/\[lang\]/\[slug\]/
git rm -r src/app/\[lang\]/about/ src/app/\[lang\]/services/ src/app/\[lang\]/work/ src/app/\[lang\]/products/ 2>/dev/null || true
git commit -m "feat: add catch-all [slug] route and remove static page files"
```

---

## Task 12: Update Homepage to Fetch from DB

**Files:**
- Modify: `src/app/[lang]/page.tsx`

- [ ] **Step 1: Read the current homepage**

Read `src/app/[lang]/page.tsx` to confirm its current imports and structure before editing.

- [ ] **Step 2: Replace the homepage**

```typescript
// src/app/[lang]/page.tsx
import { getPage } from "@/lib/page-data";
import { getProjects } from "@/lib/project-data";
import { getFaqItems } from "@/lib/faq-data";
import SectionRenderer from "@/components/builder/SectionRenderer";
import CreativeHero from "@/components/sections/CreativeHero";
import Projects from "@/components/sections/Projects";
import ProductSection from "@/components/sections/ProductSection";
import FaqQuoteSection from "@/components/sections/FaqQuoteSection";
import { getTranslations } from "next-intl/server";
import type { CreativeHeroConfig } from "@/lib/hero-types";

export const revalidate = 60;

export default async function Home() {
  const homePage = await getPage("home");

  // If a home page exists in DB with sections, render via builder
  if (homePage && homePage.sections.length > 0) {
    const needsProjects = homePage.sections.some((s) => s.type === "projects_grid");
    const needsFaq = homePage.sections.some((s) => s.type === "faq");
    const [projects, faqItems] = await Promise.all([
      needsProjects ? getProjects() : Promise.resolve([]),
      needsFaq ? getFaqItems() : Promise.resolve([]),
    ]);
    return (
      <div className="min-h-screen bg-transparent text-foreground">
        <SectionRenderer sections={homePage.sections} projects={projects} faqItems={faqItems} />
      </div>
    );
  }

  // Fallback: render static homepage if no home page in DB yet
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const [faqItems, projects] = await Promise.all([getFaqItems(), getProjects()]);

  const heroConfig: CreativeHeroConfig = {
    headline: `${t("heroHeadlineLine1")}\n${t("heroHeadlineLine2")}`,
    highlight: t("heroHighlight"),
    body: t("heroBody"),
    primaryCta: { label: tCommon("startProject"), href: "#quote" },
    secondaryCta: { label: tCommon("seeWork"), href: "/work" },
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main>
        <CreativeHero config={heroConfig} />
        <Projects projects={projects} />
        <ProductSection />
        <FaqQuoteSection faqItems={faqItems} />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/\[lang\]/page.tsx
git commit -m "feat: update homepage to fetch from DB page builder, with static fallback"
```

---

## Task 13: Seed Pages Script

**Files:**
- Create: `scripts/seed-pages.ts`

- [ ] **Step 1: Create the seed script**

```typescript
// scripts/seed-pages.ts
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const pages = [
  {
    slug: "home",
    title: "Home",
    published: true,
    sort_order: 0,
    sections: [
      {
        type: "hero",
        sort_order: 0,
        content: {
          headline: "Ideas That\nOrbit Your",
          highlight: "Core.",
          body: "Brand strategy, identity, content, and 3D visuals that convert.",
          cta_label: "See Our Work",
          cta_url: "/work",
        },
      },
      {
        type: "projects_grid",
        sort_order: 1,
        content: { eyebrow: "Selected Work", heading: "Projects" },
      },
      {
        type: "product_feature",
        sort_order: 2,
        content: {},
      },
      {
        type: "faq",
        sort_order: 3,
        content: { eyebrow: "Questions", heading: "FAQ" },
      },
    ],
  },
  {
    slug: "about",
    title: "About",
    published: true,
    sort_order: 1,
    sections: [
      {
        type: "hero",
        sort_order: 0,
        content: {
          headline: "We are Hello Monday",
          highlight: "",
          body: "A creative studio building brands, experiences, and digital products that move.",
          cta_label: "",
          cta_url: "",
        },
      },
    ],
  },
  {
    slug: "work",
    title: "Work",
    published: true,
    sort_order: 2,
    sections: [
      {
        type: "projects_grid",
        sort_order: 0,
        content: { eyebrow: "Selected Work", heading: "Our Projects" },
      },
    ],
  },
  {
    slug: "services",
    title: "Services",
    published: true,
    sort_order: 3,
    sections: [
      {
        type: "hero",
        sort_order: 0,
        content: {
          headline: "What We Do",
          highlight: "",
          body: "Brand strategy, identity systems, digital experiences, and creative direction.",
          cta_label: "Start a project",
          cta_url: "#contact",
        },
      },
    ],
  },
  {
    slug: "products",
    title: "Products",
    published: true,
    sort_order: 4,
    sections: [
      {
        type: "product_feature",
        sort_order: 0,
        content: {},
      },
    ],
  },
];

async function main() {
  console.log("Seeding pages…");

  for (const page of pages) {
    const { sections, ...pageData } = page;

    // Upsert the page
    const { data: row, error: pageErr } = await supabase
      .from("pages")
      .upsert(pageData, { onConflict: "slug" })
      .select("id")
      .single();

    if (pageErr || !row) {
      console.error(`Failed to upsert page '${page.slug}':`, pageErr);
      continue;
    }

    // Delete existing sections
    await supabase.from("page_sections").delete().eq("page_id", row.id);

    // Insert sections
    if (sections.length > 0) {
      const { error: secErr } = await supabase.from("page_sections").insert(
        sections.map((s) => ({ ...s, page_id: row.id }))
      );
      if (secErr) {
        console.error(`Failed to insert sections for '${page.slug}':`, secErr);
        continue;
      }
    }

    console.log(`  ✓ ${page.slug}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Run the seed script**

```bash
npx tsx scripts/seed-pages.ts
```

Expected output:
```
Seeding pages…
  ✓ home
  ✓ about
  ✓ work
  ✓ services
  ✓ products
Done.
```

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-pages.ts
git commit -m "feat: add seed-pages script to populate DB with initial page content"
```

---

## Task 14: Full Build Verification

- [ ] **Step 1: Run full build**

```bash
npm run build 2>&1 | tail -30
```

Expected: successful build. If there are errors, fix them before proceeding.

- [ ] **Step 2: Check for common issues**

If you see errors about:
- `FaqItem` not exported: check `src/lib/faq-data.ts` and adjust the import in `SectionRenderer.tsx`
- `ProjectSummaryDb` mismatch with `Projects` component props: read `src/components/sections/Projects.tsx` and align types
- `isomorphic-dompurify` type issues: add `// @ts-expect-error` if `@types/dompurify` doesn't cover it, or import as `import DOMPurify from "isomorphic-dompurify/browser"` on client

- [ ] **Step 3: Verify lint**

```bash
npm run lint 2>&1 | tail -20
```

Expected: no errors (warnings are acceptable).

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final build verification and lint fixes for CMS page builder"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] `pages` + `page_sections` + `site_settings` tables — Task 1
- [x] `getPage`, `getPages`, `getSettings` cached fetchers — Task 2
- [x] `revalidateTag("pages")` / `revalidateTag("settings")` — Tasks 3, 5
- [x] Settings admin panel (all 4 groups) — Task 3
- [x] Footer wired to settings (emails + social) — Task 4
- [x] Layout fetches settings in parallel — Task 4
- [x] Pages admin CRUD + reorder + toggle — Tasks 5, 6
- [x] DnD page list — Task 6
- [x] New page form with auto-slug — Task 7
- [x] Page editor: meta tab + sections tab — Task 8
- [x] SectionEditor per-type forms — Task 8
- [x] 7 section types all covered in SectionEditor — Task 8
- [x] TextImageSection, MetricsSection, RichTextSection — Task 9
- [x] HTML sanitization with dompurify whitelist — Task 9
- [x] SectionRenderer switch — Task 10
- [x] `projects_grid` + `faq` pre-fetch pattern — Tasks 10, 11
- [x] Catch-all `[slug]` route — Task 11
- [x] `generateStaticParams` (published, non-home) — Task 11
- [x] `generateMetadata` from page fields — Task 11
- [x] Static page files removed — Task 11
- [x] Homepage fetches `getPage("home")` with fallback — Task 12
- [x] Seed script — Task 13
- [x] Auth guard on every server action — Tasks 3, 5
- [x] RLS deny-all on all 3 tables — Task 1

**No placeholders, no TBD items.**
