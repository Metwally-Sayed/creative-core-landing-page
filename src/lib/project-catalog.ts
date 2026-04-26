export type ProjectAspectRatio = "portrait" | "landscape" | "square";
export type ProjectThemeRole =
  | "accent"
  | "secondary"
  | "background"
  | "foreground"
  | "showcase";

export type ProjectSummary = {
  id: string;
  title: string;
  tags: string[];
  image: string;
  aspectRatio: ProjectAspectRatio;
};

export type ProjectFact = {
  label: string;
  value: string;
};

export type ProjectSection = {
  eyebrow: string;
  title: string;
  body: string[];
  image: string;
  imageAlt: string;
  imageLayout: "left" | "right";
  tone?: "light" | "navy";
};

export type ProjectGalleryImage = {
  src: string;
  alt: string;
  label: string;
};

export type ProjectFeature = {
  eyebrow: string;
  title: string;
  body: string;
};

export type ProjectIntroMeta = {
  launchLabel: string;
  type: string;
  client: string;
  deliverables: string;
};

export type ProjectColor = {
  hex: string;
  name: string;
  themeRole: ProjectThemeRole | null;
};

export type ProjectProcess = {
  phase: string;
  label: string;
  desc: string;
};

export type ProjectDetail = ProjectSummary & {
  heroLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSummary: string;
  inheritThemeFromPalette: boolean;
  introMeta: ProjectIntroMeta;
  overview: ProjectFact[];
  intro: string[];
  primaryShowcase: ProjectGalleryImage;
  feature: ProjectFeature;
  sections: ProjectSection[];
  impactMetrics: ProjectFact[];
  gallery: ProjectGalleryImage[];
  credits: ProjectFact[];
  relatedIds: string[];
  colors?: ProjectColor[];
  process?: ProjectProcess[];
};

export const projects: ProjectSummary[] = [
  {
    id: "1",
    title: "Google - Gemini Developer Competition",
    tags: ["Experiences"],
    image: "/images/project-gemini-dev.jpg",
    aspectRatio: "landscape",
  },
  {
    id: "2",
    title: "Bang & Olufsen - See yourself in Sound",
    tags: ["Experiences"],
    image: "/images/project-bang-olufsen.jpg",
    aspectRatio: "portrait",
  },
  {
    id: "3",
    title: "Gemini - AI for Every Developer",
    tags: ["Experiences", "Branding", "Platform"],
    image: "/images/project-gemini-apps.jpg",
    aspectRatio: "portrait",
  },
  {
    id: "4",
    title: "Zipline - The best delivery experience not on earth",
    tags: ["Platform", "Experiences"],
    image: "/images/project-zipline.jpg",
    aspectRatio: "landscape",
  },
  {
    id: "5",
    title: "Netflix Kids and Family - A delightful, welcoming, and adventurous identity",
    tags: ["Branding"],
    image: "/images/project-netflix.jpg",
    aspectRatio: "portrait",
  },
  {
    id: "6",
    title: "Ramasjang Krea App",
    tags: ["Products"],
    image: "/images/project-kids-space.jpg",
    aspectRatio: "landscape",
  },
  {
    id: "7",
    title: "Universal Music for Creators",
    tags: ["Experiences", "Products"],
    image: "/images/project-search-on.jpg",
    aspectRatio: "portrait",
  },
  {
    id: "8",
    title: "Strava - Year In Sport",
    tags: ["Platform", "Products", "Experiences"],
    image: "/images/project-strava.jpg",
    aspectRatio: "landscape",
  },
  {
    id: "9",
    title: "Google Gemini - Generative AI Apps",
    tags: ["Experiences"],
    image: "/images/project-gemini-apps.jpg",
    aspectRatio: "portrait",
  },
  {
    id: "10",
    title: "The Web Can Do What?! with Google",
    tags: ["Experiences"],
    image: "/images/project-web-can-do.jpg",
    aspectRatio: "landscape",
  },
  {
    id: "11",
    title: "Fingerspelling with Machine Learning",
    tags: ["Experiences", "Products"],
    image: "/images/project-fingerspelling.jpg",
    aspectRatio: "portrait",
  },
  {
    id: "12",
    title: "The best things are the Simple Things",
    tags: ["Branding", "E-commerce", "Platform"],
    image: "/images/project-simplethings.jpg",
    aspectRatio: "landscape",
  },
  {
    id: "13",
    title: "Undo the Firewall - Bring Independent News to Russians",
    tags: ["Experiences"],
    image: "/images/project-undo-firewall.jpg",
    aspectRatio: "portrait",
  },
  {
    id: "14",
    title: "DIG: Cloud Castles",
    tags: ["Experiences"],
    image: "/images/project-dig.jpg",
    aspectRatio: "landscape",
  },
  {
    id: "15",
    title: "Google - Celebrating the Most Searched in History",
    tags: ["Experiences"],
    image: "/images/project-most-searched.jpg",
    aspectRatio: "portrait",
  },
  {
    id: "16",
    title: "Aurora Solar - Hitting fast-forward on the solar future",
    tags: ["Branding"],
    image: "/images/project-aurora.jpg",
    aspectRatio: "landscape",
  },
  {
    id: "17",
    title: "Designing the Kids Space Universe",
    tags: ["Branding", "Products"],
    image: "/images/project-kids-space.jpg",
    aspectRatio: "landscape",
  },
  {
    id: "18",
    title: "OPPO - A unified design system for a truly global brand",
    tags: ["Platform", "Branding"],
    image: "/images/project-oppo.jpg",
    aspectRatio: "portrait",
  },
  {
    id: "19",
    title: "YouTube creates a new generation",
    tags: ["Branding"],
    image: "/images/project-youtube.jpg",
    aspectRatio: "landscape",
  },
  {
    id: "20",
    title: "Google's Search On - A series of inspiring stories",
    tags: ["Branding", "Platform", "E-commerce"],
    image: "/images/project-search-on.jpg",
    aspectRatio: "portrait",
  },
  {
    id: "21",
    title: "Lyft - America is an idea. Not a geography.",
    tags: ["Experiences"],
    image: "/images/project-lyft.jpg",
    aspectRatio: "portrait",
  },
  {
    id: "22",
    title: "T-Mobile's little device that sets you free",
    tags: ["Experiences"],
    image: "/images/project-tmobile.jpg",
    aspectRatio: "portrait",
  },
  {
    id: "23",
    title: "Bearaby - Weighted bedding reinvented",
    tags: ["Branding"],
    image: "/images/project-bearaby.jpg",
    aspectRatio: "landscape",
  },
];

