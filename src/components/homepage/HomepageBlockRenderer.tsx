import type { HomepageBlock } from "@/lib/cms-homepage";
import HeroRenderer from "./HeroRenderer";
import CuratedProjectsRenderer from "./CuratedProjectsRenderer";
import FeatureMediaRenderer from "./FeatureMediaRenderer";
import FaqSpotlightRenderer from "./FaqSpotlightRenderer";
import QuoteLauncherRenderer from "./QuoteLauncherRenderer";
import StatsGridRenderer from "./StatsGridRenderer";
import RichTextContentRenderer from "./RichTextContentRenderer";
import MediaGalleryRenderer from "./MediaGalleryRenderer";
import LogoStripRenderer from "./LogoStripRenderer";
import CtaBannerRenderer from "./CtaBannerRenderer";

interface HomepageBlockRendererProps {
  blocks: HomepageBlock[];
}

export default function HomepageBlockRenderer({ blocks }: HomepageBlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen py-20">
        <p className="text-muted-foreground">No content configured. Add blocks in the CMS.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {blocks.map((block, index) => {
        const key = block.anchorId || `${block.blockType}-${index}`;
        
        switch (block.blockType) {
          case "hero":
            return <HeroRenderer key={key} block={block} />;
          case "curatedProjects":
            return <CuratedProjectsRenderer key={key} block={block} />;
          case "featureMedia":
            return <FeatureMediaRenderer key={key} block={block} />;
          case "faqSpotlight":
            return <FaqSpotlightRenderer key={key} block={block} />;
          case "quoteLauncher":
            return <QuoteLauncherRenderer key={key} block={block} />;
          case "statsGrid":
            return <StatsGridRenderer key={key} block={block} />;
          case "richTextContent":
            return <RichTextContentRenderer key={key} block={block} />;
          case "mediaGallery":
            return <MediaGalleryRenderer key={key} block={block} />;
          case "logoStrip":
            return <LogoStripRenderer key={key} block={block} />;
          case "ctaBanner":
            return <CtaBannerRenderer key={key} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
