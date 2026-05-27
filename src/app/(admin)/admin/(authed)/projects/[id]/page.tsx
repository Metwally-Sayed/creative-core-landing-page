import { notFound } from "next/navigation";
import { getProject, listProjects } from "../actions";
import { listTags } from "../../tags/actions";
import ProjectEditor from "./ProjectEditor";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProjectEditPage({ params }: Props) {
  const { id } = await params;
  const [project, allProjects, allTags] = await Promise.all([
    getProject(id).catch(() => null),
    listProjects(),
    listTags(),
  ]);

  if (!project) notFound();

  return (
    <ProjectEditor
      project={project}
      allProjects={allProjects}
      allTags={allTags}
    />
  );
}
