import Hero from "@/components/sections/Hero";
import type { HomepageBlock } from "@/lib/cms-homepage";

interface HeroRendererProps {
  block: HomepageBlock;
}

export default function HeroRenderer({ block }: HeroRendererProps) {
  return (
    <Hero
      id={block.anchorId || "home"}
      eyebrowText={block.eyebrow}
      scenes={block.headlineRotator}
      desktopVideoSrc={block.desktopVideo?.url}
      mobileVideoSrc={block.mobileVideo?.url}
      posterImageSrc={block.posterImage?.url}
      scrollCueLabel={block.scrollCueLabel}
    />
  );
}
