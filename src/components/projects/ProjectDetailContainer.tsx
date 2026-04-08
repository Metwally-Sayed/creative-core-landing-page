import { notFound } from "next/navigation";

import ProjectDetailView from "@/components/projects/ProjectDetailView";
import { getProjectDetailByParam } from "@/lib/cms-projects";

type ProjectDetailContainerProps = {
  projectId: string;
};

export default async function ProjectDetailContainer({
  projectId,
}: ProjectDetailContainerProps) {
  const result = await getProjectDetailByParam(projectId);

  if (!result) {
    notFound();
  }

  return (
    <ProjectDetailView
      project={result.project}
      relatedProjects={result.relatedProjects}
    />
  );
}
