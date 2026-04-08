import type { Metadata } from "next";
import { getWorkPageCMSData } from "@/lib/cms-work";
import { getWorkPageProjects } from "@/lib/cms-projects";
import WorkPageContainer from "@/components/work/WorkPageContainer";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getWorkPageCMSData();
  const { meta } = data;

  return {
    title: meta?.title || "Work | Hello Monday / Dept.",
    description: meta?.description || "An editorial grid of selected Hello Monday projects.",
    openGraph: meta?.ogImage ? {
      images: [meta.ogImage.url],
    } : undefined,
    alternates: meta?.canonicalUrl ? {
      canonical: meta.canonicalUrl,
    } : undefined,
  };
}

export default async function WorkPage() {
  const cmsData = await getWorkPageCMSData();
  const { projects } = await getWorkPageProjects();
  const featuredIds = new Set(cmsData.featuredProjectIds);
  const used = new Set<string>();

  const featured = cmsData.featuredProjectIds
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is (typeof projects)[number] => Boolean(project))
    .filter((project) => {
      if (used.has(project.id)) {
        return false;
      }
      used.add(project.id);
      return true;
    });

  const remaining = projects.filter((project) => !featuredIds.has(project.id));
  const orderedProjects = [...featured, ...remaining];

  return (
    <div className="min-h-screen overflow-x-clip bg-transparent text-foreground">
      <WorkPageContainer 
        filters={cmsData.filterLabels}
        projects={orderedProjects}
        heroTitle={cmsData.hero.title}
        heroBody={cmsData.hero.body}
      />
    </div>
  );
}
