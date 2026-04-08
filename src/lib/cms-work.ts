import "server-only";
import { draftMode } from "next/headers";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { asUploadURL, cleanText, type PayloadUploadDoc, type WorkFilter } from "./cms-mappers";

type UploadValue = number | string | PayloadUploadDoc | null | undefined;

const getPayloadClient = cache(async () => getPayload({ config }));

type WorkDoc = {
  heroTitle?: string | null;
  heroBody?: string | null;
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
  hero: {
    title: string;
    body: string;
  };
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

  return {
    hero: {
      title: cleanText(result?.heroTitle),
      body: cleanText(result?.heroBody),
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
