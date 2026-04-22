import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";
import type {
  ProjectDetail,
  ProjectSummary,
  ProjectSection as LegacySection,
  ProjectGalleryImage as LegacyGallery,
  ProjectFact as LegacyFact,
} from "@/lib/project-catalog";
import {
  buildProjectPaletteColors,
  resolveThemeInheritance,
  type ThemePalette,
} from "@/lib/project-theme";

export type { ThemePaletteColor, ThemePalette } from "@/lib/project-theme";

// ─── DB types ────────────────────────────────────────────────────────────────

export interface ProjectTranslationsAr {
  title?: string;
  tags?: string[];
  hero_label?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_summary?: string;
  launch_label?: string;
  client?: string;
  project_type?: string;
  deliverables?: string;
  intro?: string[];
  feature_eyebrow?: string;
  feature_title?: string;
  feature_body?: string;
  sections?: Array<{ eyebrow?: string; title?: string; body?: string[] }>;
  metrics?: Array<{ label?: string; value?: string }>;
  credits?: Array<{ label?: string; value?: string }>;
  overview?: Array<{ label?: string; value?: string }>;
  process?: Array<{ label?: string; description?: string }>;
}

export interface ProjectSummaryDb {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  aspect_ratio: "portrait" | "landscape" | "square";
  cover_image_url: string;
  published: boolean;
  sort_order: number;
  service_type: string;
  work_filters: string[];
  featured_aspect_ratio: string;
  inherit_theme_from_palette: boolean;
  theme_palette: ThemePalette;
  translations: { ar?: ProjectTranslationsAr };
}

export interface ProjectProcessDb {
  id: string;
  project_id: string;
  phase: string;
  label: string;
  description: string;
  sort_order: number;
  translations: { ar?: { label?: string; description?: string } };
}

export interface ProjectGalleryDb {
  id: string;
  project_id: string;
  image_url: string;
  image_alt: string;
  image_label: string;
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
  translations: { ar?: { eyebrow?: string; title?: string; body?: string[] } };
}

export interface ProjectFactDb {
  id: string;
  project_id: string;
  label: string;
  value: string;
  sort_order: number;
  translations: { ar?: { label?: string; value?: string } };
}

export interface ProjectFullDb extends ProjectSummaryDb {
  theme_preference_configured: boolean;
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
  process: ProjectProcessDb[];
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
  translations?: { ar?: { eyebrow?: string; title?: string; body?: string[] } };
}

export interface ProjectGalleryInput {
  image_url: string;
  image_alt: string;
  image_label: string;
}

export interface ProjectFactInput {
  label: string;
  value: string;
  translations?: { ar?: { label?: string; value?: string } };
}

export interface ProjectProcessInput {
  phase: string;
  label: string;
  description: string;
}

export interface ProjectFullInput {
  title: string;
  slug: string;
  tags: string[];
  aspect_ratio: "portrait" | "landscape" | "square";
  cover_image_url: string;
  published: boolean;
  service_type: string;
  work_filters: string[];
  featured_aspect_ratio: string;
  inherit_theme_from_palette: boolean;
  theme_palette: ThemePalette;
  theme_preference_configured: boolean;
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
  process: ProjectProcessInput[];
  related_ids: string[];
  translations?: { ar?: ProjectTranslationsAr };
}

// ─── Public cached fetchers ───────────────────────────────────────────────────

const SUMMARY_COLS =
  "id, slug, title, tags, aspect_ratio, cover_image_url, published, sort_order, service_type, work_filters, featured_aspect_ratio, inherit_theme_from_palette, theme_palette, translations";

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

    const [sections, gallery, metrics, credits, overview, process, related] =
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
          .from("project_process")
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
      process,
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

export function dbFullToLegacy(db: ProjectFullDb, locale = "en"): ProjectDetail {
  // Only apply Arabic translations when locale is "ar".
  // For English, always use the base English fields — never touch translations.ar.
  const isAr = locale === "ar";
  const ar: ProjectTranslationsAr = isAr ? (db.translations?.ar ?? {}) : {};
  const colors = buildProjectPaletteColors(db.theme_palette);

  return {
    id: db.slug,
    title: ar.title || db.title,
    tags: ar.tags?.length ? ar.tags : db.tags,
    image: db.cover_image_url,
    aspectRatio: db.aspect_ratio,
    heroLabel: ar.hero_label || db.hero_label,
    heroTitle: ar.hero_title || db.hero_title,
    heroSubtitle: ar.hero_subtitle || db.hero_subtitle,
    heroSummary: ar.hero_summary || db.hero_summary,
    inheritThemeFromPalette: resolveThemeInheritance(
      db.inherit_theme_from_palette,
      db.theme_preference_configured,
      db.theme_palette,
    ),
    introMeta: {
      launchLabel: ar.launch_label || db.launch_label,
      type: ar.project_type || db.project_type,
      client: ar.client || db.client,
      deliverables: ar.deliverables || db.deliverables,
    },
    overview: db.overview.map((f, i) => ({
      label: isAr ? (f.translations?.ar?.label || ar.overview?.[i]?.label || f.label) : f.label,
      value: isAr ? (f.translations?.ar?.value || ar.overview?.[i]?.value || f.value) : f.value,
    })) as LegacyFact[],
    intro: ar.intro?.length ? ar.intro : db.intro,
    primaryShowcase: {
      src: db.showcase_image_url,
      alt: db.showcase_alt,
      label: db.showcase_label,
    } as LegacyGallery,
    feature: {
      eyebrow: ar.feature_eyebrow || db.feature_eyebrow,
      title: ar.feature_title || db.feature_title,
      body: ar.feature_body || db.feature_body,
    },
    sections: db.sections.map((s, i) => ({
      eyebrow: isAr ? (s.translations?.ar?.eyebrow || ar.sections?.[i]?.eyebrow || s.eyebrow) : s.eyebrow,
      title: isAr ? (s.translations?.ar?.title || ar.sections?.[i]?.title || s.title) : s.title,
      body: isAr
        ? (s.translations?.ar?.body?.length ? s.translations.ar.body : (ar.sections?.[i]?.body?.length ? ar.sections[i].body! : s.body))
        : s.body,
      image: s.image_url,
      imageAlt: s.image_alt,
      imageLayout: s.image_layout,
      tone: s.tone,
    })) as LegacySection[],
    impactMetrics: db.metrics.map((m, i) => ({
      label: isAr ? (m.translations?.ar?.label || ar.metrics?.[i]?.label || m.label) : m.label,
      value: isAr ? (m.translations?.ar?.value || ar.metrics?.[i]?.value || m.value) : m.value,
    })) as LegacyFact[],
    gallery: db.gallery.map((g) => ({
      src: g.image_url,
      alt: g.image_alt,
      label: g.image_label,
    })) as LegacyGallery[],
    credits: db.credits.map((c, i) => ({
      label: isAr ? (c.translations?.ar?.label || ar.credits?.[i]?.label || c.label) : c.label,
      value: isAr ? (c.translations?.ar?.value || ar.credits?.[i]?.value || c.value) : c.value,
    })) as LegacyFact[],
    relatedIds: db.related_ids,
    colors: colors.length ? colors : undefined,
    process: db.process.map((p) => ({
      phase: p.phase,
      label: isAr ? (p.translations?.ar?.label || p.label) : p.label,
      desc: isAr ? (p.translations?.ar?.description || p.description) : p.description,
    })),
  };
}
