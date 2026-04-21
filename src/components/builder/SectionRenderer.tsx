import CreativeHero from "@/components/sections/CreativeHero";
import Projects from "@/components/sections/Projects";
import FaqQuoteSection from "@/components/sections/FaqQuoteSection";
import ProductSection from "@/components/sections/ProductSection";
import TextImageSection from "@/components/builder/sections/TextImageSection";
import MetricsSection from "@/components/builder/sections/MetricsSection";
import RichTextSection from "@/components/builder/sections/RichTextSection";
import type { PageSectionDb } from "@/lib/page-data";
import type { ProjectSummaryDb } from "@/lib/project-data";
import type { FaqItemDb } from "@/lib/faq-data";
import type { CreativeHeroConfig } from "@/lib/hero-types";

interface Props {
  sections: PageSectionDb[];
  projects?: ProjectSummaryDb[];
  faqItems?: FaqItemDb[];
}

export default function SectionRenderer({
  sections,
  projects = [],
  faqItems = [],
}: Props) {
  return (
    <>
      {sections.map((section) => {
        const c = section.content;

        switch (section.type) {
          case "hero": {
            const config: CreativeHeroConfig = {
              headline: String(c.headline ?? ""),
              highlight: String(c.highlight ?? ""),
              body: String(c.body ?? ""),
              primaryCta: c.cta_label
                ? { label: String(c.cta_label), href: String(c.cta_url ?? "#") }
                : undefined,
            };
            return <CreativeHero key={section.id} config={config} />;
          }

          case "text_image":
            return (
              <TextImageSection
                key={section.id}
                eyebrow={String(c.eyebrow ?? "")}
                title={String(c.title ?? "")}
                body={Array.isArray(c.body) ? (c.body as string[]) : []}
                image_url={String(c.image_url ?? "")}
                image_alt={String(c.image_alt ?? "")}
                image_layout={(c.image_layout as "left" | "right") ?? "right"}
                tone={(c.tone as "light" | "navy") ?? "light"}
              />
            );

          case "projects_grid":
            return <Projects key={section.id} projects={projects} />;

          case "faq":
            return <FaqQuoteSection key={section.id} faqItems={faqItems} />;

          case "product_feature":
            return <ProductSection key={section.id} />;

          case "metrics":
            return (
              <MetricsSection
                key={section.id}
                heading={String(c.heading ?? "")}
                items={
                  Array.isArray(c.items)
                    ? (c.items as Array<{ label: string; value: string }>)
                    : []
                }
              />
            );

          case "rich_text":
            return <RichTextSection key={section.id} html={String(c.html ?? "")} />;

          default:
            return null;
        }
      })}
    </>
  );
}
