"use client";

import { useState } from "react";

import WorkPageView from "@/components/work/WorkPageView";
import type { ProjectSummary } from "@/lib/cms-projects";
import type { WorkPageFilter } from "@/lib/cms-work";

type WorkPageContainerProps = {
  filters: WorkPageFilter[];
  projects: ProjectSummary[];
  heroTitle?: string;
  heroBody?: string;
};

export default function WorkPageContainer({
  filters,
  projects,
  heroTitle,
  heroBody,
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
      heroTitle={heroTitle}
      heroBody={heroBody}
      onFilterChange={(filter) => {
        setActiveFilter((currentFilter) =>
          currentFilter === filter.value ? null : filter.value,
        );
      }}
    />
  );
}
