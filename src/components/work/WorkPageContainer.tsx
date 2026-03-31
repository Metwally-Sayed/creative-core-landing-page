"use client";

import { useState } from "react";

import WorkPageView from "@/components/work/WorkPageView";
import {
  workFilters,
  workProjects,
  type WorkFilter,
} from "@/lib/work-catalog";

export default function WorkPageContainer() {
  const [activeFilter, setActiveFilter] = useState<WorkFilter | null>(null);

  const filteredProjects = activeFilter
    ? workProjects.filter((project) => project.filters.includes(activeFilter))
    : workProjects;

  return (
    <WorkPageView
      activeFilter={activeFilter}
      filters={workFilters}
      projects={filteredProjects}
      onFilterChange={(filter) => {
        setActiveFilter((currentFilter) =>
          currentFilter === filter ? null : filter,
        );
      }}
    />
  );
}
