import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import ProjectDetailContainer from "@/components/projects/ProjectDetailContainer";
import { locales } from "@/i18n/config";
import { getProject, getProjects } from "@/lib/project-data";

export const revalidate = 60;
export const dynamicParams = true;

type ProjectPageProps = {
  params: Promise<{ lang: string; id: string }>;
};

export async function generateStaticParams() {
  const projects = await getProjects();
  return locales.flatMap((lang) =>
    projects.map((p) => ({ lang, id: p.slug }))
  );
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.hero_title || project.title} | Creative Core`,
    description: project.hero_summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { lang, id } = await params;
  setRequestLocale(lang);
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <ProjectDetailContainer project={project} locale={lang} />
    </div>
  );
}
