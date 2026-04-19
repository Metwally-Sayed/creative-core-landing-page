import path from "path";

import type { ProjectAspectRatio, WorkFilter } from "../src/lib/cms-mappers.ts";

export type SeedPalette = {
  accent: { hex: string; name: string };
  secondary: { hex: string; name: string };
  background: { hex: string; name: string };
  foreground: { hex: string; name: string };
  supporting?: Array<{ hex: string; name: string }>;
};

export type SeedMediaItem = {
  filePath: string;
  alt: string;
};

export type SeedProjectConfig = {
  key: string;
  slug: string;
  title: string;
  serviceType: string;
  tags: string[];
  workFilters: WorkFilter[];
  cardAspectRatio: ProjectAspectRatio;
  featuredAspectRatio: ProjectAspectRatio;
  themePalette: SeedPalette;
  inheritThemeFromPalette?: boolean;
  media: {
    cardImage: SeedMediaItem;
    primaryShowcase: SeedMediaItem;
    storySections: SeedMediaItem[];
    gallery: SeedMediaItem[];
  };
  copy: {
    heroLabel: string;
    heroTitle: string;
    heroSubtitle: string;
    heroSummary: string;
    introMeta: {
      type: string;
      client: string;
      deliverables: string;
      launchLabel?: string;
    };
    overview: Array<{ label: string; value: string }>;
    intro: string[];
    process?: Array<{ phase: string; label: string; desc: string }>;
    sections: Array<{
      eyebrow: string;
      title: string;
      body: string[];
      imageLayout: "left" | "right";
      tone?: "light" | "navy";
    }>;
    impactMetrics: Array<{ label: string; value: string }>;
    credits: Array<{ label: string; value: string }>;
  };
  relatedProjectSlugs: string[];
  sortOrder: number;
};

function media(filePath: string, alt: string): SeedMediaItem {
  return {
    filePath: path.normalize(filePath),
    alt,
  };
}

