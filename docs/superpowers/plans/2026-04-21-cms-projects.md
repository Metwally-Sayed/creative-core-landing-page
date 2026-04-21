# CMS Sub-project #4: Projects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static `project-catalog.ts` with Supabase-backed tables; give admins a full rich-content editor; keep the public frontend rendering identically via a mapper layer.

**Architecture:** 7 Supabase tables (projects + 6 child tables). Admin routes under `src/app/(admin)/admin/projects/`. Public data layer in `src/lib/project-data.ts` using `unstable_cache`. `ProjectDetailView.tsx` stays untouched — a mapper function in `ProjectDetailContainer.tsx` converts `ProjectFullDb` → the legacy `ProjectDetail` type.

**Tech Stack:** Next.js 16 App Router, Supabase (service-role), `@dnd-kit/core` + `@dnd-kit/sortable`, `unstable_cache` + `revalidateTag("projects","max")`, existing `AssetPicker` component.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/20260421000002_create_projects.sql` | Create | 7 tables + RLS |
| `src/lib/project-data.ts` | Create | DB types, public cached fetchers, mapper |
| `scripts/seed-projects.ts` | Create | One-time migration of 23 static projects |
| `src/app/(admin)/admin/projects/actions.ts` | Create | 8 server actions |
| `src/app/(admin)/admin/projects/page.tsx` | Replace stub | List page server component |
| `src/app/(admin)/admin/projects/ProjectsList.tsx` | Create | DnD list client component |
| `src/app/(admin)/admin/projects/new/page.tsx` | Create | New project form |
| `src/app/(admin)/admin/projects/[id]/page.tsx` | Create | Edit page server component |
| `src/app/(admin)/admin/projects/[id]/ProjectEditor.tsx` | Create | Full edit form (client) |
| `src/components/admin/ImageField.tsx` | Create | AssetPicker + URL fallback |
| `src/components/sections/Projects.tsx` | Modify | Accept `projects` prop |
| `src/app/[lang]/page.tsx` | Modify | Await `getProjects()` |
| `src/app/[lang]/projects/[id]/page.tsx` | Modify | Use slug + DB fetch |
| `src/components/projects/ProjectDetailContainer.tsx` | Modify | DB fetch + mapper |

---

## Task 1: SQL Migration

**Files:**
- Create: `supabase/migrations/20260421000002_create_projects.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260421000002_create_projects.sql

