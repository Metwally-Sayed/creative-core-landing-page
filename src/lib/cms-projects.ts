import "server-only";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";

import { 
  type PayloadProjectDoc,
  type ProjectSummary,
  type ProjectDetail,
  type WorkFilter,
  mapSummary,
  mapDetail,
} from "./cms-mappers";

const getPayloadClient = cache(async () => getPayload({ config }));

type PublishableProjectDoc = PayloadProjectDoc & {
  _status?: "draft" | "published" | null;
  publishedAt?: string | null;
};

function isPublishedProject(doc: PublishableProjectDoc) {
  return doc._status === "published" || Boolean(doc.publishedAt);
}

const getPublishedProjects = cache(async () => {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "projects",
    depth: 2,
    limit: 100,
    pagination: false,
    sort: "sortOrder",
  });

  return (result.docs as PublishableProjectDoc[]).filter(isPublishedProject);
});

export async function getHomepageProjects(projectIds?: string[], maxItems?: number) {
  const docs = await getPublishedProjects();
  const summaries = docs.map((doc) => mapSummary(doc));

  const ordered =
    projectIds && projectIds.length > 0
      ? projectIds
          .map((projectId) => summaries.find((project) => project.id === projectId))
          .filter((project): project is ProjectSummary => Boolean(project))
      : summaries;

  if (typeof maxItems === "number" && maxItems > 0) {
    return ordered.slice(0, maxItems);
  }

  return ordered;
}

export async function getWorkPageProjects() {
  const docs = await getPublishedProjects();
  const workFilters: WorkFilter[] = ["Products", "Experiences", "Branding"];

  return {
    filters: workFilters,
    projects: docs
      .map((doc) => mapSummary(doc))
      .filter((project) => project.workFilters.length > 0),
  };
}

export async function getProjectDetailByParam(param: string) {
  const docs = await getPublishedProjects();

  const matchedDoc = docs.find(
    (doc) => doc.slug === param || doc.legacyId === param,
  );

  if (!matchedDoc) {
    return null;
  }

  const relatedDocs = (matchedDoc.relatedProjects ?? [])
    .map((item) => (typeof item === "object" ? item : null))
    .filter((item) => Boolean(item));

  return {
    project: mapDetail(matchedDoc),
    relatedProjects: relatedDocs.map((doc) => mapSummary(doc as PayloadProjectDoc)),
    canonicalSlug: matchedDoc.slug,
    matchedByLegacyId: matchedDoc.legacyId === param && matchedDoc.slug !== param,
  };
}

export async function getProjectStaticParams() {
  const docs = await getPublishedProjects();

  return docs.flatMap((doc) => {
    const params = [{ id: doc.slug }];

    if (doc.legacyId && doc.legacyId !== doc.slug) {
      params.push({ id: doc.legacyId });
    }

    return params;
  });
}

// Re-export types that other server components might need
export type { ProjectDetail, ProjectSummary, WorkFilter };
