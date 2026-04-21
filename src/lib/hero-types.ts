export type HeroVariant = "current" | "creative";

export type HeroCTA = {
  label: string;
  href: string;
};

export type HeroMediaItem = {
  type: "image" | "video";
  url: string;
  alt: string;
  posterUrl?: string;
  href?: string;
};

export type CreativeHeroConfig = {
  kicker?: string;
  headline: string;
  highlight?: string;
  body?: string;
  subcopy?: string;
  primaryCta?: HeroCTA;
  secondaryCta?: HeroCTA;
  media?: {
    items: HeroMediaItem[];
  };
  layout?: {
    variant?: "split" | "stacked";
    mediaSide?: "left" | "right";
  };
  style?: {
    background?: "none" | "soft";
    textAlign?: "left" | "center";
  };
};

export type CurrentHeroConfig = {
  eyebrow?: string;
  title?: string;
  body?: string;
  titleLines?: string[];
  videoUrl?: string;
  desktopVideoUrl?: string;
  mobileVideoUrl?: string;
  posterImageUrl?: string;
  scrollCueLabel?: string;
  overlayStyle?: "none" | "light" | "dark";
  minHeightVariant?: "standard" | "tall";
};

export type HeroConfig = {
  isVisible: boolean;
  variant: HeroVariant;
  current?: CurrentHeroConfig;
  creative?: CreativeHeroConfig;
};