export const projectSeedConfigs: Record<string, SeedProjectConfig> = {
  burgito: {
    key: "burgito",
    slug: "burgito",
    title: "Burgito - Tasty Bites, Happy Vibes",
    serviceType: "Branding",
    tags: ["Branding", "Packaging", "Campaign"],
    workFilters: ["Branding"],
    cardAspectRatio: "portrait",
    featuredAspectRatio: "portrait",
    sortOrder: 220,
    themePalette: {
      accent: { hex: "#D60523", name: "Burgito Red" },
      secondary: { hex: "#F9DCEA", name: "Blush Pink" },
      background: { hex: "#FFFFFF", name: "White" },
      foreground: { hex: "#000000", name: "Black" },
    },
    media: {
      cardImage: media("/Users/metwally/Downloads/burgitowebsite-13.webp", "Burgito brand card image"),
      primaryShowcase: media("/Users/metwally/Downloads/burgitowebsite-04.webp", "Burgito primary showcase"),
      storySections: [
        media("/Users/metwally/Downloads/burgitowebsite-01.webp", "Burgito concept exploration"),
        media("/Users/metwally/Downloads/burgitowebsite-11.webp", "Burgito identity system application"),
        media("/Users/metwally/Downloads/burgitowebsite-05.webp", "Burgito launch expression"),
      ],
      gallery: [
        media("/Users/metwally/Downloads/burgitowebsite-11.webp", "Burgito visual exploration image 1"),
        media("/Users/metwally/Downloads/burgitowebsite-10.webp", "Burgito visual exploration image 2"),
        media("/Users/metwally/Downloads/burgitowebsite-09.webp", "Burgito visual exploration image 3"),
        media("/Users/metwally/Downloads/burgitowebsite-07.webp", "Burgito visual exploration image 4"),
        media("/Users/metwally/Downloads/burgitowebsite-03.webp", "Burgito visual exploration image 5"),
        media("/Users/metwally/Downloads/burgitowebsite-05.webp", "Burgito visual exploration image 6"),
        media("/Users/metwally/Downloads/burgitowebsite-06.webp", "Burgito visual exploration image 7"),
        media("/Users/metwally/Downloads/burgitowebsite-08.webp", "Burgito visual exploration image 8"),
        media("/Users/metwally/Downloads/burgitowebsite-12.webp", "Burgito visual exploration image 9"),
      ],
    },
    copy: {
      heroLabel: "Brand Identity",
      heroTitle: "Burgito",
      heroSubtitle:
        "A playful burger brand built from appetite, slang, and a wink of retro diner energy.",
      heroSummary:
        "Burgito is a compact brand identity study that turns a fast-food premise into a bold character system, packaging language, and campaign-ready visual toolkit.",
      introMeta: {
        type: "Branding",
        client: "Burgito",
        deliverables:
          "Brand identity, mascot system, packaging, campaign visuals, social assets",
        launchLabel: "Explore the system",
      },
      overview: [
        { label: "Service", value: "Branding" },
        { label: "Focus", value: "Identity + packaging + rollout assets" },
        { label: "Tone", value: "Bold, playful, diner-inspired" },
        { label: "Output", value: "Systemized visuals for real-world use" },
      ],
      intro: [
        "Burgito started as a simple idea: make a burger brand that feels like a catchphrase. The name is short, cheeky, and instantly conversational — the kind of word you can put on a box, a poster, or a sticker and have it carry the mood by itself.",
        "From there the work became about building a character-driven identity with clear rules: loud color, confident type, and a mascot-led rhythm that can scale from packaging details to campaign moments. The goal wasn’t to over-explain — it was to design an appetite-first system that stays readable and energetic in motion.",
      ],
      process: [
        {
          phase: "01",
          label: "Discovery",
          desc: "Define the brand premise, personality, and the visual references that fit the food category without feeling generic.",
        },
        {
          phase: "02",
          label: "Concept",
          desc: "Explore naming energy, mascot direction, and a flexible layout language for packaging and social surfaces.",
        },
        {
          phase: "03",
          label: "System",
          desc: "Lock typography, color roles, and repeatable components so every asset feels related without becoming repetitive.",
        },
        {
          phase: "04",
          label: "Expression",
          desc: "Apply the system across packaging, campaign visuals, and social templates to prove it holds up in the wild.",
        },
      ],
      sections: [
        {
          eyebrow: "Concept",
          title: "Appetite-first premise",
          body: [
            "Burgito needed to read instantly as food, but feel more like culture than a menu item. The concept work focused on high-contrast shape, punchy color, and a mascot tone that can carry humor without becoming a gimmick.",
            "The system favors simple, repeatable moves — strong silhouettes, bold blocks of color, and a flexible composition grid that works at sticker scale and poster scale.",
          ],
          imageLayout: "left",
          tone: "light",
        },
        {
          eyebrow: "Identity System",
          title: "A toolkit, not a logo lockup",
          body: [
            "The identity was designed as a set of parts: typography, badges, character moments, and layout rules that can remix endlessly. That makes the brand feel alive across packaging and social content.",
            "Color roles are intentionally opinionated: a primary accent for impact, a soft secondary for contrast, and a clean base so photography and typography stay readable.",
          ],
          imageLayout: "right",
          tone: "light",
        },
        {
          eyebrow: "Launch Expression",
          title: "Campaign-ready surfaces",
          body: [
            "To prove the system, we pushed it into launch-style assets: bold headline moments, repeatable templates, and compositions that can flex between product focus and pure brand energy.",
            "Everything is built to stay consistent under real constraints — cropping, quick edits, and different formats — while still feeling unmistakably Burgito.",
          ],
          imageLayout: "left",
          tone: "navy",
        },
      ],
      impactMetrics: [
        { label: "Clarity", value: "A readable identity that stays loud across sizes and formats." },
        { label: "Flexibility", value: "A component system that supports endless brand applications." },
        { label: "Expression", value: "Packaging and campaign visuals that feel cohesive, not templated." },
      ],
      credits: [
        { label: "Services", value: "Branding, Packaging, Campaign Visuals" },
        { label: "Deliverables", value: "Identity toolkit, mascot system, social templates" },
        { label: "Studio", value: "Creative Core" },
      ],
    },
    relatedProjectSlugs: [
      "aurora-solar-hitting-fast-forward-on-the-solar-future",
      "youtube-creates-a-new-generation",
      "bearaby-weighted-bedding-reinvented",
    ],
  },
  mazaq: {
    key: "mazaq",
    slug: "mazaq",
    title: "Mazaq",
    serviceType: "Branding",
    tags: ["Branding", "Packaging", "Art Direction"],
    workFilters: ["Branding"],
    cardAspectRatio: "portrait",
    featuredAspectRatio: "landscape",
    inheritThemeFromPalette: true,
    sortOrder: 230,
    themePalette: {
      accent: { hex: "#71CAC8", name: "Al Balad" },
      secondary: { hex: "#1F5C2E", name: "Old Makkah" },
      background: { hex: "#E8E8E2", name: "Sand" },
      foreground: { hex: "#0D0D0D", name: "Black" },
      supporting: [
        { hex: "#3066B0", name: "Sunrise" },
        { hex: "#911A22", name: "Hijazi Red" },
      ],
    },
    media: {
      cardImage: media("/Users/metwally/Downloads/mazaqwebsite-02.webp", "Mazaq listing card"),
      primaryShowcase: media("/Users/metwally/Downloads/mazaqwebsite-03.webp", "Mazaq primary showcase"),
      storySections: [
        media("/Users/metwally/Downloads/mazaqwebsite-04.webp", "Mazaq concept system"),
        media("/Users/metwally/Downloads/mazaqwebsite-05.webp", "Mazaq icon system board"),
        media("/Users/metwally/Downloads/mazaqwebsite-09.webp", "Mazaq packaging application"),
      ],
      gallery: [
        media("/Users/metwally/Downloads/mazaqwebsite-05.webp", "Mazaq visual exploration icon system"),
        media("/Users/metwally/Downloads/mazaqwebsite-07.webp", "Mazaq visual exploration poster split"),
        media("/Users/metwally/Downloads/mazaqwebsite-09.webp", "Mazaq visual exploration bag and bowl"),
        media("/Users/metwally/Downloads/mazaqwebsite-10.webp", "Mazaq visual exploration tabletop composition"),
        media("/Users/metwally/Downloads/mazaqwebsite-11.webp", "Mazaq visual exploration merchandise"),
        media("/Users/metwally/Downloads/mazaqwebsite-12.webp", "Mazaq visual exploration poster and cup"),
      ],
    },
    copy: {
      heroLabel: "Brand Identity",
      heroTitle: "Mazaq",
      heroSubtitle:
        "A modern food identity built from local visual memory, street culture, and Hijazi references.",
      heroSummary:
        "Mazaq reframes familiar Hijazi street-food cues as a contemporary identity system, spanning packaging, printed ephemera, posters, and merchandise-ready applications.",
      introMeta: {
        type: "Branding",
        client: "Mazaq",
        deliverables: "Brand identity, packaging, printed applications, merchandise, campaign visuals",
        launchLabel: "Explore the identity",
      },
      overview: [
        { label: "Service", value: "Branding" },
        { label: "Scope", value: "Identity, packaging, posters, merchandise, takeaway touchpoints" },
        { label: "Strategy", value: "Heritage references + modular graphic language" },
        { label: "Palette", value: "Turquoise + green core with supporting blue and red accents" },
      ],
      intro: [
        "Mazaq starts with a recognizable street-food world, then edits it into a clear contemporary system. Instead of leaning on nostalgia, the identity treats heritage cues as structure: Arabic typographic rhythm, tiled geometry, and stamp-like details that feel collected rather than fabricated.",
        "The visual language is designed to scale across real touchpoints — posters, packaging, tabletop moments, and takeaway assets — while staying cohesive. A turquoise-and-green backbone drives recognition, and supporting colors provide contrast without changing the system’s core voice.",
      ],
      process: [
        {
          phase: "01",
          label: "Discovery",
          desc: "Define the brand thesis, cultural references, and the voice the identity should carry across physical touchpoints.",
        },
        {
          phase: "02",
          label: "Concept",
          desc: "Translate street cues into modular graphic building blocks: motifs, composition rules, and typographic rhythm.",
        },
        {
          phase: "03",
          label: "System",
          desc: "Build a reusable toolkit of icons, stamps, and layouts that stays flexible across packaging and print.",
        },
        {
          phase: "04",
          label: "Application",
          desc: "Apply the system to posters, packaging, tabletop presence, and merchandise to validate consistency.",
        },
      ],
      sections: [
        {
          eyebrow: "Concept",
          title: "From street cues to a contemporary system",
          body: [
            "The concept phase focused on reframing familiar Hijazi visual cues as a modern brand language — not as decoration, but as a repeatable system.",
            "Tiled geometry and print textures give the identity a collected, place-based feeling, while clean structure keeps it legible across formats.",
          ],
          imageLayout: "left",
          tone: "light",
        },
        {
          eyebrow: "Identity System",
          title: "Icons, stamps, and modular rhythm",
          body: [
            "The identity toolkit is built for repetition without monotony: icon families, stamp marks, and modular motifs that can recombine across surfaces.",
            "Typography and spacing rules establish a consistent rhythm so everything from a label to a poster reads as Mazaq.",
          ],
          imageLayout: "right",
          tone: "light",
        },
        {
          eyebrow: "Brand In Use",
          title: "Packaging and takeaway recognition",
          body: [
            "Applications prioritize recognition at a glance — the kinds of moments where packaging and tabletop presence do the talking.",
            "The system stays flexible for posters, cups, bags, and merch while keeping a clear turquoise-green signature.",
          ],
          imageLayout: "left",
          tone: "navy",
        },
      ],
      impactMetrics: [
        { label: "Consistency", value: "Coherent identity across physical, printed, and takeaway touchpoints." },
        { label: "Character", value: "Stronger local voice and recall without relying on clichés." },
        { label: "Flexibility", value: "A modular system that scales from packaging details to poster campaigns and merchandise." },
      ],
      credits: [
        { label: "Services", value: "Branding, Visual Identity, Packaging Direction, Art Direction" },
      ],
    },
    relatedProjectSlugs: [
      "aurora-solar-hitting-fast-forward-on-the-solar-future",
      "youtube-creates-a-new-generation",
      "bearaby-weighted-bedding-reinvented",
    ],
  },
  "emboss-burger": {
    key: "emboss-burger",
    slug: "emboss-burger",
    title: "EMBOSS BURGER",
    serviceType: "Branding",
    tags: ["Branding", "Packaging", "Campaign"],
    workFilters: ["Branding"],
    cardAspectRatio: "portrait",
    featuredAspectRatio: "landscape",
    inheritThemeFromPalette: true,
    sortOrder: 240,
    themePalette: {
      accent: { hex: "#114237", name: "EM'S" },
      secondary: { hex: "#EDA8CB", name: "Bun Blush" },
      background: { hex: "#F0EFEF", name: "Mayo" },
      foreground: { hex: "#114237", name: "EM'S" },
      supporting: [{ hex: "#F5EED9", name: "Butter" }],
    },
    media: {
      cardImage: media("/Users/metwally/Downloads/embosswebsite-10.webp", "EMBOSS BURGER listing card"),
      primaryShowcase: media("/Users/metwally/Downloads/embosswebsite-04.webp", "EMBOSS BURGER primary showcase"),
      storySections: [
        media("/Users/metwally/Downloads/embosswebsite-01.webp", "EMBOSS BURGER concept"),
        media("/Users/metwally/Downloads/embosswebsite-02.webp", "EMBOSS BURGER identity system"),
        media("/Users/metwally/Downloads/embosswebsite-03.webp", "EMBOSS BURGER launch expression"),
      ],
      gallery: [
        media("/Users/metwally/Downloads/embosswebsite-02.webp", "EMBOSS BURGER visual exploration 1"),
        media("/Users/metwally/Downloads/embosswebsite-03.webp", "EMBOSS BURGER visual exploration 2"),
        media("/Users/metwally/Downloads/embosswebsite-06.webp", "EMBOSS BURGER visual exploration 3"),
        media("/Users/metwally/Downloads/embosswebsite-07.webp", "EMBOSS BURGER visual exploration 4"),
        media("/Users/metwally/Downloads/embosswebsite-08.webp", "EMBOSS BURGER visual exploration 5"),
        media("/Users/metwally/Downloads/embosswebsite-09.webp", "EMBOSS BURGER visual exploration 6"),
        media("/Users/metwally/Downloads/embosswebsite-11.webp", "EMBOSS BURGER visual exploration 7"),
        media("/Users/metwally/Downloads/embosswebsite-12.webp", "EMBOSS BURGER visual exploration 8"),
        media("/Users/metwally/Downloads/embosswebsite-13.webp", "EMBOSS BURGER visual exploration 9"),
        media("/Users/metwally/Downloads/embosswebsite-05.webp", "EMBOSS BURGER visual exploration 10"),
      ],
    },
    copy: {
      heroLabel: "Brand Identity",
      heroTitle: "EMBOSS BURGER",
      heroSubtitle:
        "A burger brand built to feel stamped, memorable, and visually loud across packaging and campaigns.",
      heroSummary:
        "EMBOSS BURGER turns the idea of a “mark” into a full identity system—sticker-style badges, bold typography, and street-led visuals across packaging, menus, and launch assets.",
      introMeta: {
        type: "Branding",
        client: "EMBOSS BURGER",
        deliverables:
          "Brand identity, packaging, mascot system, campaign visuals, menu design, social assets",
        launchLabel: "Explore the system",
      },
      overview: [
        { label: "Service", value: "Branding" },
        { label: "Scope", value: "Identity, packaging, menu language, campaign rollouts" },
        { label: "Strategy", value: "A compact mark-driven system with sticker-like repeatables" },
        { label: "Tone", value: "Street-led, tactile, high-contrast" },
      ],
      intro: [
        "EMBOSS BURGER is built around the idea of leaving a mark. The identity treats embossing—not as an effect, but as a point of view: bold stamps, tactile cues, and repeatable badges that make every surface feel authored.",
        "Visually, the system balances block typography with a handwritten counterpoint, creating tension between loud and personal. Deep green anchors recognition, pink adds pop and contrast, and the sticker/stamp language scales cleanly from packaging details to campaign imagery.",
      ],
      process: [
        {
          phase: "01",
          label: "Discovery",
          desc: "Clarify the brand thesis, voice, and the touchpoints that matter most for a fast-moving food business.",
        },
        {
          phase: "02",
          label: "Concept",
          desc: "Explore the mark-driven direction: stamp forms, badge language, typography pairing, and the core palette roles.",
        },
        {
          phase: "03",
          label: "System",
          desc: "Define reusable assets—mascot/badges, layout rules, and menu language—to keep outputs consistent and flexible.",
        },
        {
          phase: "04",
          label: "Expression",
          desc: "Apply the system across takeaway packaging, posters, in-store visuals, and social-ready compositions.",
        },
      ],
      sections: [
        {
          eyebrow: "Concept",
          title: "Make the brand feel like it’s been marked",
          body: [
            "The concept work centers on tactility: stamp-style graphics, bold marks, and packaging cues that feel like they’ve been pressed into the brand’s surfaces.",
            "Instead of one precious lockup, the system favors repeatable components that can travel across wrappers, bags, posters, and menus without losing intensity.",
          ],
          imageLayout: "left",
          tone: "light",
        },
        {
          eyebrow: "Identity System",
          title: "Badges, menu language, and sticker assets",
          body: [
            "The identity system is built as a toolkit: mascot/badge marks, supporting stickers, and typographic rules that keep layouts tight and recognizable.",
            "This lets the brand stay consistent across menu touchpoints while still leaving room for campaign energy and playful variation.",
          ],
          imageLayout: "right",
          tone: "light",
        },
        {
          eyebrow: "Launch Expression",
          title: "Packaging-first, campaign-ready",
          body: [
            "Launch assets prove the system under real constraints—cropping, repetition, and quick-format adaptation—without losing the embossed ‘mark’ idea.",
            "The result is a brand language that works in-store, in-hand, and on-feed, with a clear green-and-pink signature.",
          ],
          imageLayout: "left",
          tone: "navy",
        },
      ],
      impactMetrics: [
        {
          label: "Recall",
          value: "Stronger visual recall through a compact sticker-and-logo system built around the ‘mark’ concept.",
        },
        {
          label: "Consistency",
          value: "A unified identity across menu, packaging, merchandise, and campaign touchpoints.",
        },
        {
          label: "Flexibility",
          value: "A brand language that adapts cleanly to storefront presence and social content formats.",
        },
      ],
      credits: [
        { label: "Services", value: "Branding, Visual Identity, Packaging Direction, Art Direction" },
      ],
    },
    relatedProjectSlugs: [],
  },
  qpasta: {
    key: "qpasta",
    slug: "qpasta",
    title: "QPASTA",
    serviceType: "Branding",
    tags: ["Branding", "Packaging", "Campaign"],
    workFilters: ["Branding"],
    cardAspectRatio: "portrait",
    featuredAspectRatio: "landscape",
    inheritThemeFromPalette: true,
    sortOrder: 250,
    themePalette: {
      accent: { hex: "#43564B", name: "Deep Olive" },
      secondary: { hex: "#B72339", name: "Tomato Red" },
      background: { hex: "#EDEDEE", name: "Light Grey" },
      foreground: { hex: "#1E1E1E", name: "Black" },
      supporting: [{ hex: "#E5D8C3", name: "Cream" }],
    },
    media: {
      cardImage: media("/Users/metwally/Downloads/Qwebsite-01.webp", "QPASTA listing card"),
      primaryShowcase: media("/Users/metwally/Downloads/Qwebsite-03.webp", "QPASTA primary showcase"),
      storySections: [
        media("/Users/metwally/Downloads/Qwebsite-08.webp", "QPASTA concept direction"),
        media("/Users/metwally/Downloads/Qwebsite-02.webp", "QPASTA identity system"),
        media("/Users/metwally/Downloads/Qwebsite-09.webp", "QPASTA brand in use"),
      ],
      gallery: [
        media("/Users/metwally/Downloads/Qwebsite-02.webp", "QPASTA visual exploration 1"),
        media("/Users/metwally/Downloads/Qwebsite-05.webp", "QPASTA visual exploration 2"),
        media("/Users/metwally/Downloads/Qwebsite-06.webp", "QPASTA visual exploration 3"),
        media("/Users/metwally/Downloads/Qwebsite-07.webp", "QPASTA visual exploration 4"),
        media("/Users/metwally/Downloads/Qwebsite-09.webp", "QPASTA visual exploration 5"),
        media("/Users/metwally/Downloads/Qwebsite-10.webp", "QPASTA visual exploration 6"),
        media("/Users/metwally/Downloads/Qwebsite-04.webp", "QPASTA visual exploration 7"),
      ],
    },
    copy: {
      heroLabel: "Brand Identity",
      heroTitle: "QPASTA",
      heroSubtitle:
        "A pasta-and-pizza brand that feels cinematic, recognizable, and modern across dine‑in and takeaway touchpoints.",
      heroSummary:
        "QPASTA blends Italian comfort-food cues with a sharper, contemporary bilingual identity—packaging, campaign assets, and a playful character system that carries from coffee to takeaway.",
      introMeta: {
        type: "Branding",
        client: "QPASTA",
        deliverables:
          "Brand identity, packaging, campaign visuals, character system, coffee and takeaway applications",
        launchLabel: "Explore the identity",
      },
      overview: [
        { label: "Service", value: "Branding" },
        { label: "Scope", value: "Identity, packaging, character, campaign-ready assets" },
        { label: "Strategy", value: "Bilingual mark + cinematic Italian references + modern grid" },
        { label: "Palette", value: "Olive + tomato with soft neutrals and editorial monochrome" },
      ],
      intro: [
        "QPASTA is a comfort-food brand with a sharper editorial edge. The identity blends Italian-cinema references and classic menu cues with a contemporary bilingual mark—designed to feel as confident on packaging as it does on an in-store wall or a social post.",
        "Olive green anchors the system, tomato red provides the punch, and soft neutrals keep the typography and photography readable. A playful pizza character and campaign slogans add warmth, while monochrome editorial imagery gives the brand a distinctive, cinematic rhythm across touchpoints.",
      ],
      process: [
        {
          phase: "01",
          label: "Discovery",
          desc: "Define the brand thesis, category cues to keep, and the bilingual voice that should remain consistent across all applications.",
        },
        {
          phase: "02",
          label: "Concept",
          desc: "Develop a contemporary direction rooted in Italian references without becoming generic—balancing editorial structure and food-led warmth.",
        },
        {
          phase: "03",
          label: "System",
          desc: "Build logo behaviors, character assets, slogan rules, and layout components that scale across packaging and campaign formats.",
        },
        {
          phase: "04",
          label: "Expression",
          desc: "Apply the system to dine-in and takeaway moments—menus, coffee, promotions, and storefront-ready collateral.",
        },
      ],
      sections: [
        {
          eyebrow: "Concept",
          title: "Italian references, edited for a modern brand",
          body: [
            "The concept phase aimed for instantly readable Italian cues—cinema, menu typography, and classic composition—without drifting into pastiche.",
            "By keeping the system grid-led and typographically disciplined, the brand can move between monochrome editorial moments and vivid food photography without feeling split.",
          ],
          imageLayout: "left",
          tone: "light",
        },
        {
          eyebrow: "Identity System",
          title: "Logo behavior, character, and campaign assets",
          body: [
            "The identity toolkit pairs the bilingual mark with a playful character layer for warmth and recall—staying flexible for pizza, pasta, and coffee moments.",
            "Slogans and modular graphic elements support campaign builds, while a consistent typographic rhythm keeps every layout recognizably QPASTA.",
          ],
          imageLayout: "right",
          tone: "light",
        },
        {
          eyebrow: "Brand In Use",
          title: "Promotions, loyalty, and takeaway presence",
          body: [
            "Applications focus on the real brand moments: packaging in-hand, in-store collateral, and promotional mechanics that need to stay legible at speed.",
            "The system holds across touchpoints—menus, loyalty, takeaway, and social—connecting product photography with editorial storytelling.",
          ],
          imageLayout: "left",
          tone: "navy",
        },
      ],
      impactMetrics: [
        {
          label: "Recall",
          value: "Stronger recall through a distinct bilingual mark and playful character system.",
        },
        {
          label: "Flexibility",
          value: "A flexible identity that spans pizza, pasta, coffee, and promotional touchpoints without losing coherence.",
        },
        {
          label: "Storytelling",
          value: "A clearer brand world connecting vivid product photography with editorial, cinematic framing.",
        },
      ],
      credits: [
        { label: "Services", value: "Branding, Visual Identity, Packaging Direction, Art Direction" },
      ],
    },
    relatedProjectSlugs: [],
  },
  "come-true": {
    key: "come-true",
    slug: "come-true",
    title: "COME TRUE",
    serviceType: "Branding",
    tags: ["Branding", "Packaging", "Campaign"],
    workFilters: ["Branding"],
    cardAspectRatio: "portrait",
    featuredAspectRatio: "landscape",
    inheritThemeFromPalette: true,
    sortOrder: 280,
    themePalette: {
      accent: { hex: "#013F90", name: "Blue" },
      secondary: { hex: "#EAE5D9", name: "Beige" },
      background: { hex: "#EAE5D9", name: "Beige" },
      foreground: { hex: "#013F90", name: "Blue" },
    },
    media: {
      cardImage: media("/Users/metwally/Downloads/cometruewebsite-07.webp", "COME TRUE listing card"),
      primaryShowcase: media("/Users/metwally/Downloads/cometruewebsite-03.webp", "COME TRUE primary showcase"),
      storySections: [
        media("/Users/metwally/Downloads/cometruewebsite-01.webp", "COME TRUE concept direction"),
        media("/Users/metwally/Downloads/cometruewebsite-02.webp", "COME TRUE identity system"),
        media("/Users/metwally/Downloads/cometruewebsite-06.webp", "COME TRUE brand in use"),
      ],
      gallery: [
        media("/Users/metwally/Downloads/cometruewebsite-02.webp", "COME TRUE visual exploration 1"),
        media("/Users/metwally/Downloads/cometruewebsite-04.webp", "COME TRUE visual exploration 2"),
        media("/Users/metwally/Downloads/cometruewebsite-05.webp", "COME TRUE visual exploration 3"),
        media("/Users/metwally/Downloads/cometruewebsite-06.webp", "COME TRUE visual exploration 4"),
        media("/Users/metwally/Downloads/cometruewebsite-10.webp", "COME TRUE visual exploration 5"),
        media("/Users/metwally/Downloads/cometruewebsite-11.webp", "COME TRUE visual exploration 6"),
        media("/Users/metwally/Downloads/cometruewebsite-09.webp", "COME TRUE visual exploration 7"),
      ],
    },
    copy: {
      heroLabel: "Brand Identity",
      heroTitle: "COME TRUE",
      heroSubtitle:
        "A café brand built to feel light, memorable, and emotionally positive across takeaway and in‑store moments.",
      heroSummary:
        "COME TRUE turns coffee and pastry into an uplifting daily ritual—anchored by cobalt blue, warm neutrals, and a simple bird icon across packaging, merchandise, café applications, and campaign visuals.",
      introMeta: {
        type: "Branding",
        client: "COME TRUE",
        deliverables: "Brand identity, packaging, merchandise, café applications, campaign visuals",
        launchLabel: "Explore the identity",
      },
      overview: [
        { label: "Service", value: "Branding" },
        { label: "Scope", value: "Identity, packaging, merchandise, café touchpoints, campaigns" },
        { label: "Strategy", value: "Ownable symbol + color clarity + optimistic language" },
        { label: "Palette", value: "Cobalt blue with warm neutral beige" },
      ],
      intro: [
        "COME TRUE is built around optimism you can hold: coffee and pastry as a small daily reset. The identity treats the brand message as a motion cue—light, forward, and clear—so every surface feels like a gentle push toward better days.",
        "A simplified bird icon becomes the anchor: easy to recognize, easy to repeat, and flexible across packaging and campaign moments. Cobalt blue provides instant recall, beige keeps the system warm and approachable, and open-sky imagery supports a clean, uplifting tone across product photography and lifestyle scenes.",
      ],
      process: [
        {
          phase: "01",
          label: "Discovery",
          desc: "Define the ritual: what the café stands for, how it should feel, and which touchpoints shape everyday perception.",
        },
        {
          phase: "02",
          label: "Concept",
          desc: "Develop the bird-led thesis and the optimistic voice—testing how symbol, color, and message work together.",
        },
        {
          phase: "03",
          label: "System",
          desc: "Build packaging behaviors, icon usage rules, and layout components that scale from cups to boxes to campaigns.",
        },
        {
          phase: "04",
          label: "Expression",
          desc: "Apply the system across retail carryout, café moments, merchandise, and campaign visuals to validate consistency.",
        },
      ],
      sections: [
        {
          eyebrow: "Concept",
          title: "Dreams, distilled into everyday ritual",
          body: [
            "The concept phase centered on a simple idea: dreams taking shape in the everyday. The bird motif and open-sky language give the brand a clear emotional direction without becoming sentimental.",
            "By keeping the system minimal and repeatable, the identity stays strong across packaging, signage, and campaign imagery.",
          ],
          imageLayout: "left",
          tone: "light",
        },
        {
          eyebrow: "Identity System",
          title: "Packaging behavior and symbol clarity",
          body: [
            "The identity system prioritizes recognition: a consistent cobalt signature, a simple icon, and packaging layouts that stay readable at speed.",
            "From cups to pastry boxes, the components remix cleanly while keeping the brand message and visual rhythm intact.",
          ],
          imageLayout: "right",
          tone: "light",
        },
        {
          eyebrow: "Brand In Use",
          title: "Carryout, campaigns, and merch presence",
          body: [
            "Applications prove the brand in the places it lives: carryout moments, café environments, and campaign-ready visuals.",
            "Merchandise and retail extensions keep the same optimistic tone—strong in product photography and equally confident in lifestyle imagery.",
          ],
          imageLayout: "left",
          tone: "navy",
        },
      ],
      impactMetrics: [
        { label: "Recall", value: "Clearer recall through a simple, ownable symbol and bold cobalt color system." },
        {
          label: "Consistency",
          value: "Consistent expression across cups, pastry boxes, merchandise, and digital campaign assets.",
        },
        {
          label: "Flexibility",
          value: "A flexible identity that feels equally strong in product photography and lifestyle imagery.",
        },
      ],
      credits: [
        { label: "Services", value: "Branding, Visual Identity, Packaging Direction, Art Direction" },
      ],
    },
    relatedProjectSlugs: [],
  },
  "wahed-makhlout": {
    key: "wahed-makhlout",
    slug: "wahed-makhlout",
    title: "WAHED MAKHLOUT",
    serviceType: "Branding",
    tags: ["Branding", "Packaging", "Campaign"],
    workFilters: ["Branding"],
    cardAspectRatio: "portrait",
    featuredAspectRatio: "landscape",
    inheritThemeFromPalette: true,
    sortOrder: 260,
    themePalette: {
      accent: { hex: "#7F2422", name: "Tea" },
      secondary: { hex: "#21361B", name: "Tea Leaf" },
      background: { hex: "#E4EEC8", name: "Bloomlight" },
      foreground: { hex: "#21361B", name: "Tea Leaf" },
    },
    media: {
      cardImage: media("/Users/metwally/Downloads/TEAwebsite-01.webp", "WAHED MAKHLOUT listing card"),
      primaryShowcase: media("/Users/metwally/Downloads/TEAwebsite-03.webp", "WAHED MAKHLOUT primary showcase"),
      storySections: [
        media("/Users/metwally/Downloads/TEAwebsite-08.webp", "WAHED MAKHLOUT concept direction"),
        media("/Users/metwally/Downloads/TEAwebsite-02.webp", "WAHED MAKHLOUT identity system"),
        media("/Users/metwally/Downloads/TEAwebsite-05.webp", "WAHED MAKHLOUT brand in use"),
      ],
      gallery: [
        media("/Users/metwally/Downloads/TEAwebsite-02.webp", "WAHED MAKHLOUT visual exploration 1"),
        media("/Users/metwally/Downloads/TEAwebsite-04.webp", "WAHED MAKHLOUT visual exploration 2"),
        media("/Users/metwally/Downloads/TEAwebsite-05.webp", "WAHED MAKHLOUT visual exploration 3"),
        media("/Users/metwally/Downloads/TEAwebsite-06.webp", "WAHED MAKHLOUT visual exploration 4"),
        media("/Users/metwally/Downloads/TEAwebsite-07.webp", "WAHED MAKHLOUT visual exploration 5"),
        media("/Users/metwally/Downloads/TEAwebsite-09.webp", "WAHED MAKHLOUT visual exploration 6"),
      ],
    },
    copy: {
      heroLabel: "Brand Identity",
      heroTitle: "WAHED MAKHLOUT",
      heroSubtitle:
        "A tea brand shaped to feel rooted, warm, and instantly recognizable across takeaway and retail touchpoints.",
      heroSummary:
        "WAHED MAKHLOUT builds a tea identity around warmth, ritual, and a single memorable blend—pairing expressive Arabic typography with a color-led system across packaging, cups, and campaign visuals.",
      introMeta: {
        type: "Branding",
        client: "WAHED MAKHLOUT",
        deliverables: "Brand identity, packaging, cup design, merchandise, campaign visuals",
        launchLabel: "Explore the identity",
      },
      overview: [
        { label: "Service", value: "Branding" },
        { label: "Scope", value: "Identity, packaging, cups, takeaway presentation, campaigns" },
        { label: "Strategy", value: "One blend promise + color-led recognition + Arabic typographic voice" },
        { label: "Palette", value: "Deep tea red with leaf green and botanical light tones" },
      ],
      intro: [
        "WAHED MAKHLOUT is designed around one clear promise: a single blend you remember. The identity leans into ritual—cup in hand, takeaway in motion, packaging on the counter—building recognition through repeatable cues rather than over-designed complexity.",
        "A compact Arabic wordmark anchors the system, while the palette does the heavy lifting: rich hibiscus-inspired red for appetite and warmth, leaf green for grounded contrast, and soft botanical light tones to keep the surfaces breathable. The brand language extends naturally into characters and illustrations tied to tea culture without becoming ornamental.",
      ],
      process: [
        {
          phase: "01",
          label: "Discovery",
          desc: "Define the blend promise, cultural cues, and the brand voice that should stay consistent across every touchpoint.",
        },
        {
          phase: "02",
          label: "Concept",
          desc: "Develop a color-led direction with a compact Arabic mark and supporting illustration language for warmth and ritual.",
        },
        {
          phase: "03",
          label: "System",
          desc: "Set typography, layout rules, and packaging/cup behaviors so the identity scales across formats without losing clarity.",
        },
        {
          phase: "04",
          label: "Expression",
          desc: "Apply the system to takeaway moments, merchandise, and campaign-style visuals to prove consistency in the real world.",
        },
      ],
      sections: [
        {
          eyebrow: "Concept",
          title: "One blend, unmistakable presence",
          body: [
            "The concept stage focused on making the brand feel immediate and ownable: a single-blend thesis supported by a bold, color-led identity.",
            "Expressive Arabic typography and simple graphic cues create a recognizable signature that stays consistent across packaging and campaigns.",
          ],
          imageLayout: "left",
          tone: "light",
        },
        {
          eyebrow: "Identity System",
          title: "Typography, carriers, and the hero pack",
          body: [
            "The identity system sets rules for how the mark, typography, and illustration elements behave across cups, carriers, and packaging.",
            "The goal is clarity at speed—assets that read instantly in takeaway motion while staying rich enough for retail presence.",
          ],
          imageLayout: "right",
          tone: "light",
        },
        {
          eyebrow: "Brand In Use",
          title: "Everyday touchpoints, consistent ritual",
          body: [
            "Brand-in-use applications prioritize the everyday: cups, carry trays, and packaging moments where repetition builds familiarity.",
            "The system extends cleanly into merchandise and lifestyle imagery while keeping a warm, rooted tone.",
          ],
          imageLayout: "left",
          tone: "navy",
        },
      ],
      impactMetrics: [
        {
          label: "Recall",
          value: "Stronger recall through a compact Arabic wordmark and a color-led identity system.",
        },
        {
          label: "Consistency",
          value: "A consistent brand presence across cups, packaging, and wearable applications.",
        },
        {
          label: "Flexibility",
          value: "A flexible visual language that supports both product communication and lifestyle imagery.",
        },
      ],
      credits: [
        { label: "Services", value: "Branding, Visual Identity, Packaging Direction, Art Direction" },
      ],
    },
    relatedProjectSlugs: [],
  },
  lima: {
    key: "lima",
    slug: "lima",
    title: "lima",
    serviceType: "Branding",
    tags: ["Branding", "Fashion", "Packaging"],
    workFilters: ["Branding"],
    cardAspectRatio: "portrait",
    featuredAspectRatio: "landscape",
    inheritThemeFromPalette: true,
    sortOrder: 290,
    themePalette: {
      accent: { hex: "#4C0F12", name: "Burgundy" },
      secondary: { hex: "#EAD1D6", name: "Soft Pink" },
      background: { hex: "#EAEAE7", name: "Warm Off-White" },
      foreground: { hex: "#000000", name: "Black" },
    },
    media: {
      cardImage: media("/Users/metwally/Downloads/Untitled-1-03.webp", "lima listing card"),
      primaryShowcase: media("/Users/metwally/Downloads/Untitled-1-01.webp", "lima primary showcase"),
      storySections: [
        media("/Users/metwally/Downloads/Untitled-1-02.webp", "lima concept direction"),
        media("/Users/metwally/Downloads/Untitled-1-04.webp", "lima identity system"),
        media("/Users/metwally/Downloads/Untitled-1-08.webp", "lima brand in use"),
      ],
      gallery: [
        media("/Users/metwally/Downloads/Untitled-1-04.webp", "lima visual exploration 1"),
        media("/Users/metwally/Downloads/Untitled-1-05.webp", "lima visual exploration 2"),
        media("/Users/metwally/Downloads/Untitled-1-06.webp", "lima visual exploration 3"),
        media("/Users/metwally/Downloads/Untitled-1-08.webp", "lima visual exploration 4"),
        media("/Users/metwally/Downloads/Untitled-1-07.webp", "lima visual exploration 5"),
        media("/Users/metwally/Downloads/Untitled-1-09.webp", "lima visual exploration 6"),
        media("/Users/metwally/Downloads/Untitled-1-10.webp", "lima visual exploration 7"),
        media("/Users/metwally/Downloads/Untitled-1-11.webp", "lima visual exploration 8"),
      ],
    },
    copy: {
      heroLabel: "Brand Identity",
      heroTitle: "lima",
      heroSubtitle:
        "A refined abaya brand designed to feel modern, composed, and premium across retail and digital touchpoints.",
      heroSummary:
        "lima builds a fashion identity around restraint and polish—rich burgundy tone, soft blush contrast, and an editorial system that carries from packaging to garment presentation and social rollouts.",
      introMeta: {
        type: "Branding",
        client: "lima",
        deliverables: "Brand identity, packaging, stationery, garment presentation, social assets",
        launchLabel: "Explore the identity",
      },
      overview: [
        { label: "Service", value: "Branding" },
        { label: "Scope", value: "Identity, packaging, stationery, social campaign assets" },
        { label: "Strategy", value: "Fashion-first restraint with tonal contrast and editorial composition" },
        { label: "Palette", value: "Burgundy + blush with elegant neutrals" },
      ],
      intro: [
        "lima is a fashion brand built around restraint. The identity emphasizes clean composition, controlled typography, and a tonal palette that feels confident without being loud—supporting an abaya world where silhouette and material do the storytelling.",
        "Deep burgundy creates weight and presence, soft blush introduces warmth, and off-white neutrals keep the system breathable. The result is a refined print language that scales across labels, packaging, and social formats while maintaining an editorial, composed tone.",
      ],
      process: [
        {
          phase: "01",
          label: "Discovery",
          desc: "Define the brand voice and the retail/digital moments where the identity needs to feel most premium and composed.",
        },
        {
          phase: "02",
          label: "Concept",
          desc: "Establish the fashion-first direction—shadow, tonal contrast, and minimal typography—then test across core touchpoints.",
        },
        {
          phase: "03",
          label: "System",
          desc: "Build the packaging and stationery toolkit: labels, cards, tags, and supporting print rules that stay restrained and consistent.",
        },
        {
          phase: "04",
          label: "Expression",
          desc: "Apply the system to garment presentation and social rollouts to validate how it performs in real brand moments.",
        },
      ],
      sections: [
        {
          eyebrow: "Concept",
          title: "Fashion-first restraint",
          body: [
            "The concept phase framed lima through composition and tone: controlled layouts, shadow-led imagery, and burgundy as a signature of depth and confidence.",
            "By keeping the typography minimal and the palette disciplined, the brand stays modern and premium across retail and digital contexts.",
          ],
          imageLayout: "left",
          tone: "light",
        },
        {
          eyebrow: "Identity System",
          title: "Logo application and restrained print language",
          body: [
            "The identity system focuses on repeatable applications—labels, packaging, and stationery—where restraint reads as quality.",
            "Supporting print elements are quiet by design, letting the garments and editorial styling carry the visual lead.",
          ],
          imageLayout: "right",
          tone: "light",
        },
        {
          eyebrow: "Brand In Use",
          title: "Packaging, tags, and social rollout",
          body: [
            "Brand-in-use applications prioritize cohesive presentation: bags, tags, cards, and packaging moments designed to feel composed in-hand and on-camera.",
            "The system translates cleanly to social assets, maintaining the same premium tone through typography, color, and spacing discipline.",
          ],
          imageLayout: "left",
          tone: "navy",
        },
      ],
      impactMetrics: [
        { label: "Recognition", value: "Stronger recognition through a disciplined, fashion-led identity system." },
        {
          label: "Consistency",
          value: "Consistent expression across packaging, tags, stationery, and social touchpoints.",
        },
        {
          label: "Premium Feel",
          value: "A premium brand presence supported by controlled typography and tonal contrast.",
        },
      ],
      credits: [
        { label: "Services", value: "Branding, Visual Identity, Packaging Direction, Art Direction" },
      ],
    },
    relatedProjectSlugs: [],
  },
  neamah: {
    key: "neamah",
    slug: "neamah",
    title: "Neamah",
    serviceType: "Branding",
    tags: ["Branding", "Packaging", "Retail"],
    workFilters: ["Branding"],
    cardAspectRatio: "portrait",
    featuredAspectRatio: "landscape",
    inheritThemeFromPalette: true,
    sortOrder: 270,
    themePalette: {
      accent: { hex: "#7C0914", name: "Red" },
      secondary: { hex: "#214952", name: "Dark Green" },
      background: { hex: "#FCF9E6", name: "Beige" },
      foreground: { hex: "#214952", name: "Dark Green" },
      supporting: [
        { hex: "#4F0001", name: "Dark Red" },
        { hex: "#DDC9E4", name: "Lavender" },
        { hex: "#CBE6E4", name: "Mint" },
        { hex: "#FFD8DE", name: "Pink" },
        { hex: "#C6923E", name: "Gold" },
        { hex: "#000000", name: "Black" },
      ],
    },
    media: {
      cardImage: media("/Users/metwally/Downloads/Nwebsite-01.webp", "Neamah listing card"),
      primaryShowcase: media("/Users/metwally/Downloads/Nwebsite-03.webp", "Neamah primary showcase"),
      storySections: [
        media("/Users/metwally/Downloads/Nwebsite-08.webp", "Neamah concept direction"),
        media("/Users/metwally/Downloads/Nwebsite-05.webp", "Neamah identity system"),
        media("/Users/metwally/Downloads/Nwebsite-12.webp", "Neamah brand in use"),
      ],
      gallery: [
        media("/Users/metwally/Downloads/Nwebsite-02.webp", "Neamah visual exploration 1"),
        media("/Users/metwally/Downloads/Nwebsite-04.webp", "Neamah visual exploration 2"),
        media("/Users/metwally/Downloads/Nwebsite-05.webp", "Neamah visual exploration 3"),
        media("/Users/metwally/Downloads/Nwebsite-06.webp", "Neamah visual exploration 4"),
        media("/Users/metwally/Downloads/Nwebsite-07.webp", "Neamah visual exploration 5"),
        media("/Users/metwally/Downloads/Nwebsite-09.webp", "Neamah visual exploration 6"),
        media("/Users/metwally/Downloads/Nwebsite-10.webp", "Neamah visual exploration 7"),
        media("/Users/metwally/Downloads/Nwebsite-11.webp", "Neamah visual exploration 8"),
        media("/Users/metwally/Downloads/Nwebsite-12.webp", "Neamah visual exploration 9"),
        media("/Users/metwally/Downloads/Nwebsite-13.webp", "Neamah visual exploration 10"),
        media("/Users/metwally/Downloads/Nwebsite-14.webp", "Neamah visual exploration 11"),
        media("/Users/metwally/Downloads/Nwebsite-15.webp", "Neamah visual exploration 12"),
        media("/Users/metwally/Downloads/Nwebsite-16.webp", "Neamah visual exploration 13"),
      ],
    },
    copy: {
      heroLabel: "Brand Identity",
      heroTitle: "Neamah",
      heroSubtitle:
        "A heritage bakery identity shaped to feel celebratory, culturally rooted, and premium across gifting and retail touchpoints.",
      heroSummary:
        "Neamah reframes a heritage sweets and bakery brand as a warm, giftable visual world—floral illustration, soft-tone packaging, and gold-led details across categories, seasons, and retail presentation.",
      introMeta: {
        type: "Branding",
        client: "Neamah",
        deliverables:
          "Brand identity, packaging, illustration system, retail applications, campaign visuals",
        launchLabel: "Explore the system",
      },
      overview: [
        { label: "Service", value: "Branding" },
        { label: "Scope", value: "Identity, packaging system, illustration direction, retail presence" },
        { label: "Strategy", value: "Heritage storytelling + giftable premium packaging language" },
        { label: "Tone", value: "Warm, celebratory, hospitality-led" },
      ],
      intro: [
        "Neamah’s identity work focuses on the emotional value of traditional sweets: memory, hospitality, and celebration. The system is designed to feel giftable and premium without losing the warmth that makes the category feel personal.",
        "Rich red and green create the core signature, while pastel variants and floral ornament let the packaging flex across product types and seasons. Gold detailing and structured layouts keep the world refined, and a character-led family story adds a human layer without relying on dated nostalgia. The copy avoids hard-coding a founding year until it’s verified.",
      ],
      process: [
        {
          phase: "01",
          label: "Discovery",
          desc: "Define the heritage cues, gifting behaviors, and retail moments where the brand needs to feel most premium and recognizable.",
        },
        {
          phase: "02",
          label: "Concept",
          desc: "Build a celebratory direction rooted in memory and hospitality—balancing ornament, structure, and a warm brand voice.",
        },
        {
          phase: "03",
          label: "System",
          desc: "Create a scalable packaging and illustration toolkit that flexes across categories, sizes, and seasonal offerings.",
        },
        {
          phase: "04",
          label: "Expression",
          desc: "Apply the system to gifting, retail presentation, and campaign-ready visuals to validate consistency in real contexts.",
        },
      ],
      sections: [
        {
          eyebrow: "Concept",
          title: "Memory, generosity, and the value of sweets",
          body: [
            "The concept phase framed Neamah as more than product—it’s a gesture. The system is designed for gifting moments where packaging carries meaning before the box is opened.",
            "Warm color roles and refined structure turn heritage cues into an identity that feels current, premium, and emotionally resonant.",
          ],
          imageLayout: "left",
          tone: "light",
        },
        {
          eyebrow: "Identity System",
          title: "Floral motifs and a flexible packaging language",
          body: [
            "Floral illustration and soft-tone variants build a recognizable signature that can adapt across categories while staying cohesive.",
            "The packaging language balances ornament with structure: consistent typography, clear hierarchy, and gold detailing for premium finish.",
          ],
          imageLayout: "right",
          tone: "light",
        },
        {
          eyebrow: "Brand In Use",
          title: "Premium gifting and retail presence",
          body: [
            "Applications focus on how the brand shows up in the world—on shelves, in seasonal moments, and in off-site gifting contexts.",
            "The system supports everyday offerings and special releases with the same core voice, keeping the world cohesive and elevated.",
          ],
          imageLayout: "left",
          tone: "navy",
        },
      ],
      impactMetrics: [
        {
          label: "Recall",
          value: "Stronger recall through a distinctive heritage-led illustration system and color signature.",
        },
        {
          label: "Consistency",
          value: "Consistent expression across gifting, bakery, and retail packaging formats.",
        },
        {
          label: "Flexibility",
          value: "A premium identity that flexes across everyday and seasonal offerings without losing coherence.",
        },
      ],
      credits: [
        { label: "Services", value: "Branding, Visual Identity, Packaging Direction, Art Direction" },
      ],
    },
    relatedProjectSlugs: [],
  },
};

export function resolveProjectSeedConfig(keyOrSlug: string) {
  const normalized = keyOrSlug.trim().toLowerCase();
  const direct = projectSeedConfigs[normalized];
  if (direct) return direct;

  return Object.values(projectSeedConfigs).find(
    (config) => config.slug.toLowerCase() === normalized,
  );
}
