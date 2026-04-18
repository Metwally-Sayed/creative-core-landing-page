import "server-only";
import { draftMode } from "next/headers";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { asUploadURL, cleanText, type PayloadUploadDoc } from "./cms-mappers";
import type { HeroConfig } from "./hero-types";

const getPayloadClient = cache(async () => getPayload({ config }));

type UploadValue = number | string | PayloadUploadDoc | null | undefined;

type AboutDoc = {
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
  jumpLinks?: Array<{
    label?: string | null;
    href?: string | null;
  }> | null;
  locations?: Array<{
    city?: string | null;
    mapUrl?: string | null;
    address?: string | null;
    email?: string | null;
  }> | null;
  codeOfHonor?: {
    eyebrow?: string | null;
    title?: string | null;
    body?: string | null;
    items?: Array<{
      itemId?: string | null;
      index?: string | null;
      title?: string | null;
      body?: string | null;
      art?: string | null;
    }> | null;
  } | null;
  mondayteers?: {
    eyebrow?: string | null;
    title?: string | null;
    body?: string | null;
    team?: Array<{
      name?: string | null;
      city?: string | null;
      role?: string | null;
      art?: string | null;
      accentLabel?: string | null;
    }> | null;
  } | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: UploadValue;
  canonicalUrl?: string | null;
};

export type AboutPageData = {
  hero: HeroConfig;
  jumpLinks: Array<{ label: string; href: string }>;
  locations: Array<{
    city: string;
    address: string[];
    email: string;
    href: string;
  }>;
  codeOfHonor: { eyebrow: string; title: string; body: string };
  codeOfHonorItems: Array<{
    id: string;
    index: string;
    title: string;
    body: string;
    art:
      | "be-nice"
      | "powers-for-good"
      | "try-the-truth"
      | "enjoy-the-ride"
      | "speak-up-and-listen"
      | "solve-the-problem"
      | "help-each-other"
      | "team-up";
  }>;
  mondayteersIntro: { eyebrow: string; title: string; body: string };
  team: Array<{
    name: string;
    city: string;
    role: string;
    art: string;
    accentLabel: string;
  }>;
  meta: {
    title: string;
    description: string;
    ogImage?: { url: string };
    canonicalUrl: string;
  };
};

const DEFAULT_META: AboutPageData["meta"] = {
  title: "About | Hello Monday / Dept.",
  description: "Who we are, where we work, study of motion, and humanity.",
  canonicalUrl: "",
};

const CODE_OF_HONOR_ART_VALUES = new Set<AboutPageData["codeOfHonorItems"][number]["art"]>([
  "be-nice",
  "powers-for-good",
  "try-the-truth",
  "enjoy-the-ride",
  "speak-up-and-listen",
  "solve-the-problem",
  "help-each-other",
  "team-up",
]);

export const getAboutPageData = cache(async (): Promise<AboutPageData> => {
  const { isEnabled: preview } = await draftMode();
  const payload = await getPayloadClient();
  const result = (await payload.findGlobal({
    slug: "aboutPage",
    depth: 2,
    draft: preview,
  })) as AboutDoc | null;

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
    jumpLinks: (result?.jumpLinks ?? [])
      .map((link) => ({
        label: cleanText(link.label),
        href: cleanText(link.href),
      }))
      .filter((link) => link.label && link.href),
    locations: (result?.locations ?? [])
      .map((location) => {
        const address = cleanText(location.address)
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        return {
          city: cleanText(location.city),
          address,
          email: cleanText(location.email) || "hello@hellomonday.com",
          href: cleanText(location.mapUrl),
        };
      })
      .filter((location) => location.city && location.address.length > 0 && location.href),
    codeOfHonor: {
      eyebrow: cleanText(result?.codeOfHonor?.eyebrow),
      title: cleanText(result?.codeOfHonor?.title),
      body: cleanText(result?.codeOfHonor?.body),
    },
    codeOfHonorItems: (result?.codeOfHonor?.items ?? [])
      .map((item) => ({
        id: cleanText(item.itemId),
        index: cleanText(item.index),
        title: cleanText(item.title),
        body: cleanText(item.body),
        art: cleanText(item.art),
      }))
      .filter(
        (
          item,
        ): item is {
          id: string;
          index: string;
          title: string;
          body: string;
          art: AboutPageData["codeOfHonorItems"][number]["art"];
        } =>
          item.id &&
          item.index &&
          item.title &&
          item.body &&
          CODE_OF_HONOR_ART_VALUES.has(
            item.art as AboutPageData["codeOfHonorItems"][number]["art"],
          ),
      ),
    mondayteersIntro: {
      eyebrow: cleanText(result?.mondayteers?.eyebrow),
      title: cleanText(result?.mondayteers?.title),
      body: cleanText(result?.mondayteers?.body),
    },
    team: (result?.mondayteers?.team ?? [])
      .map((member) => ({
        name: cleanText(member.name),
        city: cleanText(member.city),
        role: cleanText(member.role),
        art: cleanText(member.art),
        accentLabel: cleanText(member.accentLabel),
      }))
      .filter(
        (member) =>
          member.name &&
          member.city &&
          member.role &&
          member.art &&
          member.accentLabel,
      ),
    meta: {
      title: cleanText(result?.metaTitle) || DEFAULT_META.title,
      description: cleanText(result?.metaDescription) || DEFAULT_META.description,
      ogImage: ogImageUrl ? { url: ogImageUrl } : undefined,
      canonicalUrl: cleanText(result?.canonicalUrl),
    },
  };
});
