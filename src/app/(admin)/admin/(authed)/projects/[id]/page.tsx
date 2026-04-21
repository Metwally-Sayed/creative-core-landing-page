import { notFound } from "next/navigation";
import { getProject, listProjects } from "../actions";
import ProjectEditor from "./ProjectEditor";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProjectEditPage({ params }: Props) {
  const { id } = await params;
  const [project, allProjects] = await Promise.all([
    getProject(id).catch(() => null),
    listProjects(),
  ]);

  if (!project) notFound();

  return (
    <ProjectEditor
      project={project}
      allProjects={allProjects}
    />
  );
}
