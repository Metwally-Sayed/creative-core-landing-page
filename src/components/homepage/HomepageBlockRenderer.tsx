import type { ReactNode } from "react";
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

  const renderedBlocks: ReactNode[] = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const key = block.anchorId || `${block.blockType}-${index}`;

    if (block.blockType === "hero" && blocks[index + 1]?.blockType === "curatedProjects") {
      const nextBlock = blocks[index + 1];
      const nextKey = nextBlock.anchorId || `${nextBlock.blockType}-${index + 1}`;
      const mergeTopBackground = block.heroVariant === "creative";

      renderedBlocks.push(
        <div key={`${key}-${nextKey}-merged`} className="relative">
          <HeroRenderer block={block} />
          <CuratedProjectsRenderer block={nextBlock} mergeTopBackground={mergeTopBackground} />
        </div>,
      );

      index += 1;
      continue;
    }

    switch (block.blockType) {
      case "hero":
        renderedBlocks.push(<HeroRenderer key={key} block={block} />);
        break;
      case "curatedProjects":
        renderedBlocks.push(<CuratedProjectsRenderer key={key} block={block} />);
        break;
      case "featureMedia":
        renderedBlocks.push(<FeatureMediaRenderer key={key} block={block} />);
        break;
      case "faqSpotlight":
        renderedBlocks.push(<FaqSpotlightRenderer key={key} block={block} />);
        break;
      case "quoteLauncher":
        renderedBlocks.push(<QuoteLauncherRenderer key={key} block={block} />);
        break;
      case "statsGrid":
        renderedBlocks.push(<StatsGridRenderer key={key} block={block} />);
        break;
      case "richTextContent":
        renderedBlocks.push(<RichTextContentRenderer key={key} block={block} />);
        break;
      case "mediaGallery":
        renderedBlocks.push(<MediaGalleryRenderer key={key} block={block} />);
        break;
      case "logoStrip":
        renderedBlocks.push(<LogoStripRenderer key={key} block={block} />);
        break;
      case "ctaBanner":
        renderedBlocks.push(<CtaBannerRenderer key={key} block={block} />);
        break;
      default:
        break;
    }
  }

  return (
    <div className="flex flex-col">
      {renderedBlocks}
    </div>
  );
}
