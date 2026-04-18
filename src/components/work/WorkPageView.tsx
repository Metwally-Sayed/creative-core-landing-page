"use client";

import Image from "next/image";
import Link from "next/link";

import LiquidCard from "@/components/LiquidCard";
import type { ProjectSummary } from "@/lib/cms-projects";
import type { WorkPageFilter } from "@/lib/cms-work";
import type { HeroConfig } from "@/lib/hero-types";
import { cn } from "@/lib/utils";
import CreativeHero from "@/components/sections/CreativeHero";

type WorkPageViewProps = {
  activeFilter: ProjectSummary["workFilters"][number] | null;
  filters: WorkPageFilter[];
  projects: ProjectSummary[];
  onFilterChange: (filter: WorkPageFilter) => void;
  hero: HeroConfig;
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
  filter: WorkPageFilter;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "text-left text-[0.82rem] leading-none transition-colors duration-200",
        active
          ? "text-[hsl(var(--accent))]"
          : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--accent))]",
      )}
    >
      {filter.label}
    </button>
  );
}

function WorkProjectCard({
  project,
  featured = false,
}: {
  project: ProjectSummary;
  featured?: boolean;
}) {
  const aspectRatio = featured
    ? project.featuredAspectRatio
    : project.aspectRatio;

  return (
    <article className="group">
      <Link href={`/projects/${project.slug}`} className="block">
        <LiquidCard
          aspectRatio={aspectRatioClassMap[aspectRatio]}
          className="border border-[hsl(var(--border)/0.55)] bg-[hsl(var(--card))] shadow-[var(--shadow-soft)]"
        >
          <div className="absolute inset-0 bg-[hsl(var(--background))]" />
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
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,hsl(var(--background)/0.12)_100%)]" />
        </LiquidCard>

        <div className="pt-4 md:pt-5">
          <h2 className="max-w-[16ch] font-serif text-[1.95rem] leading-[0.94] tracking-[-0.045em] text-[hsl(var(--accent))] transition-opacity duration-300 group-hover:opacity-70 md:text-[2.2rem]">
            {project.title}
          </h2>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={`${project.id}-${tag}`}
                className="text-[0.66rem] leading-none text-[hsl(var(--muted-foreground))] underline decoration-[hsl(var(--border))] underline-offset-[5px]"
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

function MobileWorkGrid({ projects }: { projects: ProjectSummary[] }) {
  return (
    <div className="grid gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-16 lg:hidden">
      {projects.map((project) => (
        <WorkProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function DesktopFeaturedGrid({ projects }: { projects: ProjectSummary[] }) {
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

function DesktopProjectGrid({ projects }: { projects: ProjectSummary[] }) {
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
  hero,
}: WorkPageViewProps) {
  const canUseFeaturedLayout = projects.length >= 5;
  const featuredProjects = canUseFeaturedLayout ? projects.slice(0, 5) : [];
  const remainingProjects = canUseFeaturedLayout ? projects.slice(5) : projects;

  const currentTitle = hero.current?.title ?? "";
  const currentBody = hero.current?.body ?? "";

  return (
    <section className="relative overflow-x-clip overflow-y-visible bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,hsl(var(--secondary)/0.16),rgba(255,255,255,0))]"
      />

      {hero.isVisible ? (
        hero.variant === "creative" && hero.creative ? (
          <CreativeHero id="work" config={hero.creative} />
        ) : null
      ) : null}

      <div className="mx-auto max-w-[1450px] px-5 pb-16 pt-[7.4rem] sm:px-6 md:px-10 md:pb-24 md:pt-30 lg:px-16 lg:pb-36 lg:pt-[10.5rem]">
        {hero.isVisible && hero.variant !== "creative" ? (
          <div className="mb-14 grid gap-8 md:mb-16 md:gap-10 lg:mb-20 lg:grid-cols-[1fr_minmax(24rem,0.95fr)] lg:items-end lg:gap-x-16">
            <h1 className="font-serif text-[clamp(2.8rem,13vw,8.4rem)] leading-[0.9] tracking-[-0.07em] text-[hsl(var(--accent))]">
              {currentTitle}
            </h1>
            <p className="max-w-[36rem] pb-1 text-[clamp(1.05rem,4.8vw,2.15rem)] leading-[1.28] tracking-[-0.02em] text-[hsl(var(--foreground)/0.78)] md:pb-2">
              {currentBody}
            </p>
          </div>
        ) : null}

        <div className="mb-10 grid gap-4 md:mb-[4.5rem] md:grid-cols-[6rem_1fr] md:items-start lg:grid-cols-[minmax(0,1fr)_6rem_15rem]">
          <div className="hidden lg:block" />

          <p className="text-[0.76rem] leading-none text-[hsl(var(--muted-foreground))]">Filter:</p>

          <div className="flex flex-col items-start gap-2">
            {filters.map((filter) => (
              <FilterButton
                key={`${filter.value}-${filter.label}`}
                active={activeFilter === filter.value}
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
