import { studioLocations, type StudioLocation } from "@/lib/studio-locations";

export type AboutJumpLink = {
  label: string;
  href: "#contact" | "#code-of-honor" | "#mondayteers";
};

export type CodeOfHonorArtKey =
  | "be-nice"
  | "powers-for-good"
  | "try-the-truth"
  | "enjoy-the-ride"
  | "speak-up-and-listen"
  | "solve-the-problem"
  | "help-each-other"
  | "team-up";

export type CodeOfHonorItem = {
  id: string;
  index: string;
  title: string;
  body: string;
  art: CodeOfHonorArtKey;
};

export type MondayteerArtKey =
  | "halo"
  | "ribbons"
  | "signals"
  | "orbit"
  | "grid"
  | "beacon";

export type Mondayteer = {
  name: string;
  city: string;
  role: string;
  art: MondayteerArtKey;
  accentLabel: string;
};

export const aboutHero = {
  title: "Who we are",
  body:
    "HELLO MONDAY/DEPT is a creative studio that turns digital ideas into warm, memorable experiences. We mix strategy, product thinking, and playful craft so brands can feel sharper, friendlier, and more human wherever they show up.",
};

export const aboutJumpLinks: AboutJumpLink[] = [
  { label: "Contact", href: "#contact" },
  { label: "Code of Honor", href: "#code-of-honor" },
  { label: "Mondayteers", href: "#mondayteers" },
];

export const aboutLocations: StudioLocation[] = studioLocations.filter((location) =>
  ["New York", "Copenhagen", "Aarhus"].includes(location.city),
);

export const codeOfHonorIntro = {
  eyebrow: "Yes, we have a Code of Honor",
  title: "Code of Honor",
  body:
    "The better the collaboration, the more useful it is to be explicit about how we work together. These eight rules keep the studio kind, ambitious, honest, and fun even when the brief gets messy.",
};

export const codeOfHonorItems: CodeOfHonorItem[] = [
  {
    id: "be-nice",
    index: "01",
    title: "Be nice",
    body:
      "Curiosity travels further than ego. We assume good intent, give generous feedback, and remember that a difficult conversation can still be a respectful one.",
    art: "be-nice",
  },
  {
    id: "powers-for-good",
    index: "02",
    title: "Use our powers for good",
    body:
      "Creative work changes behavior. We would rather build ideas that help people feel more capable, more informed, or more connected than work that is only clever for five minutes.",
    art: "powers-for-good",
  },
  {
    id: "try-the-truth",
    index: "03",
    title: "Try the truth",
    body:
      "Honesty is almost always the fastest route forward. We say what is working, what is not, and what still needs proof, then use that clarity to make better decisions.",
    art: "try-the-truth",
  },
  {
    id: "enjoy-the-ride",
    index: "04",
    title: "Enjoy the ride",
    body:
      "Ambition should still leave room for delight. We celebrate progress, stay open to the unexpected, and keep enough humor in the room to survive the hard parts.",
    art: "enjoy-the-ride",
  },
  {
    id: "speak-up-and-listen",
    index: "05",
    title: "Speak up and listen",
    body:
      "Strong opinions are useful when they come with equal attention. We bring a point of view, make space for others, and stay willing to change our minds.",
    art: "speak-up-and-listen",
  },
  {
    id: "solve-the-problem",
    index: "06",
    title: "Solve the problem",
    body:
      "Pretty surfaces are not enough. We keep asking what the challenge actually is so the final idea feels clear, useful, and worth shipping.",
    art: "solve-the-problem",
  },
  {
    id: "help-each-other",
    index: "07",
    title: "Help each other",
    body:
      "The best studios feel like a team sport. We share context early, unblock each other quickly, and make time to support the work beyond our own swim lane.",
    art: "help-each-other",
  },
  {
    id: "team-up",
    index: "08",
    title: "Team up",
    body:
      "Our favorite work happens when different disciplines sharpen one another. Strategy, design, motion, writing, and technology all get better when they move together.",
    art: "team-up",
  },
];

export const mondayteersIntro = {
  eyebrow: "We are the",
  title: "Mondayteers",
  body:
    "A few dummy studio portraits to make the page feel alive. Each card leans into the app's color system and keeps the editorial energy of the reference without pretending these are real team bios.",
};

export const mondayteers: Mondayteer[] = [
  {
    name: "Saskia",
    city: "Copenhagen",
    role: "Design Director",
    art: "halo",
    accentLabel: "Calm systems",
  },
  {
    name: "Fallon",
    city: "New York",
    role: "Creative Technologist",
    art: "ribbons",
    accentLabel: "Prototype wizardry",
  },
  {
    name: "Chelsea",
    city: "New York",
    role: "Brand Strategist",
    art: "signals",
    accentLabel: "Sharp narratives",
  },
  {
    name: "Mads",
    city: "Aarhus",
    role: "Motion Designer",
    art: "orbit",
    accentLabel: "Movement studies",
  },
  {
    name: "Noor",
    city: "Copenhagen",
    role: "Experience Designer",
    art: "grid",
    accentLabel: "System thinker",
  },
  {
    name: "Elias",
    city: "Amsterdam",
    role: "Product Designer",
    art: "beacon",
    accentLabel: "Interface detail",
  },
];
