export type ServiceArtKey =
  | "confetti-watch"
  | "youtube-play"
  | "bear-frame"
  | "vr-fans"
  | "split-rings"
  | "residenta-pack";

export type ServiceCard = {
  title: string;
  subtitle: string;
  art: ServiceArtKey;
};

export type ServiceSection = {
  id: "products" | "experiences" | "branding";
  eyebrow: string;
  title: string;
  body: string;
  linkLabel: string;
  illustration: "products" | "experiences" | "branding";
  cards: [ServiceCard, ServiceCard];
};

export type AwardStat = {
  label: string;
  value: string;
};

export const servicesHero = {
  title: "What we do",
  body:
    "We build better businesses by creating joyful digital ideas, products and experiences that connect the hearts of brands to the hearts of humans.",
};

export const serviceSections: ServiceSection[] = [
  {
    id: "products",
    eyebrow: "We make (digital)",
    title: "Products",
    body:
      "We make better products and make products better. From design and innovation sprints to UX design sprints and marathons, we create things that work for users and brands. Our approach was agile before they called it agile, finding innovation through structured ideation, prototyping and user-testing. Over the past couple of years, we've dived deep into machine learning and AI, but always with one question in mind: how does it make life better for humans?",
    linkLabel: "View Digital Products",
    illustration: "products",
    cards: [
      {
        title: "Playful interfaces for everyday tools",
        subtitle: "Product concept",
        art: "confetti-watch",
      },
      {
        title: "A bold platform made instantly recognizable",
        subtitle: "Product launch",
        art: "youtube-play",
      },
    ],
  },
  {
    id: "experiences",
    eyebrow: "We make (digital)",
    title: "Experiences",
    body:
      "We tell stories with images, film, 360, virtual reality, augmented reality, 3D graphics and that magical technology called language. We don't see a dividing line between 'digital' and 'real' - do it right and digital is real. Immersive, emotional, joyful, memorable, magical. We love coming up with new, meaningful ways to make a human connection.",
    linkLabel: "View Digital Experiences",
    illustration: "experiences",
    cards: [
      {
        title: "Editorial art direction with tactile framing",
        subtitle: "Immersive storytelling",
        art: "bear-frame",
      },
      {
        title: "A cinematic launch world for fans",
        subtitle: "Digital experience",
        art: "vr-fans",
      },
    ],
  },
  {
    id: "branding",
    eyebrow: "We make",
    title: "Branding",
    body:
      "Brands are ideas that keep growing. We think of them like machine learning. When you build a brand, you build in the power to adapt and evolve. We create the building blocks: the strategy, symbol, logotype, typography, color scheme, iconography, illustration style, visuals, animations, motion design, photography style, sound design, messaging, and tone of voice. But ultimately the brand creates itself - in the minds and hearts of the audience.",
    linkLabel: "View Branding",
    illustration: "branding",
    cards: [
      {
        title: "A visual identity built from one memorable mark",
        subtitle: "Brand system",
        art: "split-rings",
      },
      {
        title: "Packaging that feels bold and gallery-like",
        subtitle: "Brand campaign",
        art: "residenta-pack",
      },
    ],
  },
];

export const shinyThings = {
  eyebrow: "We Got",
  title: "Shiny Things",
  body:
    "We're supposed to say we're humbled, but we're actually proud when we win awards. They're not a perfect measure of creativity (it's about happy users, not happy judges) but they're a sign we're doing something right.",
};

export const awardColumns: [AwardStat[], AwardStat[]] = [
  [
    { label: "Cannes Lion", value: "8" },
    { label: "D&AD", value: "5" },
    { label: "Eurobest awards", value: "2" },
    { label: "FWA SOTD\nFWA Hall of Fame", value: "121" },
  ],
  [
    { label: "Webby Awards", value: "14" },
    { label: "Creative Circle Awards", value: "48" },
    { label: "Awwwards", value: "58" },
  ],
];
