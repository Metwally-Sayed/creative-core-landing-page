/**
 * BROWSER-SAFE MAPPERS
 * 
 * This file contains logic to transform raw Payload documents into 
 * cleaner formats for the frontend. These functions are intentionally 
 * kept free of server-side dependencies like 'payload' or 'fs' 
 * so they can be used in both Server Components and the Live Preview 
 * Client Component.
 */

export type ProjectAspectRatio = "portrait" | "landscape" | "square";
export type WorkFilter = "Products" | "Experiences" | "Branding";

export type ProjectSummary = {
  id: string;
  legacyId: string | null;
  slug: string;
  title: string;
  tags: string[];
  workFilters: WorkFilter[];
  image: string;
  aspectRatio: ProjectAspectRatio;
  featuredAspectRatio: ProjectAspectRatio;
};

export type ProjectFact = {
  label: string;
  value: string;
};

export type ProjectSection = {
  eyebrow: string;
  title: string;
  body: string[];
  image: string;
  imageAlt: string;
  imageLayout: "left" | "right";
  tone?: "light" | "navy";
};

export type ProjectGalleryImage = {
  src: string;
  alt: string;
  label: string;
};

export type ProjectProcessStep = {
  phase: string;
  label: string;
  desc: string;
};

export type ProjectTestimonial = {
  quote: string;
  author: string;
  role: string;
};

export type ProjectThemeRole =
  | "accent"
  | "secondary"
  | "background"
  | "foreground"
  | "showcase";

export type ProjectColor = {
  hex: string;
  name: string;
  themeRole: ProjectThemeRole | null;
};

export type ProjectIntroMeta = {
  launchLabel: string;
  type: string;
  client: string;
  deliverables: string;
};

export type ProjectDetail = ProjectSummary & {
  heroLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSummary: string;
  launchUrl: string | null;
  introMeta: ProjectIntroMeta;
  overview: ProjectFact[];
  intro: string[];
  primaryShowcase: ProjectGalleryImage;
  process: ProjectProcessStep[];
  sections: ProjectSection[];
  impactMetrics: ProjectFact[];
  gallery: ProjectGalleryImage[];
  testimonials: ProjectTestimonial[];
  colors: ProjectColor[];
  credits: ProjectFact[];
  inheritThemeFromPalette: boolean;
};

export type PayloadUploadDoc = {
  id: number | string;
  url?: string | null;
  thumbnailURL?: string | null;
  alt?: string | null;
  caption?: string | null;
};

export type PayloadProjectDoc = {
  id: number | string;
  legacyId?: string | null;
  slug: string;
  title: string;
  tags?: { label?: string | null }[] | null;
  workFilters?: string[] | null;
  image: number | string | PayloadUploadDoc | null;
  aspectRatio?: ProjectAspectRatio | null;
  featuredAspectRatio?: ProjectAspectRatio | null;
  heroLabel?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroSummary?: string | null;
  launchUrl?: string | null;
  introMeta?: {
    launchLabel?: string | null;
    type?: string | null;
    client?: string | null;
    deliverables?: string | null;
  } | null;
  overview?: { label?: string | null; value?: string | null }[] | null;
  intro?: { paragraph?: string | null }[] | null;
  primaryShowcase?: {
    image?: number | string | PayloadUploadDoc | null;
    alt?: string | null;
    label?: string | null;
  } | null;
  process?: {
    phase?: string | null;
    label?: string | null;
    desc?: string | null;
  }[] | null;
  sections?: {
    eyebrow?: string | null;
    title?: string | null;
    body?: { paragraph?: string | null }[] | null;
    image?: number | string | PayloadUploadDoc | null;
    imageAlt?: string | null;
    imageLayout?: "left" | "right" | null;
    tone?: "light" | "navy" | null;
  }[] | null;
  impactMetrics?: { label?: string | null; value?: string | null }[] | null;
  galleryMedia?: (number | string | PayloadUploadDoc | null)[] | null;
  gallery?: {
    image?: number | string | PayloadUploadDoc | null;
    alt?: string | null;
    label?: string | null;
  }[] | null;
  testimonials?: {
    quote?: string | null;
    author?: string | null;
    role?: string | null;
  }[] | null;
  colors?: {
    hex?: string | null;
    name?: string | null;
    themeRole?: string | null;
  }[] | null;
  credits?: { label?: string | null; value?: string | null }[] | null;
  inheritThemeFromPalette?: boolean | null;
  themePreferenceConfigured?: boolean | null;
  relatedProjects?: (number | string | PayloadProjectDoc)[] | null;
  sortOrder?: number | null;
  publishedAt?: string | null;
};

const workFilters: WorkFilter[] = ["Products", "Experiences", "Branding"];
const projectThemeRoles: ProjectThemeRole[] = [
  "accent",
  "secondary",
  "background",
  "foreground",
  "showcase",
];

export function cleanText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export function normalizeProjectThemeRole(
  value: string | null | undefined,
): ProjectThemeRole | null {
  const candidate = cleanText(value);

  if (!candidate) {
    return null;
  }

  return projectThemeRoles.includes(candidate as ProjectThemeRole)
    ? (candidate as ProjectThemeRole)
    : null;
}

export function asUploadURL(upload: number | string | PayloadUploadDoc | null | undefined): string {
  if (!upload || typeof upload === "number" || typeof upload === "string") {
    return "";
  }

  return upload.url ?? upload.thumbnailURL ?? "";
}