const imagePool = projects.map((project) => project.image);

function getProjectByNumericOffset(project: ProjectSummary, offset: number) {
  const index = projects.findIndex((item) => item.id === project.id);
  return projects[(index + offset + projects.length) % projects.length];
}

function getDisplayTitle(project: ProjectSummary) {
  const parts = project.title.split(" - ");
  return parts.length > 1 ? parts.slice(1).join(" - ") : project.title;
}

function getClientName(project: ProjectSummary) {
  const parts = project.title.split(" - ");
  return parts.length > 1 ? parts[0] : "Creative Core";
}

function uniqueImages(...images: string[]) {
  return Array.from(new Set(images));
}

function buildDefaultDetail(project: ProjectSummary): ProjectDetail {
  const displayTitle = getDisplayTitle(project);
  const secondaryImage = getProjectByNumericOffset(project, 1).image;
  const tertiaryImage = getProjectByNumericOffset(project, 2).image;
  const galleryImages = uniqueImages(project.image, secondaryImage, tertiaryImage, imagePool[0], imagePool[5]).slice(0, 5);

  return {
    ...project,
    heroLabel: "Case Study",
    heroTitle: displayTitle,
    heroSubtitle: project.tags.join(" / "),
    heroSummary: `A themed project story for ${displayTitle.toLowerCase()}, built to feel cinematic, tactile, and editorial while staying inside the softer visual system of this site.`,
    inheritThemeFromPalette: false,
    introMeta: {
      launchLabel: "Launch project",
      type: project.tags.join(", "),
      client: getClientName(project),
      deliverables: "Concept, Design, Development, Strategy",
    },
    overview: [
      { label: "Client", value: getClientName(project) },
      { label: "Scope", value: project.tags.join(", ") },
      { label: "Deliverables", value: "Case study page, campaign storytelling, motion-led UI" },
      { label: "Timeline", value: "8 week sprint" },
    ],
    intro: [
      `${displayTitle} needed a detail page that could carry both atmosphere and clarity. The goal was to make the work feel curated and premium without losing the practical story of how the system was shaped.`,
      `The structure leans on generous spacing, alternating media blocks, and a stronger narrative hierarchy so the project reads like a polished case study rather than a standard portfolio entry.`,
    ],
    primaryShowcase: {
      src: project.image,
      alt: displayTitle,
      label: "Primary showcase",
    },
    feature: {
      eyebrow: "Experience frame",
      title: "A narrative case study that opens with mood, then moves into proof.",
      body: "The page balances cinematic hero treatment, structured context, and modular story blocks so the visuals can lead without making the content vague.",
    },
    sections: [
      {
        eyebrow: "Challenge",
        title: `Giving ${displayTitle} a stronger launch frame`,
        body: [
          `We treated the project like a release moment instead of a gallery item, shaping the opening sequence to establish tone immediately.`,
          `The layout uses a restrained rhythm of copy and media so each chapter has room to breathe on both mobile and desktop.`,
        ],
        image: secondaryImage,
        imageAlt: `${displayTitle} challenge`,
        imageLayout: "right",
      },
      {
        eyebrow: "System",
        title: "Building a page that feels premium without becoming heavy.",
        body: [
          "Soft cards, navy feature surfaces, and warm highlights keep the theme aligned with the rest of the site.",
          "The content blocks are modular enough to support different projects while still preserving a recognizable case-study language.",
        ],
        image: tertiaryImage,
        imageAlt: `${displayTitle} system`,
        imageLayout: "left",
        tone: "navy",
      },
      {
        eyebrow: "Outcome",
        title: "A reusable project template with a more editorial point of view.",
        body: [
          "The finished page turns the project archive into a richer destination and gives future case studies a clear structure to follow.",
          "That keeps the new project pages consistent with the site while allowing each story to have its own atmosphere.",
        ],
        image: project.image,
        imageAlt: `${displayTitle} outcome`,
        imageLayout: "right",
      },
    ],
    impactMetrics: [
      { label: "Story arc", value: "Hero to proof" },
      { label: "Motion tone", value: "Calm and tactile" },
      { label: "Surface mix", value: "Soft cards + navy stage" },
    ],
    gallery: galleryImages.map((image, index) => ({
      src: image,
      alt: `${displayTitle} gallery ${index + 1}`,
      label: `Frame 0${index + 1}`,
    })),
    credits: [
      { label: "Strategy", value: "Editorial narrative" },
      { label: "Design", value: "Case study system" },
      { label: "Motion", value: "Existing site animations" },
      { label: "Build", value: "Next.js + theme tokens" },
    ],
    relatedIds: projects.filter((item) => item.id !== project.id).slice(0, 3).map((item) => item.id),
  };
}