create table if not exists projects (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  tags             text[] not null default '{}',
  aspect_ratio     text not null default 'landscape',
  cover_image_url  text not null default '',
  published        bool not null default false,
  sort_order       int4 not null default 0,
  hero_label       text not null default '',
  hero_title       text not null default '',
  hero_subtitle    text not null default '',
  hero_summary     text not null default '',
  hero_image_url   text not null default '',
  client           text not null default '',
  project_type     text not null default '',
  deliverables     text not null default '',
  launch_label     text not null default '',
  launch_url       text not null default '',
  intro            text[] not null default '{}',
  showcase_image_url text not null default '',
  showcase_alt     text not null default '',
  showcase_label   text not null default '',
  feature_eyebrow  text not null default '',
  feature_title    text not null default '',
  feature_body     text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists project_sections (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  eyebrow      text not null default '',
  title        text not null default '',
  body         text[] not null default '{}',
  image_url    text not null default '',
  image_alt    text not null default '',
  image_layout text not null default 'right',
  tone         text not null default 'light',
  sort_order   int4 not null default 0
);

create table if not exists project_gallery (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  image_url   text not null default '',
  image_alt   text not null default '',
  image_label text not null default '',
  sort_order  int4 not null default 0
);

create table if not exists project_metrics (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  label      text not null default '',
  value      text not null default '',
  sort_order int4 not null default 0
);

create table if not exists project_credits (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  label      text not null default '',
  value      text not null default '',
  sort_order int4 not null default 0
);

create table if not exists project_overview (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  label      text not null default '',
  value      text not null default '',
  sort_order int4 not null default 0
);

create table if not exists project_related (
  project_id         uuid not null references projects(id) on delete cascade,
  related_project_id uuid not null references projects(id) on delete cascade,
  sort_order         int4 not null default 0,
  primary key (project_id, related_project_id)
);

-- RLS: deny all for anon and authenticated; service-role bypasses
alter table projects enable row level security;
alter table project_sections enable row level security;
alter table project_gallery enable row level security;
alter table project_metrics enable row level security;
alter table project_credits enable row level security;
alter table project_overview enable row level security;
alter table project_related enable row level security;

create policy "deny anon projects" on projects for all to anon using (false);
create policy "deny auth projects" on projects for all to authenticated using (false);
create policy "deny anon project_sections" on project_sections for all to anon using (false);
create policy "deny auth project_sections" on project_sections for all to authenticated using (false);
create policy "deny anon project_gallery" on project_gallery for all to anon using (false);
create policy "deny auth project_gallery" on project_gallery for all to authenticated using (false);
create policy "deny anon project_metrics" on project_metrics for all to anon using (false);
create policy "deny auth project_metrics" on project_metrics for all to authenticated using (false);
create policy "deny anon project_credits" on project_credits for all to anon using (false);
create policy "deny auth project_credits" on project_credits for all to authenticated using (false);
create policy "deny anon project_overview" on project_overview for all to anon using (false);
create policy "deny auth project_overview" on project_overview for all to authenticated using (false);
create policy "deny anon project_related" on project_related for all to anon using (false);
create policy "deny auth project_related" on project_related for all to authenticated using (false);
```

- [ ] **Step 2: Apply migration to Supabase**

Run in Supabase SQL editor or via Supabase CLI:
```bash
# If using supabase CLI:
npx supabase db push
# Or copy-paste the SQL into the Supabase dashboard SQL editor and run it
```

Expected: All 7 tables created with no errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260421000002_create_projects.sql
git commit -m "feat: add projects tables migration (7 tables + RLS)"
```

---

## Task 2: Types and Public Data Layer

**Files:**
- Create: `src/lib/project-data.ts`

- [ ] **Step 1: Write the file**

```ts
// src/lib/project-data.ts
import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";
import type {
  ProjectDetail,
  ProjectSummary,
  ProjectSection as LegacySection,
  ProjectGalleryImage as LegacyGallery,
  ProjectFact as LegacyFact,
} from "@/lib/project-catalog";

// ─── DB types ────────────────────────────────────────────────────────────────

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

export interface ProjectSectionDb {
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

export interface ProjectGalleryDb {
  id: string;
  project_id: string;
  image_url: string;
  image_alt: string;
  image_label: string;
  sort_order: number;
}

export interface ProjectFactDb {
  id: string;
  project_id: string;
  label: string;
  value: string;
  sort_order: number;
}

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
  sections: ProjectSectionDb[];
  gallery: ProjectGalleryDb[];
  metrics: ProjectFactDb[];
  credits: ProjectFactDb[];
  overview: ProjectFactDb[];
  related_ids: string[];
  created_at: string;
  updated_at: string;
}

// ─── Admin input types ────────────────────────────────────────────────────────

export interface ProjectInput {
  title: string;
  slug: string;
  tags?: string[];
  aspect_ratio?: "portrait" | "landscape" | "square";
  cover_image_url?: string;
  published?: boolean;
}

export interface ProjectSectionInput {
  eyebrow: string;
  title: string;
  body: string[];
  image_url: string;
  image_alt: string;
  image_layout: "left" | "right";
  tone: "light" | "navy";
}

export interface ProjectGalleryInput {
  image_url: string;
  image_alt: string;
  image_label: string;
}

export interface ProjectFactInput {
  label: string;
  value: string;
}

export interface ProjectFullInput {
  title: string;
  slug: string;
  tags: string[];
  aspect_ratio: "portrait" | "landscape" | "square";
  cover_image_url: string;
  published: boolean;
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
  sections: ProjectSectionInput[];
  gallery: ProjectGalleryInput[];
  metrics: ProjectFactInput[];
  credits: ProjectFactInput[];
  overview: ProjectFactInput[];
  related_ids: string[];
}

// ─── Public cached fetchers ───────────────────────────────────────────────────

const SUMMARY_COLS =
  "id, slug, title, tags, aspect_ratio, cover_image_url, published, sort_order";

export const getProjects = unstable_cache(
  async (): Promise<ProjectSummaryDb[]> => {
    const { data, error } = await supabase
      .from("projects")
      .select(SUMMARY_COLS)
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
    const { data: row, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    if (error || !row) return null;

    const [sections, gallery, metrics, credits, overview, related] =
      await Promise.all([
        supabase
          .from("project_sections")
          .select("*")
          .eq("project_id", row.id)
          .order("sort_order")
          .then((r) => r.data ?? []),
        supabase
          .from("project_gallery")
          .select("*")
          .eq("project_id", row.id)
          .order("sort_order")
          .then((r) => r.data ?? []),
        supabase
          .from("project_metrics")
          .select("*")
          .eq("project_id", row.id)
          .order("sort_order")
          .then((r) => r.data ?? []),
        supabase
          .from("project_credits")
          .select("*")
          .eq("project_id", row.id)
          .order("sort_order")
          .then((r) => r.data ?? []),
        supabase
          .from("project_overview")
          .select("*")
          .eq("project_id", row.id)
          .order("sort_order")
          .then((r) => r.data ?? []),
        supabase
          .from("project_related")
          .select("related_project_id")
          .eq("project_id", row.id)
          .order("sort_order")
          .then((r) => (r.data ?? []).map((x: { related_project_id: string }) => x.related_project_id)),
      ]);

    return {
      ...row,
      sections,
      gallery,
      metrics,
      credits,
      overview,
      related_ids: related,
    } as ProjectFullDb;
  },
  ["projects"],
  { revalidate: 60, tags: ["projects"] }
);

export const getRelatedProjects = unstable_cache(
  async (ids: string[]): Promise<ProjectSummaryDb[]> => {
    if (!ids.length) return [];
    const { data, error } = await supabase
      .from("projects")
      .select(SUMMARY_COLS)
      .in("id", ids)
      .eq("published", true);
    if (error) throw error;
    return data as ProjectSummaryDb[];
  },
  ["projects"],
  { revalidate: 60, tags: ["projects"] }
);

// ─── Mapper: DB types → legacy catalog types ─────────────────────────────────

export function dbSummaryToLegacy(db: ProjectSummaryDb): ProjectSummary {
  return {
    id: db.slug,
    title: db.title,
    tags: db.tags,
    image: db.cover_image_url,
    aspectRatio: db.aspect_ratio,
  };
}

export function dbFullToLegacy(db: ProjectFullDb): ProjectDetail {
  return {
    // ProjectSummary base
    id: db.slug,
    title: db.title,
    tags: db.tags,
    image: db.cover_image_url,
    aspectRatio: db.aspect_ratio,
    // Detail fields
    heroLabel: db.hero_label,
    heroTitle: db.hero_title,
    heroSubtitle: db.hero_subtitle,
    heroSummary: db.hero_summary,
    introMeta: {
      launchLabel: db.launch_label,
      type: db.project_type,
      client: db.client,
      deliverables: db.deliverables,
    },
    overview: db.overview.map((f) => ({ label: f.label, value: f.value })) as LegacyFact[],
    intro: db.intro,
    primaryShowcase: {
      src: db.showcase_image_url,
      alt: db.showcase_alt,
      label: db.showcase_label,
    } as LegacyGallery,
    feature: {
      eyebrow: db.feature_eyebrow,
      title: db.feature_title,
      body: db.feature_body,
    },
    sections: db.sections.map((s) => ({
      eyebrow: s.eyebrow,
      title: s.title,
      body: s.body,
      image: s.image_url,
      imageAlt: s.image_alt,
      imageLayout: s.image_layout,
      tone: s.tone,
    })) as LegacySection[],
    impactMetrics: db.metrics.map((m) => ({ label: m.label, value: m.value })) as LegacyFact[],
    gallery: db.gallery.map((g) => ({
      src: g.image_url,
      alt: g.image_alt,
      label: g.image_label,
    })) as LegacyGallery[],
    credits: db.credits.map((c) => ({ label: c.label, value: c.value })) as LegacyFact[],
    relatedIds: db.related_ids,
  };
}
```

- [ ] **Step 2: Verify type-check passes**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
npx tsc --noEmit 2>&1 | head -40
```

Expected: No errors referencing `project-data.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/project-data.ts
git commit -m "feat: add project-data.ts with DB types, cached fetchers, and mapper"
```

---

## Task 3: Seed Script

**Files:**
- Create: `scripts/seed-projects.ts`

- [ ] **Step 1: Write the seed script**

```ts
// scripts/seed-projects.ts
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import { projects, getProjectDetail } from "../src/lib/project-catalog";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function main() {
  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) > 0) {
    console.log("projects table is non-empty — skipping seed.");
    return;
  }

  for (let i = 0; i < projects.length; i++) {
    const summary = projects[i];
    const detail = getProjectDetail(summary.id)!;
    const slug = toSlug(summary.title);

    const { data: row, error: rowErr } = await supabase
      .from("projects")
      .insert({
        slug,
        title: summary.title,
        tags: summary.tags,
        aspect_ratio: summary.aspectRatio,
        cover_image_url: summary.image,
        published: true,
        sort_order: i,
        hero_label: detail.heroLabel,
        hero_title: detail.heroTitle,
        hero_subtitle: detail.heroSubtitle,
        hero_summary: detail.heroSummary,
        hero_image_url: summary.image,
        client: detail.introMeta.client,
        project_type: detail.introMeta.type,
        deliverables: detail.introMeta.deliverables,
        launch_label: detail.introMeta.launchLabel,
        launch_url: "",
        intro: detail.intro,
        showcase_image_url: detail.primaryShowcase.src,
        showcase_alt: detail.primaryShowcase.alt,
        showcase_label: detail.primaryShowcase.label,
        feature_eyebrow: detail.feature.eyebrow,
        feature_title: detail.feature.title,
        feature_body: detail.feature.body,
      })
      .select("id")
      .single();

    if (rowErr || !row) {
      console.error(`Failed to insert project "${summary.title}":`, rowErr);
      continue;
    }

    const projectId = row.id;

    // Sections
    if (detail.sections.length) {
      await supabase.from("project_sections").insert(
        detail.sections.map((s, idx) => ({
          project_id: projectId,
          eyebrow: s.eyebrow,
          title: s.title,
          body: s.body,
          image_url: s.image,
          image_alt: s.imageAlt,
          image_layout: s.imageLayout,
          tone: s.tone ?? "light",
          sort_order: idx,
        }))
      );
    }

    // Gallery
    if (detail.gallery.length) {
      await supabase.from("project_gallery").insert(
        detail.gallery.map((g, idx) => ({
          project_id: projectId,
          image_url: g.src,
          image_alt: g.alt,
          image_label: g.label,
          sort_order: idx,
        }))
      );
    }

    // Metrics
    if (detail.impactMetrics.length) {
      await supabase.from("project_metrics").insert(
        detail.impactMetrics.map((m, idx) => ({
          project_id: projectId,
          label: m.label,
          value: m.value,
          sort_order: idx,
        }))
      );
    }

    // Credits
    if (detail.credits.length) {
      await supabase.from("project_credits").insert(
        detail.credits.map((c, idx) => ({
          project_id: projectId,
          label: c.label,
          value: c.value,
          sort_order: idx,
        }))
      );
    }

    // Overview
    if (detail.overview.length) {
      await supabase.from("project_overview").insert(
        detail.overview.map((o, idx) => ({
          project_id: projectId,
          label: o.label,
          value: o.value,
          sort_order: idx,
        }))
      );
    }

    console.log(`✓ Seeded: ${summary.title}`);
  }

  // Second pass: wire up related projects by slug
  for (const summary of projects) {
    const detail = getProjectDetail(summary.id)!;
    if (!detail.relatedIds.length) continue;

    const { data: srcRow } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", toSlug(summary.title))
      .single();
    if (!srcRow) continue;

    for (let idx = 0; idx < detail.relatedIds.length; idx++) {
      const relSummary = projects.find((p) => p.id === detail.relatedIds[idx]);
      if (!relSummary) continue;
      const { data: relRow } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", toSlug(relSummary.title))
        .single();
      if (!relRow) continue;

      await supabase.from("project_related").insert({
        project_id: srcRow.id,
        related_project_id: relRow.id,
        sort_order: idx,
      });
    }
  }

  console.log("Seed complete.");
}

main().catch(console.error);
```

- [ ] **Step 2: Run the seed script**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
npx tsx scripts/seed-projects.ts
```

