import { notFound } from "next/navigation";

import ProjectDetailView from "@/components/projects/ProjectDetailView";
import { getProjectDetail, getRelatedProjects } from "@/lib/project-catalog";

type ProjectDetailContainerProps = {
  projectId: string;
};

export default function ProjectDetailContainer({
  projectId,
}: ProjectDetailContainerProps) {
  const project = getProjectDetail(projectId);

  if (!project) {
    notFound();
  }

  const relatedProjects = getRelatedProjects(projectId);

  return <ProjectDetailView project={project} relatedProjects={relatedProjects} />;
}
