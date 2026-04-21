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

export interface ProjectTranslationsAr {
  title?: string;
  tags?: string[];
  hero_label?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_summary?: string;
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
  translations: { ar?: ProjectTranslationsAr };
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
  "id, slug, title, tags, aspect_ratio, cover_image_url, published, sort_order, translations";

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
    id: db.slug,
    title: db.title,
    tags: db.tags,
    image: db.cover_image_url,
    aspectRatio: db.aspect_ratio,
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