Expected: 23 `✓ Seeded:` lines followed by "Seed complete."

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-projects.ts
git commit -m "feat: add seed-projects.ts to migrate static catalog to Supabase"
```

---

## Task 4: Server Actions

**Files:**
- Create: `src/app/(admin)/admin/projects/actions.ts`

- [ ] **Step 1: Write the actions file**

```ts
// src/app/(admin)/admin/projects/actions.ts
"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
import type {
  ProjectSummaryDb,
  ProjectFullDb,
  ProjectSectionDb,
  ProjectGalleryDb,
  ProjectFactDb,
  ProjectInput,
  ProjectFullInput,
} from "@/lib/project-data";

export type { ProjectSummaryDb, ProjectFullDb, ProjectInput, ProjectFullInput };

const SUMMARY_COLS =
  "id, slug, title, tags, aspect_ratio, cover_image_url, published, sort_order";

export async function listProjects(): Promise<ProjectSummaryDb[]> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("projects")
    .select(SUMMARY_COLS)
    .order("sort_order");
  if (error) throw error;
  return data as ProjectSummaryDb[];
}

export async function getProject(id: string): Promise<ProjectFullDb> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: row, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !row) throw new Error("Project not found");

  const [sections, gallery, metrics, credits, overview, related] =
    await Promise.all([
      supabase
        .from("project_sections")
        .select("*")
        .eq("project_id", id)
        .order("sort_order")
        .then((r) => (r.data ?? []) as ProjectSectionDb[]),
      supabase
        .from("project_gallery")
        .select("*")
        .eq("project_id", id)
        .order("sort_order")
        .then((r) => (r.data ?? []) as ProjectGalleryDb[]),
      supabase
        .from("project_metrics")
        .select("*")
        .eq("project_id", id)
        .order("sort_order")
        .then((r) => (r.data ?? []) as ProjectFactDb[]),
      supabase
        .from("project_credits")
        .select("*")
        .eq("project_id", id)
        .order("sort_order")
        .then((r) => (r.data ?? []) as ProjectFactDb[]),
      supabase
        .from("project_overview")
        .select("*")
        .eq("project_id", id)
        .order("sort_order")
        .then((r) => (r.data ?? []) as ProjectFactDb[]),
      supabase
        .from("project_related")
        .select("related_project_id")
        .eq("project_id", id)
        .order("sort_order")
        .then((r) =>
          (r.data ?? []).map(
            (x: { related_project_id: string }) => x.related_project_id
          )
        ),
    ]);

  return {
    ...row,
    sections,
    gallery,
    metrics,
    credits,
    overview,
    related_ids: related,
  } as ProjectFullDb;
}

export async function createProject(
  input: ProjectInput
): Promise<ProjectSummaryDb> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: maxRow } = await supabase
    .from("projects")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...input, sort_order })
    .select(SUMMARY_COLS)
    .single();
  if (error) throw error;
  revalidateTag("projects", "max");
  return data as ProjectSummaryDb;
}

export async function updateProject(
  id: string,
  input: ProjectFullInput
): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error: mainErr } = await supabase
    .from("projects")
    .update({
      title: input.title,
      slug: input.slug,
      tags: input.tags,
      aspect_ratio: input.aspect_ratio,
      cover_image_url: input.cover_image_url,
      published: input.published,
      hero_label: input.hero_label,
      hero_title: input.hero_title,
      hero_subtitle: input.hero_subtitle,
      hero_summary: input.hero_summary,
      hero_image_url: input.hero_image_url,
      client: input.client,
      project_type: input.project_type,
      deliverables: input.deliverables,
      launch_label: input.launch_label,
      launch_url: input.launch_url,
      intro: input.intro,
      showcase_image_url: input.showcase_image_url,
      showcase_alt: input.showcase_alt,
      showcase_label: input.showcase_label,
      feature_eyebrow: input.feature_eyebrow,
      feature_title: input.feature_title,
      feature_body: input.feature_body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (mainErr) throw mainErr;

  // Delete all child records then reinsert
  await Promise.all([
    (async () => {
      const { error } = await supabase
        .from("project_sections")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
      if (input.sections.length) {
        const { error: e } = await supabase.from("project_sections").insert(
          input.sections.map((s, i) => ({ ...s, project_id: id, sort_order: i }))
        );
        if (e) throw e;
      }
    })(),
    (async () => {
      const { error } = await supabase
        .from("project_gallery")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
      if (input.gallery.length) {
        const { error: e } = await supabase.from("project_gallery").insert(
          input.gallery.map((g, i) => ({ ...g, project_id: id, sort_order: i }))
        );
        if (e) throw e;
      }
    })(),
    (async () => {
      const { error } = await supabase
        .from("project_metrics")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
      if (input.metrics.length) {
        const { error: e } = await supabase.from("project_metrics").insert(
          input.metrics.map((m, i) => ({ ...m, project_id: id, sort_order: i }))
        );
        if (e) throw e;
      }
    })(),
    (async () => {
      const { error } = await supabase
        .from("project_credits")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
      if (input.credits.length) {
        const { error: e } = await supabase.from("project_credits").insert(
          input.credits.map((c, i) => ({ ...c, project_id: id, sort_order: i }))
        );
        if (e) throw e;
      }
    })(),
    (async () => {
      const { error } = await supabase
        .from("project_overview")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
      if (input.overview.length) {
        const { error: e } = await supabase.from("project_overview").insert(
          input.overview.map((o, i) => ({ ...o, project_id: id, sort_order: i }))
        );
        if (e) throw e;
      }
    })(),
    (async () => {
      const { error } = await supabase
        .from("project_related")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
      if (input.related_ids.length) {
        const { error: e } = await supabase.from("project_related").insert(
          input.related_ids.map((rid, i) => ({
            project_id: id,
            related_project_id: rid,
            sort_order: i,
          }))
        );
        if (e) throw e;
      }
    })(),
  ]);

  revalidateTag("projects", "max");
}

export async function deleteProject(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
  revalidateTag("projects", "max");
}

export async function reorderProjects(orderedIds: string[]): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  await Promise.all(
    orderedIds.map(async (id, index) => {
      const { error } = await supabase
        .from("projects")
        .update({ sort_order: index })
        .eq("id", id);
      if (error) throw error;
    })
  );
  revalidateTag("projects", "max");
}

export async function togglePublished(
  id: string,
  published: boolean
): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase
    .from("projects")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidateTag("projects", "max");
}
```

- [ ] **Step 2: Verify type-check**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
npx tsc --noEmit 2>&1 | head -40
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(admin\)/admin/projects/actions.ts
git commit -m "feat: add projects admin server actions (8 actions)"
```

---

## Task 5: Admin List Page

**Files:**
- Replace: `src/app/(admin)/admin/projects/page.tsx`
- Create: `src/app/(admin)/admin/projects/ProjectsList.tsx`

- [ ] **Step 1: Write the list page server component**

```tsx
// src/app/(admin)/admin/projects/page.tsx
import Link from "next/link";
import { listProjects } from "./actions";
import ProjectsList from "./ProjectsList";

export default async function AdminProjectsPage() {
  const projects = await listProjects();
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[hsl(var(--admin-text))]">
          Projects
        </h1>
        <Link
          href="/admin/projects/new"
          className="rounded-lg bg-[hsl(var(--admin-accent))] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + New
        </Link>
      </div>
      <ProjectsList initialProjects={projects} />
    </div>
  );
}
```

- [ ] **Step 2: Write the DnD list client component**

