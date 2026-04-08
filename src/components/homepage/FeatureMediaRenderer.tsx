import ProductSection from "@/components/sections/ProductSection";
import type { HomepageBlock } from "@/lib/cms-homepage";

interface FeatureMediaRendererProps {
  block: HomepageBlock;
}

export default function FeatureMediaRenderer({ block }: FeatureMediaRendererProps) {
  return (
    <ProductSection
      id={block.anchorId || "product"}
      eyebrow={block.eyebrow}
      heading={block.heading}
      body={block.body}
      backgroundMediaType={block.backgroundMediaType}
      backgroundImage={block.backgroundImage?.url}
      backgroundVideo={block.backgroundVideo?.url}
      stats={block.stats}
      primaryCtaLabel={block.primaryCtaLabel}
      primaryCtaHref={block.primaryCtaHref}
      secondaryCtaLabel={block.secondaryCtaLabel}
      secondaryCtaHref={block.secondaryCtaHref}
    />
  );
}
