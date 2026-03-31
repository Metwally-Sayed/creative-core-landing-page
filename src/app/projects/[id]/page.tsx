import type { Metadata } from "next";

import ProjectDetailContainer from "@/components/projects/ProjectDetailContainer";
import { getProjectDetail, projectIds } from "@/lib/project-catalog";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateStaticParams() {
  return projectIds.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectDetail(id);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.heroTitle} | Hello Monday`,
    description: project.heroSummary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <ProjectDetailContainer projectId={id} />
    </div>
  );
}
