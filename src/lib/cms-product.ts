import "server-only";
import { draftMode } from "next/headers";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { asUploadURL, cleanText, type PayloadUploadDoc } from "./cms-mappers";
import type { HeroConfig } from "./hero-types";

const getPayloadClient = cache(async () => getPayload({ config }));

type UploadValue = number | string | PayloadUploadDoc | null | undefined;

type ProductDoc = {
  heroVideoUrl?: string | null;
  heroTitleLines?: Array<{ line?: string | null }> | null;
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
  introEyebrow?: string | null;
  introParagraphs?: Array<{ paragraph?: string | null }> | null;
  collaborations?: Array<{
    name?: string | null;
    projectCount?: string | null;
    tag?: string | null;
    summary?: string | null;
    videoUrl?: string | null;
  }> | null;
  testimonials?: Array<{
    body?: string | null;
    author?: string | null;
    role?: string | null;
  }> | null;
  contact?: {
    heading?: string | null;
    body?: string | null;
    email?: string | null;
    briefLabel?: string | null;
    photo?: UploadValue;
    name?: string | null;
    title?: string | null;
    directEmail?: string | null;
  } | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: UploadValue;
  canonicalUrl?: string | null;
};

export type ProductPageData = {
  hero: HeroConfig;
  intro: {
    eyebrow: string;
    paragraphs: string[];
  };
  collaborations: Array<{
    name: string;
    projectCount: string;
    tag: string;
    summary: string;
    videoUrl: string;
  }>;
  testimonials: Array<{
    body: string;
    author: string;
    role: string;
  }>;
  contact: {
    heading: string;
    body: string;
    email: string;
    briefLabel: string;
    photoUrl: string;
    name: string;
    title: string;
    directEmail: string;
  };
  meta: {
    title: string;
    description: string;
    ogImage?: { url: string };
    canonicalUrl: string;
  };
};

const DEFAULT_META: ProductPageData["meta"] = {
  title: "Product | Hello Monday / Dept.",
  description: "Collaboration, process, and craftsmanship in digital product design.",
  canonicalUrl: "",
};

export const getProductPageCMSData = cache(async (): Promise<ProductPageData> => {
  const { isEnabled: preview } = await draftMode();
  const payload = await getPayloadClient();
  const result = (await payload.findGlobal({
    slug: "productPage",
    depth: 2,
    draft: preview,
  })) as ProductDoc | null;

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
        videoUrl: cleanText(result?.heroVideoUrl),
        titleLines: (result?.heroTitleLines ?? [])
          .map((line) => cleanText(line.line))
          .filter(Boolean),
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
    intro: {
      eyebrow: cleanText(result?.introEyebrow),
      paragraphs: (result?.introParagraphs ?? [])
        .map((paragraph) => cleanText(paragraph.paragraph))
        .filter(Boolean),
    },
    collaborations: (result?.collaborations ?? [])
      .map((collaboration) => ({
        name: cleanText(collaboration.name),
        projectCount: cleanText(collaboration.projectCount),
        tag: cleanText(collaboration.tag),
        summary: cleanText(collaboration.summary),
        videoUrl: cleanText(collaboration.videoUrl),
      }))
      .filter(
        (collaboration) =>
          collaboration.name &&
          collaboration.projectCount &&
          collaboration.tag &&
          collaboration.summary &&
          collaboration.videoUrl,
      ),
    testimonials: (result?.testimonials ?? [])
      .map((testimonial) => ({
        body: cleanText(testimonial.body),
        author: cleanText(testimonial.author),
        role: cleanText(testimonial.role),
      }))
      .filter((testimonial) => testimonial.body && testimonial.author && testimonial.role),
    contact: {
      heading: cleanText(result?.contact?.heading),
      body: cleanText(result?.contact?.body),
      email: cleanText(result?.contact?.email),
      briefLabel: cleanText(result?.contact?.briefLabel),
      photoUrl: asUploadURL(result?.contact?.photo),
      name: cleanText(result?.contact?.name),
      title: cleanText(result?.contact?.title),
      directEmail: cleanText(result?.contact?.directEmail),
    },
    meta: {
      title: cleanText(result?.metaTitle) || DEFAULT_META.title,
      description: cleanText(result?.metaDescription) || DEFAULT_META.description,
      ogImage: ogImageUrl ? { url: ogImageUrl } : undefined,
      canonicalUrl: cleanText(result?.canonicalUrl),
    },
  };
});
