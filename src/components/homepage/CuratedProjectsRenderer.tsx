import { getHomepageProjects } from "@/lib/cms-projects";
import type { HomepageBlock } from "@/lib/cms-homepage";
import Projects from "@/components/sections/Projects";

interface CuratedProjectsRendererProps {
  block: HomepageBlock;
  mergeTopBackground?: boolean;
}

export default async function CuratedProjectsRenderer({ block, mergeTopBackground }: CuratedProjectsRendererProps) {
  const projects = await getHomepageProjects(block.projectIds, block.maxItems);
  return (
    <Projects
      projects={projects}
      eyebrow={block.eyebrow}
      heading={block.heading}
      body={block.body}
      filterLabels={block.filterLabels}
      emptyStateText={block.emptyStateText}
      mergeTopBackground={mergeTopBackground}
    />
  );
}