const detailOverrides: Partial<Record<string, Partial<ProjectDetail>>> = {
  "1": {
    heroLabel: "Google / Launch Experience",
    heroTitle: "Gemini API",
    heroSubtitle: "Developer Competition",
    heroSummary:
      "A project page shaped like a launch stage: dark atmospheric hero, crisp editorial sections, and a sequence of media-led moments that explain the competition without flattening the energy of it.",
    introMeta: {
      launchLabel: "Launch project",
      type: "Experiences",
      client: "Google",
      deliverables: "Animation, Concept, Design, Development, UI, UX, Strategy",
    },
    overview: [
      { label: "Client", value: "Google" },
      { label: "Program", value: "Gemini API Developer Competition" },
      { label: "Deliverables", value: "Launch page, campaign story, responsive case study" },
      { label: "Timeline", value: "6 weeks" },
    ],
    intro: [
      "Google's developer competition, designed to promote the new Gemini API, was a resounding success. We collaborated closely with Google from inception to execution, providing design, development, and strategic guidance to ensure strong momentum throughout the year. With over 3,000 AI-apps and video showcases generated from developers around the world and high engagement, the competition inspired the developer community to supercharge their projects in innovative ways with the Gemini API.",
      "Instead of reproducing the original page verbatim, the layout carries over its structure and pacing while translating it into the softer navy, coral, and mist palette that now defines the rest of the site.",
    ],
    primaryShowcase: {
      src: "/images/project-gemini-dev.jpg",
      alt: "Gemini API developer competition hero",
      label: "Launch hero",
    },
    feature: {
      eyebrow: "Launch frame",
      title: "A competition page that feels like an invitation to build.",
      body: "The central feature block keeps the dark, stage-like energy from the reference while the surrounding content shifts back into the brighter site theme for readability and flow.",
    },
    sections: [
      {
        eyebrow: "Challenge",
        title: "Turning a technical competition into something instantly inviting.",
        body: [
          "The first chapter introduces the program with strong atmosphere and a clear editorial hierarchy so the project lands emotionally before it starts explaining itself.",
          "That makes the launch feel more like an event and less like a documentation page, which is the core tension the design needed to solve.",
        ],
        image: "/images/project-gemini-dev.jpg",
        imageAlt: "Gemini competition workspace",
        imageLayout: "right",
      },
      {
        eyebrow: "Interface",
        title: "Using rich media blocks to break the story into memorable beats.",
        body: [
          "Large image panels, centered feature cards, and quiet text columns echo the proportions of the reference page while staying consistent with the newer theme tokens.",
          "The result is more layered than a simple case study feed, but still calm enough to support reading on smaller screens.",
        ],
        image: "/images/project-gemini-apps.jpg",
        imageAlt: "Gemini API competition stage",
        imageLayout: "left",
        tone: "navy",
      },
      {
        eyebrow: "Outcome",
        title: "A reusable project detail system for the rest of the portfolio.",
        body: [
          "This page becomes the template for future project stories: dramatic opener, clear overview, alternating chapters, visual gallery, then related work.",
          "That gives the site a stronger sense of depth while keeping the visual language coherent across home, projects, and conversion sections.",
        ],
        image: "/images/project-web-can-do.jpg",
        imageAlt: "Gemini API outcome collage",
        imageLayout: "right",
      },
    ],
    impactMetrics: [
      { label: "Launch tone", value: "Cinematic" },
      { label: "Reading mode", value: "Editorial" },
      { label: "Theme fit", value: "Creative palette" },
    ],
    gallery: [
      {
        src: "/images/project-gemini-dev.jpg",
        alt: "Gemini hero panel",
        label: "Hero",
      },
      {
        src: "/images/project-gemini-apps.jpg",
        alt: "Gemini secondary panel",
        label: "Campaign",
      },
      {
        src: "/images/project-search-on.jpg",
        alt: "Gemini support panel",
        label: "Sequence",
      },
      {
        src: "/images/project-web-can-do.jpg",
        alt: "Gemini showcase strip",
        label: "Frames",
      },
      {
        src: "/images/project-oppo.jpg",
        alt: "Gemini detail sample",
        label: "Details",
      },
    ],
    credits: [
      { label: "Strategy", value: "Launch narrative" },
      { label: "Design", value: "UI + art direction" },
      { label: "Motion", value: "Site system adaptation" },
      { label: "Build", value: "Responsive case study page" },
    ],
    relatedIds: ["3", "10", "8"],
  },
};