```tsx
// src/app/(admin)/admin/projects/ProjectsList.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
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
import {
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
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
import {
  deleteProject,
  reorderProjects,
  togglePublished,
  type ProjectSummaryDb,
} from "./actions";

function SortableRow({
  project,
  onDelete,
  onToggle,
}: {
  project: ProjectSummaryDb;
  onDelete: (p: ProjectSummaryDb) => void;
  onToggle: (p: ProjectSummaryDb) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
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

      {project.cover_image_url ? (
        <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded">
          <Image
            src={project.cover_image_url}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-10 w-14 flex-shrink-0 rounded bg-[hsl(var(--admin-bg))]" />
      )}

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-[hsl(var(--admin-text))]">
          {project.title}
        </p>
        <p className="truncate text-xs text-[hsl(var(--admin-text-muted))]">
          {project.tags[0] ?? ""} · /{project.slug}
        </p>
      </div>

      <button
        onClick={() => onToggle(project)}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-[hsl(var(--admin-text))]"
        aria-label={project.published ? "Unpublish" : "Publish"}
        title={project.published ? "Published — click to unpublish" : "Draft — click to publish"}
      >
        {project.published ? (
          <Eye className="h-4 w-4 text-green-500" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>

      <Link
        href={`/admin/projects/${project.id}`}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-[hsl(var(--admin-text))]"
        aria-label="Edit project"
      >
        <Pencil className="h-4 w-4" />
      </Link>

      <button
        onClick={() => onDelete(project)}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-red-500"
        aria-label="Delete project"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ProjectsList({
  initialProjects,
}: {
  initialProjects: ProjectSummaryDb[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [deletingProject, setDeletingProject] = useState<ProjectSummaryDb | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, startDeleteTransition] = useTransition();
  const [, startReorderTransition] = useTransition();
  const [, startToggleTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(projects, oldIndex, newIndex);
    setProjects(reordered);
    startReorderTransition(() => reorderProjects(reordered.map((p) => p.id)));
  }

  function handleToggle(project: ProjectSummaryDb) {
    const next = !project.published;
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, published: next } : p))
    );
    startToggleTransition(() => togglePublished(project.id, next));
  }

  function confirmDelete(project: ProjectSummaryDb) {
    setDeleteError("");
    startDeleteTransition(async () => {
      try {
        await deleteProject(project.id);
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        setDeletingProject(null);
      } catch {
        setDeleteError("Delete failed. Please try again.");
      }
    });
  }

  return (
    <div>
      {projects.length === 0 ? (
        <p className="py-16 text-center text-sm text-[hsl(var(--admin-text-muted))]">
          No projects yet. Click + New to create the first one.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projects.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {projects.map((project) => (
                <SortableRow
                  key={project.id}
                  project={project}
                  onDelete={setDeletingProject}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {deletingProject && (
        <AlertDialog
          open
          onOpenChange={() => {
            setDeletingProject(null);
            setDeleteError("");
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete project?</AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{deletingProject.title}&rdquo; will be permanently removed along with all its content. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError && (
              <p className="px-1 text-sm text-red-600">{deleteError}</p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmDelete(deletingProject)}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
npm run build 2>&1 | tail -20
```

Expected: Build succeeds (admin/projects route compiles).

- [ ] **Step 4: Commit**

```bash
git add src/app/\(admin\)/admin/projects/page.tsx src/app/\(admin\)/admin/projects/ProjectsList.tsx
git commit -m "feat: add admin projects list page with DnD reorder, publish toggle, delete"
```

---

## Task 6: ImageField Component

**Files:**
- Create: `src/components/admin/ImageField.tsx`

- [ ] **Step 1: Write the component**

This component renders either an AssetPicker or a URL text input, with a toggle link to switch between them.

```tsx
// src/components/admin/ImageField.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AssetPicker from "@/components/admin/AssetPicker";

interface ImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageField({ value, onChange, label }: ImageFieldProps) {
  const [mode, setMode] = useState<"picker" | "url">("picker");
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      {mode === "picker" ? (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerOpen(true)}
          >
            {value ? "Change image" : "Pick from media library"}
          </Button>
          {value && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={label ?? "Selected"}
              className="h-12 w-20 rounded object-cover border border-[hsl(var(--admin-border))]"
            />
          )}
        </div>
      ) : (
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      )}

      <button
        type="button"
        onClick={() => setMode((m) => (m === "picker" ? "url" : "picker"))}
        className="text-xs text-[hsl(var(--admin-text-muted))] underline hover:text-[hsl(var(--admin-text))]"
      >
        {mode === "picker" ? "Use URL instead" : "Use media library"}
      </button>

      <AssetPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(asset) => {
          onChange(asset.public_url);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ImageField.tsx
git commit -m "feat: add ImageField component (AssetPicker + URL fallback toggle)"
```

---

## Task 7: New Project Page

**Files:**
- Create: `src/app/(admin)/admin/projects/new/page.tsx`

- [ ] **Step 1: Write the new project page**

