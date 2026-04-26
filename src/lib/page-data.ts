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
  | "rich_text"
  | "what_we_do"
  | "about_hero"
  | "about_content"
  | "about_mission"
  | "about_process"
  | "services_hero"
  | "services_section"
  | "services_credentials";

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
  logo_url: string;
  logo_dark_url: string;
  logo_icon_url: string;
  site_name: string;
  tagline: string;
  contact_email: string;
  business_email: string;
  social_twitter: string;
  social_instagram: string;
  social_linkedin: string;
  social_vimeo: string;
  social_tiktok: string;
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
  translations?: Record<string, unknown>;
}

export interface PageFullInput {
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
  published: boolean;
  sections: PageSectionInput[];
  translations?: Record<string, unknown>;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  logo_url: "",
  logo_dark_url: "",
  logo_icon_url: "",
  site_name: "Creative Core",
  tagline: "",
  contact_email: "hello@creativecore.com",
  business_email: "newbusiness@creativecore.com",
  social_twitter: "",
  social_instagram: "",
  social_linkedin: "",
  social_vimeo: "",
  social_tiktok: "",
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

export const getPageTranslations = unstable_cache(
  async (slug: string): Promise<{ en: Record<string, string>; ar: Record<string, string> }> => {
    const { data, error } = await supabase
      .from("pages")
      .select("translations")
      .eq("slug", slug)
      .single();
    if (error || !data) return { en: {}, ar: {} };
    const t = data.translations as Record<string, Record<string, string>>;
    return { en: t.en ?? {}, ar: t.ar ?? {} };
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