export function getProjectSummary(id: string) {
  return projects.find((project) => project.id === id) ?? null;
}

export function getProjectDetail(id: string) {
  const project = getProjectSummary(id);

  if (!project) {
    return null;
  }

  const base = buildDefaultDetail(project);
  const override = detailOverrides[id];

  if (!override) {
    return base;
  }

  return {
    ...base,
    ...override,
    introMeta: override.introMeta ?? base.introMeta,
    overview: override.overview ?? base.overview,
    intro: override.intro ?? base.intro,
    primaryShowcase: override.primaryShowcase ?? base.primaryShowcase,
    feature: override.feature ?? base.feature,
    sections: override.sections ?? base.sections,
    impactMetrics: override.impactMetrics ?? base.impactMetrics,
    gallery: override.gallery ?? base.gallery,
    credits: override.credits ?? base.credits,
    relatedIds: override.relatedIds ?? base.relatedIds,
  };
}

export function getRelatedProjects(id: string, limit = 3) {
  const detail = getProjectDetail(id);

  if (!detail) {
    return [];
  }

  return detail.relatedIds
    .map((relatedId) => getProjectSummary(relatedId))
    .filter((project): project is ProjectSummary => Boolean(project))
    .slice(0, limit);
}

export const projectIds = projects.map((project) => project.id);
