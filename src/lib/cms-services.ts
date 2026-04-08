import "server-only";
import { draftMode } from "next/headers";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { asUploadURL, cleanText, type PayloadUploadDoc } from "./cms-mappers";

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
  hero: {
    title: string;
    body: string;
  };
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

  return {
    hero: {
      title: cleanText(result?.heroTitle),
      body: cleanText(result?.heroBody),
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
