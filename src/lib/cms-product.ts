import "server-only";
import { draftMode } from "next/headers";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { asUploadURL, cleanText, type PayloadUploadDoc } from "./cms-mappers";

const getPayloadClient = cache(async () => getPayload({ config }));

type UploadValue = number | string | PayloadUploadDoc | null | undefined;

type ProductDoc = {
  heroVideoUrl?: string | null;
  heroTitleLines?: Array<{ line?: string | null }> | null;
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
  hero: {
    videoUrl: string;
    titleLines: string[];
  };
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

  return {
    hero: {
      videoUrl: cleanText(result?.heroVideoUrl),
      titleLines: (result?.heroTitleLines ?? [])
        .map((line) => cleanText(line.line))
        .filter(Boolean),
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