```tsx
// src/app/(admin)/admin/projects/new/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createProject } from "../actions";

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(toSlug(value));
  }

  function handleSlugChange(value: string) {
    setSlug(toSlug(value));
    setSlugEdited(true);
  }

  function handleCreate() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const project = await createProject({
          title: title.trim(),
          slug: slug.trim(),
        });
        router.push(`/admin/projects/${project.id}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create.";
        setError(msg.includes("duplicate") ? "That slug is already taken." : msg);
      }
    });
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/projects"
          className="text-sm text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
        >
          ← Projects
        </Link>
        <h1 className="text-2xl font-semibold text-[hsl(var(--admin-text))]">
          New Project
        </h1>
      </div>

      <div className="space-y-5 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-6">
        <div className="space-y-1">
          <Label htmlFor="new-title">Title *</Label>
          <Input
            id="new-title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Google - Gemini Developer Competition"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="new-slug">Slug *</Label>
          <Input
            id="new-slug"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="google-gemini-developer-competition"
            disabled={isPending}
          />
          <p className="text-xs text-[hsl(var(--admin-text-muted))]">
            URL: /projects/{slug || "…"}
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button onClick={handleCreate} disabled={isPending || !title.trim()}>
            {isPending ? "Creating…" : "Create & edit"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/projects">Cancel</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
npm run build 2>&1 | tail -10
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(admin\)/admin/projects/new/page.tsx
git commit -m "feat: add new project creation page with slug auto-derive"
```

---

## Task 8: Project Editor — Scaffold and Scalar Fields

**Files:**
- Create: `src/app/(admin)/admin/projects/[id]/page.tsx`
- Create: `src/app/(admin)/admin/projects/[id]/ProjectEditor.tsx`

The editor handles scalar fields (Basic Info, Hero, Overview Bar, Intro, Showcase, Feature). Child DnD lists are added in Task 9.

- [ ] **Step 1: Write the edit page server component**

```tsx
// src/app/(admin)/admin/projects/[id]/page.tsx
import { notFound } from "next/navigation";
import { getProject, listProjects } from "../actions";
import ProjectEditor from "./ProjectEditor";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProjectEditPage({ params }: Props) {
  const { id } = await params;
  const [project, allProjects] = await Promise.all([
    getProject(id).catch(() => null),
    listProjects(),
  ]);

  if (!project) notFound();

  return (
    <ProjectEditor
      project={project}
      allProjects={allProjects}
    />
  );
}
```

- [ ] **Step 2: Write ProjectEditor.tsx (scalar fields only)**

```tsx
// src/app/(admin)/admin/projects/[id]/ProjectEditor.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ImageField from "@/components/admin/ImageField";
import { updateProject } from "../actions";
import type { ProjectFullDb, ProjectSummaryDb, ProjectFullInput } from "@/lib/project-data";

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-6 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

interface Props {
  project: ProjectFullDb;
  allProjects: ProjectSummaryDb[];
}

export default function ProjectEditor({ project, allProjects }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState("");

  // Basic Info
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [slugEdited, setSlugEdited] = useState(true);
  const [tagsRaw, setTagsRaw] = useState(project.tags.join(", "));
  const [aspectRatio, setAspectRatio] = useState(project.aspect_ratio);
  const [coverImageUrl, setCoverImageUrl] = useState(project.cover_image_url);
  const [published, setPublished] = useState(project.published);

  // Hero
  const [heroLabel, setHeroLabel] = useState(project.hero_label);
  const [heroTitle, setHeroTitle] = useState(project.hero_title);
  const [heroSubtitle, setHeroSubtitle] = useState(project.hero_subtitle);
  const [heroSummary, setHeroSummary] = useState(project.hero_summary);
  const [heroImageUrl, setHeroImageUrl] = useState(project.hero_image_url);

  // Overview Bar
  const [client, setClient] = useState(project.client);
  const [projectType, setProjectType] = useState(project.project_type);
  const [deliverables, setDeliverables] = useState(project.deliverables);
  const [launchLabel, setLaunchLabel] = useState(project.launch_label);
  const [launchUrl, setLaunchUrl] = useState(project.launch_url);

  // Intro
  const [introRaw, setIntroRaw] = useState(project.intro.join("\n\n"));

  // Showcase
  const [showcaseImageUrl, setShowcaseImageUrl] = useState(project.showcase_image_url);
  const [showcaseAlt, setShowcaseAlt] = useState(project.showcase_alt);
  const [showcaseLabel, setShowcaseLabel] = useState(project.showcase_label);

  // Feature
  const [featureEyebrow, setFeatureEyebrow] = useState(project.feature_eyebrow);
  const [featureTitle, setFeatureTitle] = useState(project.feature_title);
  const [featureBody, setFeatureBody] = useState(project.feature_body);

  // Child lists (managed in Task 9, stored as-is for now)
  const [sections, setSections] = useState(project.sections);
  const [gallery, setGallery] = useState(project.gallery);
  const [metrics, setMetrics] = useState(project.metrics);
  const [credits, setCredits] = useState(project.credits);
  const [overview, setOverview] = useState(project.overview);
  const [relatedIds, setRelatedIds] = useState(project.related_ids);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(toSlug(value));
  }

  function handleSave() {
    if (!title.trim()) {
      setSaveError("Title is required.");
      return;
    }
    setSaveError("");
    const input: ProjectFullInput = {
      title: title.trim(),
      slug: slug.trim(),
      tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      aspect_ratio: aspectRatio,
      cover_image_url: coverImageUrl,
      published,
      hero_label: heroLabel,
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      hero_summary: heroSummary,
      hero_image_url: heroImageUrl,
      client,
      project_type: projectType,
      deliverables,
      launch_label: launchLabel,
      launch_url: launchUrl,
      intro: introRaw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
      showcase_image_url: showcaseImageUrl,
      showcase_alt: showcaseAlt,
      showcase_label: showcaseLabel,
      feature_eyebrow: featureEyebrow,
      feature_title: featureTitle,
      feature_body: featureBody,
      sections: sections.map(({ eyebrow, title: st, body, image_url, image_alt, image_layout, tone }) => ({
        eyebrow, title: st, body, image_url, image_alt, image_layout, tone,
      })),
      gallery: gallery.map(({ image_url, image_alt, image_label }) => ({ image_url, image_alt, image_label })),
      metrics: metrics.map(({ label, value }) => ({ label, value })),
      credits: credits.map(({ label, value }) => ({ label, value })),
      overview: overview.map(({ label, value }) => ({ label, value })),
      related_ids: relatedIds,
    };

    startTransition(async () => {
      try {
        await updateProject(project.id, input);
        router.refresh();
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Save failed.");
      }
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-8 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/projects"
            className="text-sm text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
          >
            ← Projects
          </Link>
          <h1 className="text-lg font-semibold text-[hsl(var(--admin-text))] truncate max-w-sm">
            {title || "Untitled"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {saveError && (
            <p className="text-sm text-red-600">{saveError}</p>
          )}
          <Button onClick={handleSave} disabled={isPending || !title.trim()}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-3xl">
        {/* 1. Basic Info */}
        <Section title="Basic Info">
          <Field label="Title *">
            <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} />
          </Field>
          <Field label="Slug *">
            <Input
              value={slug}
              onChange={(e) => { setSlug(toSlug(e.target.value)); setSlugEdited(true); }}
            />
            <p className="text-xs text-[hsl(var(--admin-text-muted))]">/projects/{slug || "…"}</p>
          </Field>
          <Field label="Tags (comma-separated)">
            <Input
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="Experiences, Branding"
            />
          </Field>
          <Field label="Aspect Ratio">
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as "portrait" | "landscape" | "square")}
              className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm"
            >
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
              <option value="square">Square</option>
            </select>
          </Field>
          <Field label="Cover Image">
            <ImageField value={coverImageUrl} onChange={setCoverImageUrl} label="Cover" />
          </Field>
          <div className="flex items-center gap-3">
            <input
              id="published"
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="published">Published (visible on public site)</Label>
          </div>
        </Section>

        {/* 2. Hero */}
        <Section title="Hero">
          <Field label="Label (eyebrow)">
            <Input value={heroLabel} onChange={(e) => setHeroLabel(e.target.value)} placeholder="Case Study" />
          </Field>
          <Field label="Hero Title">
            <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
          </Field>
          <Field label="Hero Subtitle">
            <Input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
          </Field>
          <Field label="Hero Summary">
            <Textarea value={heroSummary} onChange={(e) => setHeroSummary(e.target.value)} rows={3} />
          </Field>
          <Field label="Hero Image">
            <ImageField value={heroImageUrl} onChange={setHeroImageUrl} label="Hero" />
          </Field>
        </Section>

        {/* 3. Overview Bar */}
        <Section title="Overview Bar">
          <Field label="Client">
            <Input value={client} onChange={(e) => setClient(e.target.value)} />
          </Field>
          <Field label="Project Type">
            <Input value={projectType} onChange={(e) => setProjectType(e.target.value)} placeholder="Experiences, Branding" />
          </Field>
          <Field label="Deliverables">
            <Input value={deliverables} onChange={(e) => setDeliverables(e.target.value)} />
          </Field>
          <Field label="Launch Label">
            <Input value={launchLabel} onChange={(e) => setLaunchLabel(e.target.value)} placeholder="Launch project" />
          </Field>
          <Field label="Launch URL">
            <Input value={launchUrl} onChange={(e) => setLaunchUrl(e.target.value)} placeholder="https://…" />
          </Field>
        </Section>

        {/* 4. Intro Paragraphs */}
        <Section title="Intro Paragraphs">
          <p className="text-xs text-[hsl(var(--admin-text-muted))]">
            Separate paragraphs with a blank line.
          </p>
          <Textarea
            value={introRaw}
            onChange={(e) => setIntroRaw(e.target.value)}
            rows={8}
            placeholder={"First paragraph.\n\nSecond paragraph."}
          />
        </Section>

        {/* 5. Primary Showcase */}
        <Section title="Primary Showcase">
          <Field label="Image">
            <ImageField value={showcaseImageUrl} onChange={setShowcaseImageUrl} label="Showcase" />
          </Field>
          <Field label="Alt Text">
            <Input value={showcaseAlt} onChange={(e) => setShowcaseAlt(e.target.value)} />
          </Field>
          <Field label="Label">
            <Input value={showcaseLabel} onChange={(e) => setShowcaseLabel(e.target.value)} placeholder="Primary showcase" />
          </Field>
        </Section>

        {/* 6. Feature Block */}
        <Section title="Feature Block">
          <Field label="Eyebrow">
            <Input value={featureEyebrow} onChange={(e) => setFeatureEyebrow(e.target.value)} placeholder="Experience frame" />
          </Field>
          <Field label="Title">
            <Input value={featureTitle} onChange={(e) => setFeatureTitle(e.target.value)} />
          </Field>
          <Field label="Body">
            <Textarea value={featureBody} onChange={(e) => setFeatureBody(e.target.value)} rows={3} />
          </Field>
        </Section>

        {/* Placeholder sections — filled in Task 9 */}
        <Section title="Story Sections">
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">
            {sections.length} section{sections.length !== 1 ? "s" : ""} — editing coming in next task.
          </p>
        </Section>

        <Section title="Gallery">
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">
            {gallery.length} image{gallery.length !== 1 ? "s" : ""} — editing coming in next task.
          </p>
        </Section>

        <Section title="Impact Metrics">
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">
            {metrics.length} metric{metrics.length !== 1 ? "s" : ""} — editing coming in next task.
          </p>
        </Section>

        <Section title="Credits">
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">
            {credits.length} credit{credits.length !== 1 ? "s" : ""} — editing coming in next task.
          </p>
        </Section>

        <Section title="Overview Facts">
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">
            {overview.length} fact{overview.length !== 1 ? "s" : ""} — editing coming in next task.
          </p>
        </Section>

        <Section title="Related Projects">
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">
            {relatedIds.length} related — editing coming in next task.
          </p>
        </Section>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
npm run build 2>&1 | tail -20
```

Expected: Build succeeds. The admin/projects/[id] route compiles.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(admin\)/admin/projects/\[id\]/page.tsx \
        src/app/\(admin\)/admin/projects/\[id\]/ProjectEditor.tsx
git commit -m "feat: add project editor shell with scalar field sections"
```

---

## Task 9: Project Editor — DnD Child List Editors

**Files:**
- Modify: `src/app/(admin)/admin/projects/[id]/ProjectEditor.tsx`

Replace the placeholder sections with real DnD list editors for Story Sections, Gallery, Metrics, Credits, and Overview Facts.

- [ ] **Step 1: Add helper components and child editors to ProjectEditor.tsx**

Replace the entire file with the following (includes everything from Task 8 plus DnD child editors):

```tsx
// src/app/(admin)/admin/projects/[id]/ProjectEditor.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageField from "@/components/admin/ImageField";
import { updateProject } from "../actions";
import type {
  ProjectFullDb,
  ProjectSummaryDb,
  ProjectFullInput,
  ProjectSectionDb,
  ProjectGalleryDb,
  ProjectFactDb,
} from "@/lib/project-data";

// ─── Editor item types (add _id for stable DnD keys) ─────────────────────────

interface EditorSection extends ProjectSectionDb { _id: string }
interface EditorGallery extends ProjectGalleryDb { _id: string }
interface EditorFact extends ProjectFactDb { _id: string }

function factId(): string {
  return typeof crypto !== "undefined" ? crypto.randomUUID() : String(Math.random());
}

function toSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-6 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

// ─── Generic sortable row ─────────────────────────────────────────────────────

function SortableChildRow({
  id,
  label,
  onEdit,
  onDelete,
}: {
  id: string;
  label: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-3 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-[hsl(var(--admin-text-muted))]"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 truncate text-sm text-[hsl(var(--admin-text))]">{label}</span>
      <button onClick={onEdit} className="rounded p-1 hover:bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text-muted))]" aria-label="Edit">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button onClick={onDelete} className="rounded p-1 hover:bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text-muted))] hover:text-red-500" aria-label="Delete">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Fact editor (label + value rows, shared by metrics/credits/overview) ────

function FactListEditor({
  items,
  onChange,
}: {
  items: EditorFact[];
  onChange: (items: EditorFact[]) => void;
}) {
  const [editingItem, setEditingItem] = useState<EditorFact | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editValue, setEditValue] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldI = items.findIndex((i) => i._id === active.id);
    const newI = items.findIndex((i) => i._id === over.id);
    onChange(arrayMove(items, oldI, newI));
  }

  function openAdd() {
    setEditLabel("");
    setEditValue("");
    setEditingItem({ _id: factId(), id: "", project_id: "", label: "", value: "", sort_order: 0 });
  }

  function openEdit(item: EditorFact) {
    setEditLabel(item.label);
    setEditValue(item.value);
    setEditingItem(item);
  }

  function handleSave() {
    if (!editingItem) return;
    const updated = { ...editingItem, label: editLabel.trim(), value: editValue.trim() };
    if (items.find((i) => i._id === editingItem._id)) {
      onChange(items.map((i) => (i._id === editingItem._id ? updated : i)));
    } else {
      onChange([...items, updated]);
    }
    setEditingItem(null);
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableChildRow
              key={item._id}
              id={item._id}
              label={`${item.label}: ${item.value}`}
              onEdit={() => openEdit(item)}
              onDelete={() => onChange(items.filter((i) => i._id !== item._id))}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" size="sm" onClick={openAdd}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Add row
      </Button>

      {editingItem && (
        <Dialog open onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{items.find((i) => i._id === editingItem._id) ? "Edit" : "Add"} row</DialogTitle>
              <DialogDescription className="sr-only">Edit label and value</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Field label="Label">
                <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Client" />
              </Field>
              <Field label="Value">
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder="Google" />
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Gallery editor ───────────────────────────────────────────────────────────

function GalleryEditor({
  items,
  onChange,
}: {
  items: EditorGallery[];
  onChange: (items: EditorGallery[]) => void;
}) {
  const [editingItem, setEditingItem] = useState<EditorGallery | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [editLabel, setEditLabel] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldI = items.findIndex((i) => i._id === active.id);
    const newI = items.findIndex((i) => i._id === over.id);
    onChange(arrayMove(items, oldI, newI));
  }

  function openAdd() {
    const blank: EditorGallery = { _id: factId(), id: "", project_id: "", image_url: "", image_alt: "", image_label: "", sort_order: 0 };
    setEditUrl(""); setEditAlt(""); setEditLabel("");
    setEditingItem(blank);
  }

  function openEdit(item: EditorGallery) {
    setEditUrl(item.image_url);
    setEditAlt(item.image_alt);
    setEditLabel(item.image_label);
    setEditingItem(item);
  }

  function handleSave() {
    if (!editingItem) return;
    const updated = { ...editingItem, image_url: editUrl, image_alt: editAlt, image_label: editLabel };
    if (items.find((i) => i._id === editingItem._id)) {
      onChange(items.map((i) => (i._id === editingItem._id ? updated : i)));
    } else {
      onChange([...items, updated]);
    }
    setEditingItem(null);
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableChildRow
              key={item._id}
              id={item._id}
              label={item.image_label || item.image_alt || item.image_url || "(no label)"}
              onEdit={() => openEdit(item)}
              onDelete={() => onChange(items.filter((i) => i._id !== item._id))}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" size="sm" onClick={openAdd}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Add image
      </Button>

      {editingItem && (
        <Dialog open onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{items.find((i) => i._id === editingItem._id) ? "Edit" : "Add"} gallery image</DialogTitle>
              <DialogDescription className="sr-only">Edit gallery image fields</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Field label="Image">
                <ImageField value={editUrl} onChange={setEditUrl} label="Gallery" />
              </Field>
              <Field label="Alt text">
                <Input value={editAlt} onChange={(e) => setEditAlt(e.target.value)} />
              </Field>
              <Field label="Label">
                <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Frame 01" />
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Section editor ───────────────────────────────────────────────────────────

function SectionListEditor({
  items,
  onChange,
}: {
  items: EditorSection[];
  onChange: (items: EditorSection[]) => void;
}) {
  const [editingItem, setEditingItem] = useState<EditorSection | null>(null);
  const [form, setForm] = useState<Omit<EditorSection, "_id" | "id" | "project_id" | "sort_order">>({
    eyebrow: "", title: "", body: [], image_url: "", image_alt: "", image_layout: "right", tone: "light",
  });
  const [bodyRaw, setBodyRaw] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldI = items.findIndex((i) => i._id === active.id);
    const newI = items.findIndex((i) => i._id === over.id);
    onChange(arrayMove(items, oldI, newI));
  }

  function openAdd() {
    const blank: EditorSection = { _id: factId(), id: "", project_id: "", eyebrow: "", title: "", body: [], image_url: "", image_alt: "", image_layout: "right", tone: "light", sort_order: 0 };
    setForm({ eyebrow: "", title: "", body: [], image_url: "", image_alt: "", image_layout: "right", tone: "light" });
    setBodyRaw("");
    setEditingItem(blank);
  }

  function openEdit(item: EditorSection) {
    setForm({ eyebrow: item.eyebrow, title: item.title, body: item.body, image_url: item.image_url, image_alt: item.image_alt, image_layout: item.image_layout, tone: item.tone });
    setBodyRaw(item.body.join("\n\n"));
    setEditingItem(item);
  }

  function handleSave() {
    if (!editingItem) return;
    const updated: EditorSection = {
      ...editingItem,
      ...form,
      body: bodyRaw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    };
    if (items.find((i) => i._id === editingItem._id)) {
      onChange(items.map((i) => (i._id === editingItem._id ? updated : i)));
    } else {
      onChange([...items, updated]);
    }
    setEditingItem(null);
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableChildRow
              key={item._id}
              id={item._id}
              label={`${item.eyebrow ? item.eyebrow + " — " : ""}${item.title || "(untitled)"}`}
              onEdit={() => openEdit(item)}
              onDelete={() => onChange(items.filter((i) => i._id !== item._id))}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" size="sm" onClick={openAdd}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Add section
      </Button>

      {editingItem && (
        <Dialog open onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{items.find((i) => i._id === editingItem._id) ? "Edit" : "Add"} story section</DialogTitle>
              <DialogDescription className="sr-only">Edit section fields</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Field label="Eyebrow">
                <Input value={form.eyebrow} onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))} placeholder="Challenge" />
              </Field>
              <Field label="Title">
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </Field>
              <Field label="Body (blank line = new paragraph)">
                <Textarea value={bodyRaw} onChange={(e) => setBodyRaw(e.target.value)} rows={5} />
              </Field>
              <Field label="Image">
                <ImageField value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} label="Section" />
              </Field>
              <Field label="Image Alt">
                <Input value={form.image_alt} onChange={(e) => setForm((f) => ({ ...f, image_alt: e.target.value }))} />
              </Field>
              <Field label="Image Layout">
                <select
                  value={form.image_layout}
                  onChange={(e) => setForm((f) => ({ ...f, image_layout: e.target.value as "left" | "right" }))}
                  className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm"
                >
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                </select>
              </Field>
              <Field label="Tone">
                <select
                  value={form.tone}
                  onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value as "light" | "navy" }))}
                  className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm"
                >
                  <option value="light">Light</option>
                  <option value="navy">Navy</option>
                </select>
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Related Projects panel ───────────────────────────────────────────────────

function RelatedPanel({
  currentId,
  allProjects,
  selectedIds,
  onChange,
}: {
  currentId: string;
  allProjects: ProjectSummaryDb[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const candidates = allProjects.filter((p) => p.id !== currentId);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else if (selectedIds.length < 3) {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-[hsl(var(--admin-text-muted))]">Select up to 3 related projects.</p>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {candidates.map((p) => {
          const checked = selectedIds.includes(p.id);
          const disabled = !checked && selectedIds.length >= 3;
          return (
            <label
              key={p.id}
              className={`flex items-center gap-3 rounded px-3 py-2 cursor-pointer ${disabled ? "opacity-40" : "hover:bg-[hsl(var(--admin-bg))]"}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(p.id)}
                className="h-4 w-4"
              />
              <span className="text-sm text-[hsl(var(--admin-text))]">{p.title}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main editor ──────────────────────────────────────────────────────────────

interface Props {
  project: ProjectFullDb;
  allProjects: ProjectSummaryDb[];
}

export default function ProjectEditor({ project, allProjects }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState("");

  // Basic Info
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [slugEdited] = useState(true);
  const [tagsRaw, setTagsRaw] = useState(project.tags.join(", "));
  const [aspectRatio, setAspectRatio] = useState(project.aspect_ratio);
  const [coverImageUrl, setCoverImageUrl] = useState(project.cover_image_url);
  const [published, setPublished] = useState(project.published);

  // Hero
  const [heroLabel, setHeroLabel] = useState(project.hero_label);
  const [heroTitle, setHeroTitle] = useState(project.hero_title);
  const [heroSubtitle, setHeroSubtitle] = useState(project.hero_subtitle);
  const [heroSummary, setHeroSummary] = useState(project.hero_summary);
  const [heroImageUrl, setHeroImageUrl] = useState(project.hero_image_url);

  // Overview Bar
  const [client, setClient] = useState(project.client);
  const [projectType, setProjectType] = useState(project.project_type);
  const [deliverables, setDeliverables] = useState(project.deliverables);
  const [launchLabel, setLaunchLabel] = useState(project.launch_label);
  const [launchUrl, setLaunchUrl] = useState(project.launch_url);

  // Intro
  const [introRaw, setIntroRaw] = useState(project.intro.join("\n\n"));

  // Showcase
  const [showcaseImageUrl, setShowcaseImageUrl] = useState(project.showcase_image_url);
  const [showcaseAlt, setShowcaseAlt] = useState(project.showcase_alt);
  const [showcaseLabel, setShowcaseLabel] = useState(project.showcase_label);

  // Feature
  const [featureEyebrow, setFeatureEyebrow] = useState(project.feature_eyebrow);
  const [featureTitle, setFeatureTitle] = useState(project.feature_title);
  const [featureBody, setFeatureBody] = useState(project.feature_body);

  // Child lists with _id
  const [sections, setSections] = useState<EditorSection[]>(
    project.sections.map((s) => ({ ...s, _id: s.id || factId() }))
  );
  const [gallery, setGallery] = useState<EditorGallery[]>(
    project.gallery.map((g) => ({ ...g, _id: g.id || factId() }))
  );
  const [metrics, setMetrics] = useState<EditorFact[]>(
    project.metrics.map((m) => ({ ...m, _id: m.id || factId() }))
  );
  const [credits, setCredits] = useState<EditorFact[]>(
    project.credits.map((c) => ({ ...c, _id: c.id || factId() }))
  );
  const [overviewFacts, setOverviewFacts] = useState<EditorFact[]>(
    project.overview.map((o) => ({ ...o, _id: o.id || factId() }))
  );
  const [relatedIds, setRelatedIds] = useState(project.related_ids);

  function handleSave() {
    if (!title.trim()) { setSaveError("Title is required."); return; }
    setSaveError("");

    const input: ProjectFullInput = {
      title: title.trim(), slug: slug.trim(),
      tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      aspect_ratio: aspectRatio, cover_image_url: coverImageUrl, published,
      hero_label: heroLabel, hero_title: heroTitle, hero_subtitle: heroSubtitle,
      hero_summary: heroSummary, hero_image_url: heroImageUrl,
      client, project_type: projectType, deliverables,
      launch_label: launchLabel, launch_url: launchUrl,
      intro: introRaw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
      showcase_image_url: showcaseImageUrl, showcase_alt: showcaseAlt, showcase_label: showcaseLabel,
      feature_eyebrow: featureEyebrow, feature_title: featureTitle, feature_body: featureBody,
      sections: sections.map(({ eyebrow, title: st, body, image_url, image_alt, image_layout, tone }) => ({
        eyebrow, title: st, body, image_url, image_alt, image_layout, tone,
      })),
      gallery: gallery.map(({ image_url, image_alt, image_label }) => ({ image_url, image_alt, image_label })),
      metrics: metrics.map(({ label, value }) => ({ label, value })),
      credits: credits.map(({ label, value }) => ({ label, value })),
      overview: overviewFacts.map(({ label, value }) => ({ label, value })),
      related_ids: relatedIds,
    };

    startTransition(async () => {
      try {
        await updateProject(project.id, input);
        router.refresh();
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Save failed.");
      }
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-8 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects" className="text-sm text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]">
            ← Projects
          </Link>
          <h1 className="text-lg font-semibold text-[hsl(var(--admin-text))] truncate max-w-sm">
            {title || "Untitled"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <Button onClick={handleSave} disabled={isPending || !title.trim()}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-3xl">
        <Section title="Basic Info">
          <Field label="Title *">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Slug *">
            <Input value={slug} onChange={(e) => setSlug(toSlug(e.target.value))} />
            <p className="text-xs text-[hsl(var(--admin-text-muted))]">/projects/{slug || "…"}</p>
          </Field>
          <Field label="Tags (comma-separated)">
            <Input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="Experiences, Branding" />
          </Field>
          <Field label="Aspect Ratio">
            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as typeof aspectRatio)}
              className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm">
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
              <option value="square">Square</option>
            </select>
          </Field>
          <Field label="Cover Image">
            <ImageField value={coverImageUrl} onChange={setCoverImageUrl} label="Cover" />
          </Field>
          <div className="flex items-center gap-3">
            <input id="published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4" />
            <Label htmlFor="published">Published (visible on public site)</Label>
          </div>
        </Section>

        <Section title="Hero">
          <Field label="Label (eyebrow)">
            <Input value={heroLabel} onChange={(e) => setHeroLabel(e.target.value)} placeholder="Case Study" />
          </Field>
          <Field label="Hero Title">
            <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
          </Field>
          <Field label="Hero Subtitle">
            <Input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
          </Field>
          <Field label="Hero Summary">
            <Textarea value={heroSummary} onChange={(e) => setHeroSummary(e.target.value)} rows={3} />
          </Field>
          <Field label="Hero Image">
            <ImageField value={heroImageUrl} onChange={setHeroImageUrl} label="Hero" />
          </Field>
        </Section>

        <Section title="Overview Bar">
          <Field label="Client">
            <Input value={client} onChange={(e) => setClient(e.target.value)} />
          </Field>
          <Field label="Project Type">
            <Input value={projectType} onChange={(e) => setProjectType(e.target.value)} />
          </Field>
          <Field label="Deliverables">
            <Input value={deliverables} onChange={(e) => setDeliverables(e.target.value)} />
          </Field>
          <Field label="Launch Label">
            <Input value={launchLabel} onChange={(e) => setLaunchLabel(e.target.value)} placeholder="Launch project" />
          </Field>
          <Field label="Launch URL">
            <Input value={launchUrl} onChange={(e) => setLaunchUrl(e.target.value)} placeholder="https://…" />
          </Field>
        </Section>

        <Section title="Intro Paragraphs">
          <p className="text-xs text-[hsl(var(--admin-text-muted))]">Separate paragraphs with a blank line.</p>
          <Textarea value={introRaw} onChange={(e) => setIntroRaw(e.target.value)} rows={8} placeholder={"First paragraph.\n\nSecond paragraph."} />
        </Section>

        <Section title="Overview Facts">
          <FactListEditor items={overviewFacts} onChange={setOverviewFacts} />
        </Section>

        <Section title="Primary Showcase">
          <Field label="Image">
            <ImageField value={showcaseImageUrl} onChange={setShowcaseImageUrl} label="Showcase" />
          </Field>
          <Field label="Alt Text">
            <Input value={showcaseAlt} onChange={(e) => setShowcaseAlt(e.target.value)} />
          </Field>
          <Field label="Label">
            <Input value={showcaseLabel} onChange={(e) => setShowcaseLabel(e.target.value)} placeholder="Primary showcase" />
          </Field>
        </Section>

        <Section title="Feature Block">
          <Field label="Eyebrow">
            <Input value={featureEyebrow} onChange={(e) => setFeatureEyebrow(e.target.value)} placeholder="Experience frame" />
          </Field>
          <Field label="Title">
            <Input value={featureTitle} onChange={(e) => setFeatureTitle(e.target.value)} />
          </Field>
          <Field label="Body">
            <Textarea value={featureBody} onChange={(e) => setFeatureBody(e.target.value)} rows={3} />
          </Field>
        </Section>

        <Section title="Story Sections">
          <SectionListEditor items={sections} onChange={setSections} />
        </Section>

        <Section title="Gallery">
          <GalleryEditor items={gallery} onChange={setGallery} />
        </Section>

        <Section title="Impact Metrics">
          <FactListEditor items={metrics} onChange={setMetrics} />
        </Section>

        <Section title="Credits">
          <FactListEditor items={credits} onChange={setCredits} />
        </Section>

        <Section title="Related Projects">
          <RelatedPanel
            currentId={project.id}
            allProjects={allProjects}
            selectedIds={relatedIds}
            onChange={setRelatedIds}
          />
        </Section>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Remove the intermediate Task 8 version of ProjectEditor.tsx and replace with the file above**

The file above is the complete final version. Overwrite `src/app/(admin)/admin/projects/[id]/ProjectEditor.tsx` entirely.

- [ ] **Step 3: Verify build**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
npm run build 2>&1 | tail -20
```

Expected: Build succeeds. No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(admin\)/admin/projects/\[id\]/ProjectEditor.tsx \
        src/app/\(admin\)/admin/projects/\[id\]/page.tsx
git commit -m "feat: complete project editor with DnD child editors and related projects panel"
```

---

## Task 10: Public Frontend — Projects Grid

**Files:**
- Modify: `src/components/sections/Projects.tsx`
- Modify: `src/app/[lang]/page.tsx`

- [ ] **Step 1: Read the current Projects.tsx to see its full content**

Look at `src/components/sections/Projects.tsx`. It currently imports `{ projects, type ProjectSummary }` from `@/lib/project-catalog` and uses `project.image`, `project.aspectRatio`, `project.id`.

- [ ] **Step 2: Update Projects.tsx to accept a prop**

Replace the static import with a prop. The field mappings change:
- `project.image` → `project.cover_image_url`
- `project.aspectRatio` → `project.aspect_ratio`  
- Link href: was `/[lang]/projects/${project.id}` → `/[lang]/projects/${project.slug}`

Open the file and make these changes. Preserve all animation, layout, and filter logic unchanged — only swap the data source.

The component signature changes from:
```tsx
export default function Projects() {
  // const [filter, ...] = useState(...)
  // uses imported `projects` array
```

To:
```tsx
import type { ProjectSummaryDb } from "@/lib/project-data";

export default function Projects({ projects }: { projects: ProjectSummaryDb[] }) {
  // same filter/animation logic
```

And inside the map, change:
- `project.image` → `project.cover_image_url`
- `project.aspectRatio` → `project.aspect_ratio`
- Link href: use `project.slug` instead of `project.id`

Remove the line `import { projects, type ProjectSummary } from "@/lib/project-catalog"`.

- [ ] **Step 3: Update [lang]/page.tsx**

```tsx
// src/app/[lang]/page.tsx
import { getTranslations } from "next-intl/server";
import { getFaqItems } from "@/lib/faq-data";
import { getProjects } from "@/lib/project-data";
import CreativeHero from "@/components/sections/CreativeHero";
import Projects from "@/components/sections/Projects";
import ProductSection from "@/components/sections/ProductSection";
import FaqQuoteSection from "@/components/sections/FaqQuoteSection";
import type { CreativeHeroConfig } from "@/lib/hero-types";

export const revalidate = 60;

export default async function Home() {
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

- [ ] **Step 4: Verify build**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
npm run build 2>&1 | tail -20
```

Expected: Build succeeds. Home page renders with DB projects.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Projects.tsx src/app/\[lang\]/page.tsx
git commit -m "feat: wire Projects.tsx and home page to Supabase getProjects()"
```

---

## Task 11: Public Frontend — Project Detail Page

**Files:**
- Modify: `src/app/[lang]/projects/[id]/page.tsx`
- Modify: `src/components/projects/ProjectDetailContainer.tsx`

- [ ] **Step 1: Update the project detail page**

```tsx
// src/app/[lang]/projects/[id]/page.tsx
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import ProjectDetailContainer from "@/components/projects/ProjectDetailContainer";
import { locales } from "@/i18n/config";
import { getProject, getProjects } from "@/lib/project-data";

export const revalidate = 60;
export const dynamicParams = true;

type ProjectPageProps = {
  params: Promise<{ lang: string; id: string }>;
};

export async function generateStaticParams() {
  const projects = await getProjects();
  return locales.flatMap((lang) =>
    projects.map((p) => ({ lang, id: p.slug }))
  );
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.hero_title || project.title} | Hello Monday`,
    description: project.hero_summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { lang, id } = await params;
  setRequestLocale(lang);
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <ProjectDetailContainer project={project} />
    </div>
  );
}
```

- [ ] **Step 2: Update ProjectDetailContainer.tsx**

```tsx
// src/components/projects/ProjectDetailContainer.tsx
import ProjectDetailView from "@/components/projects/ProjectDetailView";
import { getRelatedProjects, dbFullToLegacy, dbSummaryToLegacy } from "@/lib/project-data";
import type { ProjectFullDb } from "@/lib/project-data";

type Props = { project: ProjectFullDb };

export default async function ProjectDetailContainer({ project }: Props) {
  const relatedSummariesDb = await getRelatedProjects(project.related_ids);
  const legacyProject = dbFullToLegacy(project);
  const relatedProjects = relatedSummariesDb.map(dbSummaryToLegacy);

  return <ProjectDetailView project={legacyProject} relatedProjects={relatedProjects} />;
}
```

- [ ] **Step 3: Verify build**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
npm run build 2>&1 | tail -20
```

Expected: Build succeeds. Project detail routes compile. `ProjectDetailView.tsx` is untouched.

- [ ] **Step 4: Commit**

```bash
git add src/app/\[lang\]/projects/\[id\]/page.tsx \
        src/components/projects/ProjectDetailContainer.tsx
git commit -m "feat: wire project detail page and container to Supabase via mapper"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|-----------------|------|
| 7 tables with RLS | Task 1 |
| `ProjectSummaryDb`, `ProjectFullDb`, child DB types | Task 2 |
| `ProjectInput`, `ProjectFullInput` input types | Task 2 |
| `getProjects()` + `getProject(slug)` cached fetchers | Task 2 |
| Mapper `dbFullToLegacy` + `dbSummaryToLegacy` | Task 2 |
| Seed 23 projects from static catalog | Task 3 |
| 8 server actions with `auth()` + `revalidateTag` | Task 4 |
| Admin list with DnD, publish toggle, delete | Task 5 |
| AssetPicker + URL fallback `ImageField` | Task 6 |
| New project page (title → slug → create → redirect) | Task 7 |
| Full project editor with all 12 sections | Tasks 8+9 |
| DnD child editors for sections, gallery, metrics, credits, overview | Task 9 |
| Related projects multi-select (up to 3) | Task 9 |
| Save calls `updateProject` once with full input | Tasks 8+9 |
| Delete-all + reinsert for child records | Task 4 |
| `Projects.tsx` accepts `projects` prop | Task 10 |
| Home page fetches from DB | Task 10 |
| Detail page uses slug, `dynamicParams = true`, ISR 60s | Task 11 |
| `generateStaticParams` reads DB slugs | Task 11 |
| `ProjectDetailView.tsx` untouched | Task 11 |
| Error: slug collision shown inline | Task 7 |
| Error: required field client-side guard | Tasks 8+9 |
| Error: Supabase error shown as banner | Tasks 8+9 |

**Placeholder scan:** None found.

**Type consistency check:**
- `ProjectFullInput.sections` → `ProjectSectionInput[]` (no `id` field) ✓
- `EditorSection._id` is client-only, not sent to server ✓
- `revalidateTag("projects", "max")` — two-arg form throughout ✓
- `getProject(slug)` in public layer vs `getProject(id)` (UUID) in admin actions — different signatures, correctly separated ✓

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-21-cms-projects.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — Fresh subagent per task, two-stage review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
