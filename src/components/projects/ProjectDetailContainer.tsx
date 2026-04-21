import ProjectDetailView from "@/components/projects/ProjectDetailView";
import { getRelatedProjects, dbFullToLegacy, dbSummaryToLegacy } from "@/lib/project-data";
import type { ProjectFullDb } from "@/lib/project-data";

type Props = { project: ProjectFullDb; locale: string };

export default async function ProjectDetailContainer({ project, locale }: Props) {
  const relatedSummariesDb = await getRelatedProjects(project.related_ids);
  const legacyProject = dbFullToLegacy(project, locale);
  const relatedProjects = relatedSummariesDb.map(dbSummaryToLegacy);

  return <ProjectDetailView project={legacyProject} relatedProjects={relatedProjects} />;
}