export function getUploadText(
  upload: number | string | PayloadUploadDoc | null | undefined,
  key: "alt" | "caption",
) {
  if (!upload || typeof upload === "number" || typeof upload === "string") {
    return "";
  }

  return cleanText(upload[key]);
}

export function mapFacts(
  values: { label?: string | null; value?: string | null }[] | null | undefined,
) {
  return (values ?? [])
    .map((item) => ({
      label: cleanText(item.label),
      value: cleanText(item.value),
    }))
    .filter((item) => item.label && item.value);
}

export function mapTags(tags: PayloadProjectDoc["tags"]) {
  return (tags ?? [])
    .map((tag) => cleanText(tag.label))
    .filter(Boolean);
}

export function mapWorkFilters(filters: string[] | null | undefined, tags: string[]) {
  const filtered = (filters ?? []).filter((filter): filter is WorkFilter =>
    workFilters.includes(filter as WorkFilter),
  );

  if (filtered.length > 0) {
    return filtered;
  }

  return workFilters.filter((filter) => tags.includes(filter));
}

export function mapSummary(doc: PayloadProjectDoc): ProjectSummary {
  const tags = mapTags(doc.tags);

  return {
    id: String(doc.id),
    legacyId: doc.legacyId ?? null,
    slug: doc.slug,
    title: doc.title,
    tags,
    workFilters: mapWorkFilters(doc.workFilters, tags),
    image: asUploadURL(doc.image),
    aspectRatio: doc.aspectRatio ?? "landscape",
    featuredAspectRatio: doc.featuredAspectRatio ?? doc.aspectRatio ?? "landscape",
  };
}

export function mapGalleryImage(
  image: number | string | PayloadUploadDoc | null | undefined,
  alt: string | null | undefined,
  label: string | null | undefined,
): ProjectGalleryImage {
  return {
    src: asUploadURL(image),
    alt: cleanText(alt),
    label: cleanText(label),
  };
}

export function mapDetail(doc: PayloadProjectDoc): ProjectDetail {
  const summary = mapSummary(doc);
  const bulkGallery = (doc.galleryMedia ?? [])
    .map((image) => mapGalleryImage(image, getUploadText(image, "alt"), getUploadText(image, "caption")))
    .filter((image) => image.src && image.alt);
  const legacyGallery = (doc.gallery ?? [])
    .map((image) => mapGalleryImage(image.image, image.alt, image.label))
    .filter((image) => image.src && image.alt);
  const colors = (doc.colors ?? [])
    .map((color) => ({
      hex: cleanText(color.hex),
      name: cleanText(color.name),
      themeRole: normalizeProjectThemeRole(color.themeRole),
    }))
    .filter((color) => color.hex && color.name);
  const themePreferenceConfigured = Boolean(doc.themePreferenceConfigured);

  return {
    ...summary,
    heroLabel: cleanText(doc.heroLabel) || "Case Study",
    heroTitle: cleanText(doc.heroTitle) || doc.title,
    heroSubtitle: cleanText(doc.heroSubtitle),
    heroSummary: cleanText(doc.heroSummary),
    launchUrl: cleanText(doc.launchUrl) || null,
    introMeta: {
      launchLabel: cleanText(doc.introMeta?.launchLabel) || "Launch project",
      type: cleanText(doc.introMeta?.type),
      client: cleanText(doc.introMeta?.client),
      deliverables: cleanText(doc.introMeta?.deliverables),
    },
    overview: mapFacts(doc.overview),
    intro: (doc.intro ?? [])
      .map((item) => cleanText(item.paragraph))
      .filter(Boolean),
    primaryShowcase: mapGalleryImage(
      doc.primaryShowcase?.image,
      doc.primaryShowcase?.alt,
      doc.primaryShowcase?.label,
    ),
    process: (doc.process ?? [])
      .map((step) => ({
        phase: cleanText(step.phase),
        label: cleanText(step.label),
        desc: cleanText(step.desc),
      }))
      .filter((step) => step.phase && step.label && step.desc),
    sections: (doc.sections ?? [])
      .map((section) => ({
        eyebrow: cleanText(section.eyebrow),
        title: cleanText(section.title),
        body: (section.body ?? [])
          .map((paragraph) => cleanText(paragraph.paragraph))
          .filter(Boolean),
        image: asUploadURL(section.image),
        imageAlt: cleanText(section.imageAlt),
        imageLayout: section.imageLayout ?? "left",
        tone: section.tone ?? "light",
      }))
      .filter(
        (section) =>
          section.eyebrow &&
          section.title &&
          section.body.length > 0 &&
          section.image &&
          section.imageAlt,
      ),
    impactMetrics: mapFacts(doc.impactMetrics),
    gallery: bulkGallery.length > 0 ? bulkGallery : legacyGallery,
    testimonials: (doc.testimonials ?? [])
      .map((item) => ({
        quote: cleanText(item.quote),
        author: cleanText(item.author),
        role: cleanText(item.role),
      }))
      .filter((item) => item.quote && item.author && item.role),
    colors,
    credits: mapFacts(doc.credits),
    inheritThemeFromPalette: themePreferenceConfigured
      ? Boolean(doc.inheritThemeFromPalette)
      : colors.length > 0,
  };
}

export function asStringArray(values: Array<Record<string, unknown>> | null | undefined) {
  return (values ?? [])
    .map((value) => {
      if (typeof value.value === "string") {
        return cleanText(value.value);
      }
      if (typeof value.label === "string") {
        return cleanText(value.label);
      }
      return "";
    })
    .filter(Boolean);
}
