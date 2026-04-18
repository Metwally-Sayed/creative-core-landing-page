import "server-only";
import { draftMode } from "next/headers";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { asUploadURL, cleanText, type PayloadUploadDoc, type WorkFilter } from "./cms-mappers";
import type { HeroConfig } from "./hero-types";

type UploadValue = number | string | PayloadUploadDoc | null | undefined;

const getPayloadClient = cache(async () => getPayload({ config }));

type WorkDoc = {
  heroTitle?: string | null;
  heroBody?: string | null;
  hero?: {
    isVisible?: boolean | null;
    variant?: string | null;
    creative?: {
      kicker?: string | null;
      headline?: string | null;
      highlight?: string | null;
      body?: string | null;
      subcopy?: string | null;
      primaryCtaLabel?: string | null;
      primaryCtaHref?: string | null;
      secondaryCtaLabel?: string | null;
      secondaryCtaHref?: string | null;
      layoutVariant?: string | null;
      mediaSide?: string | null;
      textAlign?: string | null;
      backgroundStyle?: string | null;
      mediaItems?: Array<{
        media?: UploadValue;
        externalUrl?: string | null;
        alt?: string | null;
        href?: string | null;
      }> | null;
    } | null;
  } | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: UploadValue;
  canonicalUrl?: string | null;
  filterLabels?: Array<{
    label?: string | null;
    value?: string | null;
  }> | null;
  featuredProjects?: Array<{ id?: number | string } | number | string> | null;
};

export type WorkPageFilter = {
  label: string;
  value: WorkFilter;
};

export type WorkPageData = {
  hero: HeroConfig;
  meta: {
    title: string;
    description: string;
    ogImage?: { url: string };
    canonicalUrl: string;
  };
  filterLabels: WorkPageFilter[];
  featuredProjectIds: string[];
};

const WORK_FILTERS = new Set<WorkFilter>(["Products", "Experiences", "Branding"]);
const DEFAULT_FILTERS: WorkPageFilter[] = [
  { label: "Products", value: "Products" },
  { label: "Experiences", value: "Experiences" },
  { label: "Branding", value: "Branding" },
];
const DEFAULT_META: WorkPageData["meta"] = {
  title: "Work | Hello Monday / Dept.",
  description: "An editorial grid of selected Hello Monday projects.",
  canonicalUrl: "",
};

export const getWorkPageCMSData = cache(async (): Promise<WorkPageData> => {
  const { isEnabled: preview } = await draftMode();
  const payload = await getPayloadClient();
  const result = (await payload.findGlobal({
    slug: "workPage",
    depth: 2,
    draft: preview,
  })) as WorkDoc | null;

  const filters = (result?.filterLabels ?? [])
    .map((filter) => ({
      label: cleanText(filter.label),
      value: cleanText(filter.value),
    }))
    .filter(
      (filter): filter is WorkPageFilter =>
        filter.label.length > 0 && WORK_FILTERS.has(filter.value as WorkFilter),
    );

  const featuredProjectIds = (result?.featuredProjects ?? [])
    .map((project) => {
      if (typeof project === "number" || typeof project === "string") {
        return String(project);
      }
      return project?.id ? String(project.id) : "";
    })
    .filter(Boolean);

  const ogImageUrl = asUploadURL(result?.ogImage);

  const heroVariantRaw = cleanText(result?.hero?.variant) || "current";
  const heroVariant = heroVariantRaw === "creative" ? "creative" : "current";
  const heroVisible = result?.hero?.isVisible !== false;
  const creative = result?.hero?.creative ?? null;
  const creativePrimary =
    cleanText(creative?.primaryCtaLabel) && cleanText(creative?.primaryCtaHref)
      ? { label: cleanText(creative?.primaryCtaLabel), href: cleanText(creative?.primaryCtaHref) }
      : undefined;
  const creativeSecondary =
    cleanText(creative?.secondaryCtaLabel) && cleanText(creative?.secondaryCtaHref)
      ? { label: cleanText(creative?.secondaryCtaLabel), href: cleanText(creative?.secondaryCtaHref) }
      : undefined;
  const creativeItems = (creative?.mediaItems ?? [])
    .map((item) => ({
      url: asUploadURL(item.media) || cleanText(item.externalUrl),
      alt: cleanText(item.alt),
      href: cleanText(item.href) || undefined,
    }))
    .filter((item) => item.url && item.alt);

  return {
    hero: {
      isVisible: heroVisible,
      variant: heroVariant,
      current: {
        title: cleanText(result?.heroTitle),
        body: cleanText(result?.heroBody),
      },
      creative: creative
        ? {
            kicker: cleanText(creative.kicker) || undefined,
            headline: cleanText(creative.headline),
            highlight: cleanText(creative.highlight) || undefined,
            body: cleanText(creative.body) || undefined,
            subcopy: cleanText(creative.subcopy) || undefined,
            primaryCta: creativePrimary,
            secondaryCta: creativeSecondary,
            media: { items: creativeItems },
            layout: {
              variant: (cleanText(creative.layoutVariant) as "split" | "stacked") || "split",
              mediaSide: (cleanText(creative.mediaSide) as "left" | "right") || "right",
            },
            style: {
              textAlign: (cleanText(creative.textAlign) as "left" | "center") || "left",
              background: (cleanText(creative.backgroundStyle) as "soft" | "none") || "soft",
            },
          }
        : undefined,
    },
    meta: {
      title: cleanText(result?.metaTitle) || DEFAULT_META.title,
      description: cleanText(result?.metaDescription) || DEFAULT_META.description,
      ogImage: ogImageUrl ? { url: ogImageUrl } : undefined,
      canonicalUrl: cleanText(result?.canonicalUrl),
    },
    filterLabels: filters.length > 0 ? filters : DEFAULT_FILTERS,
    featuredProjectIds,
  };
});
