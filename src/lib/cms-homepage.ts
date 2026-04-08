import "server-only";
import { draftMode } from "next/headers";
import { cache } from "react";

import { getPayload } from "payload";

import config from "@payload-config";

import { cleanText, asUploadURL as asUploadURLMapper, asStringArray } from "./cms-mappers";

type UploadDoc = {
  id: number | string;
  url?: string | null;
  thumbnailURL?: string | null;
};

type UploadValue = number | string | UploadDoc | null | undefined;
export type LexicalNode = {
  type?: string | null;
  text?: string | null;
  format?: number | null;
  tag?: string | null;
  listType?: string | null;
  url?: string | null;
  fields?: {
    url?: string | null;
  } | null;
  children?: LexicalNode[] | null;
};
export type LexicalValue = {
  root?: LexicalNode | null;
};

export type HomepageStatItem = {
  label: string;
  value: string;
  supportingText: string;
};

export type HomepageFaqItem = {
  id: string;
  question: string;
  answer: string;
  preview: string;
  deliverables: string[];
};

export type HomepageMediaItem = {
  url: string;
  alt: string;
  caption: string;
  href: string;
};

export type HomepageLogoItem = {
  url: string;
  name: string;
  href: string;
};

export type HomepageBlock = {
  blockType:
    | "hero"
    | "curatedProjects"
    | "featureMedia"
    | "faqSpotlight"
    | "quoteLauncher"
    | "statsGrid"
    | "richTextContent"
    | "mediaGallery"
    | "logoStrip"
    | "ctaBanner";
  blockName?: string;
  anchorId?: string;
  isVisible: boolean;
  eyebrow?: string;
  heading?: string;
  body?: string;
  subheading?: string;
  themeVariant?: string;
  triggerLabel?: string;
  headlineRotator?: string[];
  desktopVideo?: { url: string };
  mobileVideo?: { url: string };
  posterImage?: { url: string };
  scrollCueLabel?: string;
  minHeightVariant?: "standard" | "tall";
  overlayStyle?: "none" | "light" | "dark";
  filterMode?: "manual" | "tagBased";
  filterLabels?: string[];
  projectIds?: string[];
  maxItems?: number;
  emptyStateText?: string;
  backgroundMediaType?: "image" | "video";
  backgroundImage?: { url: string };
  backgroundVideo?: { url: string };
  stats?: HomepageStatItem[];
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  faqItems?: HomepageFaqItem[];
  quoteLauncherVariant?: "standard" | "inverted";
  quoteLauncherLabel?: string;
  columns?: "2" | "3" | "4";
  richText?: string | LexicalValue;
  layoutVariant?: "centered" | "left" | "split" | "grid" | "carousel" | "masonry";
  mediaItems?: HomepageMediaItem[];
  logos?: HomepageLogoItem[];
};

export interface HomepagePageData {
  id: string;
  metaTitle: string;
  metaDescription: string;
  ogImage?: { url: string };
  canonicalUrl: string;
  blocks: HomepageBlock[];
}

type HomepageDoc = {
  id?: number | string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: UploadValue;
  canonicalUrl?: string;
  blocks?: Array<Record<string, unknown> & { blockType?: string; isVisible?: boolean }>;
};

const getPayloadClient = cache(async () => getPayload({ config }));

// Utilities moved to cms-mappers.ts

function normalizeStats(values: Array<Record<string, unknown>> | null | undefined): HomepageStatItem[] {
  return (values ?? [])
    .map((item) => ({
      label: cleanText(item.label as string | undefined),
      value: cleanText(item.value as string | undefined),
      supportingText: cleanText(item.supportingText as string | undefined),
    }))
    .filter((item) => item.label || item.value || item.supportingText);
}

function normalizeFaqItems(values: Array<Record<string, unknown>> | null | undefined): HomepageFaqItem[] {
  return (values ?? [])
    .map((item) => ({
      id: cleanText(item.id as string | undefined),
      question: cleanText(item.question as string | undefined),
      answer: cleanText(item.answer as string | undefined),
      preview: cleanText(item.preview as string | undefined),
      deliverables: asStringArray(
        (item.deliverables as Array<{ label?: string | null }> | undefined) ?? [],
      ),
    }))
    .filter((item) => item.id && item.question);
}

function normalizeMediaItems(values: Array<Record<string, unknown>> | null | undefined): HomepageMediaItem[] {
  return (values ?? [])
    .map((item) => ({
      url: asUploadURLMapper(item.media as UploadValue),
      alt: cleanText(item.alt as string | undefined),
      caption: cleanText(item.caption as string | undefined),
      href: cleanText(item.href as string | undefined),
    }))
    .filter((item) => item.url);
}

function normalizeLogoItems(values: Array<Record<string, unknown>> | null | undefined): HomepageLogoItem[] {
  return (values ?? [])
    .map((item) => ({
      url: asUploadURLMapper(item.logo as UploadValue),
      name: cleanText(item.name as string | undefined),
      href: cleanText(item.href as string | undefined),
    }))
    .filter((item) => item.url || item.name);
}

function normalizeProjectIds(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return String(item);
      }

      if (item && typeof item === "object" && "id" in item) {
        return String(item.id);
      }

      return "";
    })
    .filter(Boolean);
}

function normalizeRichText(value: unknown): string | LexicalValue {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return cleanText(value);
  }

  if (typeof value !== "object") {
    return "";
  }

  return value as LexicalValue;
}

