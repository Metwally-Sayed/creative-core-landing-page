import { projects, type ProjectAspectRatio } from "@/lib/project-catalog";

export type WorkFilter = "Products" | "Experiences" | "Branding";

export type WorkProject = {
  id: string;
  title: string;
  filters: WorkFilter[];
  tags: string[];
  image: string;
  aspectRatio: ProjectAspectRatio;
  featuredAspectRatio: ProjectAspectRatio;
};

type OrderedWorkProject = WorkProject & {
  order: number;
};

type WorkOverride = Partial<
  Pick<WorkProject, "title" | "image" | "aspectRatio" | "featuredAspectRatio">
> & {
  filters?: WorkFilter[];
  order?: number;
};

export const workFilters: WorkFilter[] = [
  "Products",
  "Experiences",
  "Branding",
];

const workOverrides: Partial<Record<string, WorkOverride>> = {
  "11": {
    order: 0,
    title: "Signs - Expanding access to language",
    filters: ["Products", "Experiences", "Branding"],
    aspectRatio: "landscape",
    featuredAspectRatio: "landscape",
  },
  "13": {
    order: 1,
    title: "Undo the Firewall - Bring Independent News to Russians",
    filters: ["Experiences", "Products"],
    aspectRatio: "landscape",
    featuredAspectRatio: "landscape",
  },
  "8": {
    order: 2,
    title: "Strava - Year In Sport",
    filters: ["Products", "Experiences"],
    aspectRatio: "portrait",
    featuredAspectRatio: "portrait",
  },
  "17": {
    order: 3,
    title: "Designing the Kids Space Universe",
    filters: ["Branding", "Products"],
    featuredAspectRatio: "portrait",
  },
  "14": {
    order: 4,
    title: "DIG - Cloud Castles",
    filters: ["Experiences"],
    featuredAspectRatio: "landscape",
  },
};

function deriveFilters(tags: string[]): WorkFilter[] {
  const derived = workFilters.filter((filter) => tags.includes(filter));

  return derived.length > 0 ? derived : ["Branding"];
}

function toWorkProject(project: OrderedWorkProject): WorkProject {
  return {
    id: project.id,
    title: project.title,
    filters: project.filters,
    tags: project.tags,
    image: project.image,
    aspectRatio: project.aspectRatio,
    featuredAspectRatio: project.featuredAspectRatio,
  };
}

export const workProjects: WorkProject[] = projects
  .map((project, index) => {
    const override = workOverrides[project.id];

    const workProject: OrderedWorkProject = {
      id: project.id,
      title: override?.title ?? project.title,
      filters: override?.filters ?? deriveFilters(project.tags),
      tags: project.tags,
      image: override?.image ?? project.image,
      aspectRatio: override?.aspectRatio ?? project.aspectRatio,
      featuredAspectRatio:
        override?.featuredAspectRatio ??
        override?.aspectRatio ??
        project.aspectRatio,
      order: override?.order ?? index + 100,
    };

    return workProject;
  })
  .sort((left, right) => left.order - right.order)
  .map(toWorkProject);
