import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import ProjectDetailContainer from "@/components/projects/ProjectDetailContainer";
import { locales } from "@/i18n/config";
import { getProjectDetail, projects } from "@/lib/project-catalog";

type ProjectPageProps = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    projects.map((p) => ({ lang, id: p.id })),
  );
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
  const { lang, id } = await params;
  setRequestLocale(lang);

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <ProjectDetailContainer projectId={id} />
    </div>
  );
}
