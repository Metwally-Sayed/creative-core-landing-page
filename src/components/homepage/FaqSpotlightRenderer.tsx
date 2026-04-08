import FaqQuoteSection from "@/components/sections/FaqQuoteSection";
import type { HomepageBlock } from "@/lib/cms-homepage";

interface FaqSpotlightRendererProps {
  block: HomepageBlock;
}

export default function FaqSpotlightRenderer({ block }: FaqSpotlightRendererProps) {
  return (
    <FaqQuoteSection
      id={block.anchorId || "faq"}
      eyebrow={block.eyebrow}
      heading={block.heading}
      subheading={block.subheading}
      items={block.faqItems}
      quoteLauncherLabel={block.quoteLauncherLabel}
    />
  );
}
