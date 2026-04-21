import { getLocale } from "next-intl/server";
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
  pageSlug?: string;
}

// Merge AR translations on top of EN content for the current locale.
// Fields with no AR value fall back to English automatically.
function resolveContent(
  section: PageSectionDb,
  isAr: boolean
): Record<string, unknown> {
  if (!isAr) return section.content;
  const ar = ((section.translations?.ar ?? {}) as Record<string, unknown>);
  // Only override entries that are non-empty strings / non-empty arrays
  const overrides = Object.fromEntries(
    Object.entries(ar).filter(([, v]) => {
      if (typeof v === "string") return v.trim().length > 0;
      if (Array.isArray(v)) return v.length > 0;
      return v != null;
    })
  );
  return { ...section.content, ...overrides };
}

export default async function SectionRenderer({
  sections,
  projects = [],
  faqItems = [],
  pageSlug,
}: Props) {
  const locale = await getLocale();
  const isAr = locale === "ar";

  return (
    <>
      {sections.map((section) => {
        const c = resolveContent(section, isAr);

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
            return <Projects key={section.id} projects={projects} showHeader={pageSlug !== "work"} />;

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
