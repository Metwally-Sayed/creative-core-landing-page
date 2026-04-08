import path from "path";
import { fileURLToPath } from "url";

import nextEnv from "@next/env";
import { getPayload } from "payload";

import { getProjectDetail, projects } from "../src/lib/project-catalog.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const { loadEnvConfig } = nextEnv;

loadEnvConfig(appRoot);

const defaultProcess = [
  {
    phase: "01",
    label: "Discovery",
    desc: "Understanding the core narrative, gathering requirements, and defining technical constraints.",
  },
  {
    phase: "02",
    label: "Design",
    desc: "Crafting the visual language, typography scales, interactions, and motion curves.",
  },
  {
    phase: "03",
    label: "Build",
    desc: "Developing the architecture and engineering the responsive frontend experience.",
  },
  {
    phase: "04",
    label: "Launch",
    desc: "Performance optimization, accessibility audits, scaling, and final deployment.",
  },
];

const defaultColors = [
  { hex: "#0a1b3f", name: "Deep Navy" },
  { hex: "#8ea2ff", name: "Periwinkle" },
  { hex: "#ffc39b", name: "Warm Peach" },
  { hex: "#f6f7ff", name: "Cloud White" },
];

const defaultTestimonials = [
  {
    quote:
      "Every interaction was thoughtfully considered. It's rare to see this level of craft and attention to detail.",
    author: "Jane Doe",
    role: "Creative Director",
  },
  {
    quote:
      "They didn't just understand the brief, they elevated it. The final product feels like absolute magic.",
    author: "John Smith",
    role: "Product Lead",
  },
  {
    quote:
      "The motion feels physically grounded yet entirely digital. It perfectly captures our brand ethos.",
    author: "Sarah Lee",
    role: "Founder",
  },
];

const workOverrides = {
  "11": {
    order: 0,
    filters: ["Products", "Experiences", "Branding"],
    featuredAspectRatio: "landscape",
  },
  "13": {
    order: 1,
    filters: ["Experiences", "Products"],
    featuredAspectRatio: "landscape",
  },
  "8": {
    order: 2,
    filters: ["Products", "Experiences"],
    featuredAspectRatio: "portrait",
  },
  "17": {
    order: 3,
    filters: ["Branding", "Products"],
    featuredAspectRatio: "portrait",
  },
  "14": {
    order: 4,
    filters: ["Experiences"],
    featuredAspectRatio: "landscape",
  },
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function deriveWorkFilters(project, workProject) {
  if (workProject?.filters?.length) {
    return workProject.filters;
  }

  return ["Products", "Experiences", "Branding"].filter((filter) =>
    project.tags.includes(filter),
  );
}

function deriveSortOrder(project) {
  const override = workOverrides[project.id];

  return override?.order ?? Number(project.id) + 100;
}

function resolvePublicFile(sourcePath) {
  return path.resolve(appRoot, "public", sourcePath.replace(/^\//, ""));
}

async function ensureMedia(payload, existingMediaBySource, sourcePath, alt) {
  const existing = existingMediaBySource.get(sourcePath);

  if (existing) {
    return existing.id;
  }

  const created = await payload.create({
    collection: "media",
    data: {
      alt,
      caption: sourcePath,
    },
    filePath: resolvePublicFile(sourcePath),
  });

  existingMediaBySource.set(sourcePath, created);

  return created.id;
}

async function seed() {
  const { default: config } = await import("./payload.seed-config.mts");
  const payload = await getPayload({ config });
  const [existingProjects, existingMedia] = await Promise.all([
    payload.find({
      collection: "projects",
      limit: 200,
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: "media",
      limit: 200,
      pagination: false,
      depth: 0,
    }),
  ]);

  const existingProjectsByLegacyId = new Map(
    existingProjects.docs
      .filter((doc) => doc.legacyId)
      .map((doc) => [String(doc.legacyId), doc]),
  );
  const existingMediaBySource = new Map(
    existingMedia.docs
      .filter((doc) => doc.caption)
      .map((doc) => [String(doc.caption), doc]),
  );
  const seededProjectIds = new Map();
  const relatedProjectIds = new Map();

  for (const project of projects) {
    const detail = getProjectDetail(project.id);

    if (!detail) {
      continue;
    }

    const workProject = workOverrides[project.id];
    const existing = existingProjectsByLegacyId.get(project.id);
    const slug = existing?.slug || slugify(project.title);

    const imageId = await ensureMedia(payload, existingMediaBySource, project.image, project.title);
    const primaryShowcaseImageId = await ensureMedia(
      payload,
      existingMediaBySource,
      detail.primaryShowcase.src,
      detail.primaryShowcase.alt,
    );

    const sectionImageIds = await Promise.all(
      detail.sections.map((section) =>
        ensureMedia(payload, existingMediaBySource, section.image, section.imageAlt),
      ),
    );
    const galleryImageIds = await Promise.all(
      detail.gallery.map((image) =>
        ensureMedia(payload, existingMediaBySource, image.src, image.alt),
      ),
    );

    const data = {
      _status: "published",
      title: project.title,
      slug,
      legacyId: project.id,
      tags: project.tags.map((label) => ({ label })),
      workFilters: deriveWorkFilters(project, workProject),
      image: imageId,
      aspectRatio: project.aspectRatio,
      featuredAspectRatio: workProject?.featuredAspectRatio ?? project.aspectRatio,
      sortOrder: deriveSortOrder(project),
      heroLabel: detail.heroLabel,
      heroTitle: detail.heroTitle,
      heroSubtitle: detail.heroSubtitle,
      heroSummary: detail.heroSummary,
      launchUrl: "",
      introMeta: detail.introMeta,
      overview: detail.overview,
      intro: detail.intro.map((paragraph) => ({ paragraph })),
      primaryShowcase: {
        image: primaryShowcaseImageId,
        alt: detail.primaryShowcase.alt,
        label: detail.primaryShowcase.label,
      },
      process: defaultProcess,
      sections: detail.sections.map((section, index) => ({
        eyebrow: section.eyebrow,
        title: section.title,
        body: section.body.map((paragraph) => ({ paragraph })),
        image: sectionImageIds[index],
        imageAlt: section.imageAlt,
        imageLayout: section.imageLayout,
        tone: section.tone ?? "light",
      })),
      impactMetrics: detail.impactMetrics,
      gallery: detail.gallery.map((image, index) => ({
        image: galleryImageIds[index],
        alt: image.alt,
        label: image.label,
      })),
      testimonials: defaultTestimonials,
      colors: defaultColors,
      credits: detail.credits,
      publishedAt: existing?.publishedAt ?? new Date().toISOString(),
    };

    const saved = existing
      ? await payload.update({
          collection: "projects",
          id: existing.id,
          data,
        })
      : await payload.create({
          collection: "projects",
          data,
        });

    seededProjectIds.set(project.id, saved.id);
    relatedProjectIds.set(project.id, detail.relatedIds);
  }

  for (const [legacyId, relatedIds] of relatedProjectIds.entries()) {
    const projectID = seededProjectIds.get(legacyId);

    if (!projectID) {
      continue;
    }

    await payload.update({
      collection: "projects",
      id: projectID,
      data: {
        relatedProjects: relatedIds
          .map((relatedId) => seededProjectIds.get(relatedId))
          .filter(Boolean),
      },
    });
  }

  await payload.db.destroy();
  console.log(`Seeded ${seededProjectIds.size} projects into Payload.`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
