import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

import ProjectDetailContainer from "@/components/projects/ProjectDetailContainer";
import {
  getProjectDetailByParam,
  getProjectStaticParams,
} from "@/lib/cms-projects";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamicParams = true;
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return getProjectStaticParams();
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getProjectDetailByParam(id);

  if (!result) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${result.project.heroTitle} | Creative Core`,
    description: result.project.heroSummary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const result = await getProjectDetailByParam(id);

  if (result?.matchedByLegacyId) {
    permanentRedirect(`/projects/${result.canonicalSlug}`);
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <ProjectDetailContainer projectId={id} />
    </div>
  );
}
