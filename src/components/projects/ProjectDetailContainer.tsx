import ProjectDetailView from "@/components/projects/ProjectDetailView";
import { getRelatedProjects, dbFullToLegacy, dbSummaryToLegacy } from "@/lib/project-data";
import { getTags } from "@/lib/tags-data";
import type { ProjectFullDb } from "@/lib/project-data";

type Props = { project: ProjectFullDb; locale: string };

export default async function ProjectDetailContainer({ project, locale }: Props) {
  const [relatedSummariesDb, allTags] = await Promise.all([
    getRelatedProjects(project.related_ids),
    getTags(),
  ]);

  const legacyProject = dbFullToLegacy(project, locale);
  const relatedProjects = relatedSummariesDb.map(dbSummaryToLegacy);

  // Resolve tags: map slugs/old-format titles → localized labels, deduplicate by slug
  const tagBySlug = new Map(allTags.map((t) => [t.slug, t]));
  const tagByTitle = new Map(allTags.map((t) => [t.title_en.toLowerCase(), t]));
  const seenSlugs = new Set<string>();
  legacyProject.tags = legacyProject.tags
    .map((raw) => {
      const tag = tagBySlug.get(raw) ?? tagByTitle.get(raw.toLowerCase());
      if (!tag || seenSlugs.has(tag.slug)) return null;
      seenSlugs.add(tag.slug);
      return locale === "ar" && tag.title_ar ? tag.title_ar : tag.title_en;
    })
    .filter((v): v is string => v !== null);

  return <ProjectDetailView project={legacyProject} relatedProjects={relatedProjects} />;
}
