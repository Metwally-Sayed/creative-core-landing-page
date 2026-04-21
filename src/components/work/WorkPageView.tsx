"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import LiquidCard from "@/components/LiquidCard";
import { cn } from "@/lib/utils";
import type { WorkFilter, WorkProject } from "@/lib/work-catalog";

type WorkPageViewProps = {
  activeFilter: WorkFilter | null;
  filters: WorkFilter[];
  projects: WorkProject[];
  onFilterChange: (filter: WorkFilter) => void;
};

const aspectRatioClassMap = {
  landscape: "aspect-[1.28/1]",
  portrait: "aspect-[0.74/1]",
  square: "aspect-square",
} as const;

function FilterButton({
  active,
  filter,
  onClick,
}: {
  active: boolean;
  filter: WorkFilter;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "text-start text-[0.82rem] leading-none transition-colors duration-200",
        active ? "text-[#151515]" : "text-[#8f8a80] hover:text-[#151515]",
      )}
    >
      {filter}
    </button>
  );
}

function WorkProjectCard({
  project,
  featured = false,
}: {
  project: WorkProject;
  featured?: boolean;
}) {
  const aspectRatio = featured
    ? project.featuredAspectRatio
    : project.aspectRatio;

  return (
    <article className="group">
      <Link href={`/projects/${project.id}`} className="block">
        <LiquidCard
          aspectRatio={aspectRatioClassMap[aspectRatio]}
          className="border border-black/5 bg-[#fdfbf7] shadow-[0_18px_36px_rgba(22,20,16,0.06)]"
        >
          <div className="absolute inset-0 bg-[#f5f1ea]" />
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={project.image}
              alt={project.title}
              fill
              loading={featured ? "eager" : "lazy"}
              sizes={
                featured
                  ? "(max-width: 1279px) 100vw, 30vw"
                  : "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 30vw"
              }
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.04)_100%)]" />
        </LiquidCard>

        <div className="pt-4 md:pt-5">
          <h2 className="max-w-[16ch] font-serif text-[1.95rem] leading-[0.94] tracking-[-0.045em] text-[#171512] transition-opacity duration-300 group-hover:opacity-70 md:text-[2.2rem]">
            {project.title}
          </h2>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={`${project.id}-${tag}`}
                className="text-[0.66rem] leading-none text-[#b3aea6] underline decoration-[#ddd6cb] underline-offset-[5px]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}

function MobileWorkGrid({ projects }: { projects: WorkProject[] }) {
  return (
    <div className="grid gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-16 lg:hidden">
      {projects.map((project) => (
        <WorkProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function DesktopFeaturedGrid({ projects }: { projects: WorkProject[] }) {
  const primary = projects[0];
  const secondary = projects[1];
  const portrait = projects[2];
  const lowerLeft = projects[3];
  const lowerMiddle = projects[4];

  return (
    <div className="hidden lg:grid lg:grid-cols-3 lg:gap-x-16 lg:gap-y-[4.5rem]">
      <div className="space-y-[4.5rem]">
        {primary ? <WorkProjectCard project={primary} featured /> : null}
        {lowerLeft ? <WorkProjectCard project={lowerLeft} featured /> : null}
      </div>

      <div className="space-y-[4.5rem]">
        {secondary ? <WorkProjectCard project={secondary} featured /> : null}
        {lowerMiddle ? <WorkProjectCard project={lowerMiddle} featured /> : null}
      </div>

      <div>{portrait ? <WorkProjectCard project={portrait} featured /> : null}</div>
    </div>
  );
}

function DesktopProjectGrid({ projects }: { projects: WorkProject[] }) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="hidden gap-x-16 gap-y-20 lg:grid lg:grid-cols-3">
      {projects.map((project) => (
        <WorkProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export default function WorkPageView({
  activeFilter,
  filters,
  projects,
  onFilterChange,
}: WorkPageViewProps) {
  const t = useTranslations("work");
  const canUseFeaturedLayout = projects.length >= 5;
  const featuredProjects = canUseFeaturedLayout ? projects.slice(0, 5) : [];
  const remainingProjects = canUseFeaturedLayout ? projects.slice(5) : projects;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f6f3ed_0%,#fbf9f5_24%,#f4f0e9_100%)] text-[#171512]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),rgba(255,255,255,0))]"
      />

      <div className="mx-auto max-w-[1450px] px-6 pb-24 pt-[8.5rem] md:px-10 md:pb-[7.5rem] md:pt-40 lg:px-16 lg:pb-36 lg:pt-[10.5rem]">
        <div className="mb-14 grid gap-5 md:mb-[4.5rem] md:grid-cols-[6rem_1fr] md:items-start lg:grid-cols-[minmax(0,1fr)_6rem_15rem]">
          <div className="hidden lg:block" />

          <p className="text-[0.76rem] leading-none text-[#999286]">{t("filterLabel")}</p>

          <div className="flex flex-col items-start gap-2">
            {filters.map((filter) => (
              <FilterButton
                key={filter}
                active={activeFilter === filter}
                filter={filter}
                onClick={() => onFilterChange(filter)}
              />
            ))}
          </div>
        </div>

        <MobileWorkGrid projects={projects} />

        {canUseFeaturedLayout ? (
          <div className="hidden lg:block">
            <DesktopFeaturedGrid projects={featuredProjects} />
            <div className="mt-20">
              <DesktopProjectGrid projects={remainingProjects} />
            </div>
          </div>
        ) : (
          <DesktopProjectGrid projects={projects} />
        )}
      </div>
    </section>
  );
}
