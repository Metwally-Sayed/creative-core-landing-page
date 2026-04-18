"use client";

import { useState } from "react";

import WorkPageView from "@/components/work/WorkPageView";
import type { ProjectSummary } from "@/lib/cms-projects";
import type { WorkPageFilter } from "@/lib/cms-work";
import type { HeroConfig } from "@/lib/hero-types";

type WorkPageContainerProps = {
  filters: WorkPageFilter[];
  projects: ProjectSummary[];
  hero: HeroConfig;
};

export default function WorkPageContainer({
  filters,
  projects,
  hero,
}: WorkPageContainerProps) {
  const [activeFilter, setActiveFilter] = useState<ProjectSummary["workFilters"][number] | null>(null);

  const filteredProjects = activeFilter
    ? projects.filter((project) => project.workFilters.includes(activeFilter))
    : projects;

  return (
    <WorkPageView
      activeFilter={activeFilter}
      filters={filters}
      projects={filteredProjects}
      hero={hero}
      onFilterChange={(filter) => {
        setActiveFilter((currentFilter) =>
          currentFilter === filter.value ? null : filter.value,
        );
      }}
    />
  );
}
