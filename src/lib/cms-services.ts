import "server-only";
import { draftMode } from "next/headers";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { asUploadURL, cleanText, type PayloadUploadDoc } from "./cms-mappers";
import type { HeroConfig } from "./hero-types";

const getPayloadClient = cache(async () => getPayload({ config }));

type UploadValue = number | string | PayloadUploadDoc | null | undefined;

type ServicesSectionCard = {
  title?: string | null;
  subtitle?: string | null;
  art?: string | null;
};

type ServicesSection = {
  sectionId?: string | null;
  eyebrow?: string | null;
  title?: string | null;
  body?: string | null;
  linkLabel?: string | null;
  illustration?: string | null;
  cards?: ServicesSectionCard[] | null;
};

type ServicesDoc = {
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
  serviceSections?: ServicesSection[] | null;
  shinyThings?: {
    eyebrow?: string | null;
    title?: string | null;
    body?: string | null;
  } | null;
  awardColumns?: Array<{
    awards?: Array<{
      label?: string | null;
      value?: string | null;
    }> | null;
  }> | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: UploadValue;
  canonicalUrl?: string | null;
};

export type ServicesPageData = {
  hero: HeroConfig;
  sections: Array<{
    id: string;
    eyebrow: string;
    title: string;
    body: string;
    linkLabel: string;
    illustration: string;
    cards: Array<{
      title: string;
      subtitle: string;
      art: string;
    }>;
  }>;
  shinyThings: {
    eyebrow: string;
    title: string;
    body: string;
  };
  awardColumns: Array<Array<{ label: string; value: string }>>;
  meta: {
    title: string;
    description: string;
    ogImage?: { url: string };
    canonicalUrl: string;
  };
};

const DEFAULT_META: ServicesPageData["meta"] = {
  title: "Services | Hello Monday / Dept.",
  description: "What we do: products, experiences, branding, and the shiny things that follow.",
  canonicalUrl: "",
};

export const getServicesPageData = cache(async (): Promise<ServicesPageData> => {
  const { isEnabled: preview } = await draftMode();
  const payload = await getPayloadClient();
  const result = (await payload.findGlobal({
    slug: "servicesPage",
    depth: 2,
    draft: preview,
  })) as ServicesDoc | null;

  const sections = (result?.serviceSections ?? [])
    .map((section) => {
      const cards = (section.cards ?? [])
        .map((card) => ({
          title: cleanText(card.title),
          subtitle: cleanText(card.subtitle),
          art: cleanText(card.art),
        }))
        .filter((card) => card.title && card.subtitle && card.art);

      return {
        id: cleanText(section.sectionId),
        eyebrow: cleanText(section.eyebrow),
        title: cleanText(section.title),
        body: cleanText(section.body),
        linkLabel: cleanText(section.linkLabel),
        illustration: cleanText(section.illustration),
        cards,
      };
    })
    .filter(
      (section) =>
        section.id &&
        section.eyebrow &&
        section.title &&
        section.body &&
        section.linkLabel &&
        section.illustration &&
        section.cards.length > 0,
    );

  const awardColumns = (result?.awardColumns ?? [])
    .map((column) =>
      (column.awards ?? [])
        .map((award) => ({
          label: cleanText(award.label),
          value: cleanText(award.value),
        }))
        .filter((award) => award.label && award.value),
    )
    .filter((column) => column.length > 0);
  const normalizedAwardColumns =
    awardColumns.length >= 2
      ? awardColumns.slice(0, 2)
      : awardColumns.length === 1
        ? [awardColumns[0], awardColumns[0]]
        : [[], []];

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
    sections,
    shinyThings: {
      eyebrow: cleanText(result?.shinyThings?.eyebrow),
      title: cleanText(result?.shinyThings?.title),
      body: cleanText(result?.shinyThings?.body),
    },
    awardColumns: normalizedAwardColumns,
    meta: {
      title: cleanText(result?.metaTitle) || DEFAULT_META.title,
      description: cleanText(result?.metaDescription) || DEFAULT_META.description,
      ogImage: ogImageUrl ? { url: ogImageUrl } : undefined,
      canonicalUrl: cleanText(result?.canonicalUrl),
    },
  };
});