function normalizeBlock(block: Record<string, unknown> & { blockType?: string; isVisible?: boolean }): HomepageBlock | null {
  const blockType = cleanText(block.blockType as string | undefined) as HomepageBlock["blockType"];

  if (!blockType) {
    return null;
  }

  return {
    blockType,
    blockName: cleanText(block.blockName as string | undefined),
    anchorId: cleanText(block.anchorId as string | undefined),
    isVisible: block.isVisible !== false,
    eyebrow: cleanText(block.eyebrow as string | undefined),
    heading: cleanText(block.heading as string | undefined),
    body: cleanText(block.body as string | undefined),
    subheading: cleanText(block.subheading as string | undefined),
    themeVariant: cleanText(block.themeVariant as string | undefined),
    triggerLabel: cleanText(block.triggerLabel as string | undefined),
    headlineRotator: asStringArray(
      (block.headlineRotator as Array<{ value?: string | null }> | undefined) ?? [],
    ),
    desktopVideo: (() => {
      const url = asUploadURLMapper(block.desktopVideo as UploadValue);
      return url ? { url } : undefined;
    })(),
    mobileVideo: (() => {
      const url = asUploadURLMapper(block.mobileVideo as UploadValue);
      return url ? { url } : undefined;
    })(),
    posterImage: (() => {
      const url = asUploadURLMapper(block.posterImage as UploadValue);
      return url ? { url } : undefined;
    })(),
    scrollCueLabel: cleanText(block.scrollCueLabel as string | undefined),
    minHeightVariant: (cleanText(block.minHeightVariant as string | undefined) as "standard" | "tall") || undefined,
    overlayStyle: (cleanText(block.overlayStyle as string | undefined) as "none" | "light" | "dark") || undefined,
    filterMode: (cleanText(block.filterMode as string | undefined) as "manual" | "tagBased") || undefined,
    filterLabels: asStringArray(
      (block.filterLabels as Array<{ label?: string | null }> | undefined) ?? [],
    ),
    projectIds: normalizeProjectIds(block.projects),
    maxItems: typeof block.maxItems === "number" ? block.maxItems : undefined,
    emptyStateText: cleanText(block.emptyStateText as string | undefined),
    backgroundMediaType:
      (cleanText(block.backgroundMediaType as string | undefined) as "image" | "video") ||
      undefined,
    backgroundImage: (() => {
      const url = asUploadURLMapper(block.backgroundImage as UploadValue);
      return url ? { url } : undefined;
    })(),
    backgroundVideo: (() => {
      const url = asUploadURLMapper(block.backgroundVideo as UploadValue);
      return url ? { url } : undefined;
    })(),
    stats: normalizeStats((block.stats as Array<Record<string, unknown>> | undefined) ?? []),
    primaryCtaLabel: cleanText(block.primaryCtaLabel as string | undefined),
    primaryCtaHref: cleanText(block.primaryCtaHref as string | undefined),
    secondaryCtaLabel: cleanText(block.secondaryCtaLabel as string | undefined),
    secondaryCtaHref: cleanText(block.secondaryCtaHref as string | undefined),
    faqItems: normalizeFaqItems((block.items as Array<Record<string, unknown>> | undefined) ?? []),
    quoteLauncherVariant:
      (cleanText(block.quoteLauncherVariant as string | undefined) as "standard" | "inverted") ||
      undefined,
    quoteLauncherLabel: cleanText(block.quoteLauncherLabel as string | undefined),
    columns: (cleanText(block.columns as string | undefined) as "2" | "3" | "4") || undefined,
    richText: normalizeRichText(block.richText),
    layoutVariant:
      (cleanText(block.layoutVariant as string | undefined) as HomepageBlock["layoutVariant"]) ||
      undefined,
    mediaItems: normalizeMediaItems((block.items as Array<Record<string, unknown>> | undefined) ?? []),
    logos: normalizeLogoItems((block.logos as Array<Record<string, unknown>> | undefined) ?? []),
  };
}

function getDefaultHomepageData(): HomepagePageData {
  return {
    id: "homepage-default",
    metaTitle: "Homepage",
    metaDescription: "Homepage content managed in CMS.",
    canonicalUrl: "",
    blocks: [],
  };
}

export const getHomepageData = cache(async (): Promise<HomepagePageData> => {
  const { isEnabled: preview } = await draftMode();
  const payload = await getPayloadClient();

  try {
    const result = await payload.findGlobal({
      slug: "homepage",
      depth: 2,
      draft: preview,
    });

    const doc = result as HomepageDoc | null;

    if (!doc) {
      return getDefaultHomepageData();
    }

    const mappedBlocks = (doc.blocks ?? [])
      .map(normalizeBlock)
      .filter((block): block is HomepageBlock => Boolean(block))
      .filter((block) => block.isVisible);

    const ogImageUrl = asUploadURLMapper(doc.ogImage as UploadValue);

    return {
      id: String(doc.id ?? "homepage"),
      metaTitle: cleanText(doc.metaTitle) || getDefaultHomepageData().metaTitle,
      metaDescription: cleanText(doc.metaDescription) || getDefaultHomepageData().metaDescription,
      ogImage: ogImageUrl ? { url: ogImageUrl } : undefined,
      canonicalUrl: cleanText(doc.canonicalUrl),
      blocks: mappedBlocks.length > 0 ? mappedBlocks : getDefaultHomepageData().blocks,
    };
  } catch {
    return getDefaultHomepageData();
  }
});
