import { getLocale } from "next-intl/server";
import CreativeHero from "@/components/sections/CreativeHero";
import Projects from "@/components/sections/Projects";
import FaqQuoteSection from "@/components/sections/FaqQuoteSection";
import ProductSection from "@/components/sections/ProductSection";
import TextImageSection from "@/components/builder/sections/TextImageSection";
import MetricsSection from "@/components/builder/sections/MetricsSection";
import RichTextSection from "@/components/builder/sections/RichTextSection";
import WhatWeDoSection from "@/components/builder/sections/WhatWeDoSection";
import AboutHeroSection from "@/components/builder/sections/AboutHeroSection";
import AboutContentSection from "@/components/builder/sections/AboutContentSection";
import AboutMissionSection from "@/components/builder/sections/AboutMissionSection";
import AboutProcessSection from "@/components/builder/sections/AboutProcessSection";
import ServicesHeroSection from "@/components/builder/sections/ServicesHeroSection";
import ServicesFilterBar from "@/components/builder/sections/ServicesFilterBar";
import ServicesSectionBlock from "@/components/builder/sections/ServicesSectionBlock";
import ServicesCredentialsSection from "@/components/builder/sections/ServicesCredentialsSection";
import type { WhatWeDoItem } from "@/components/builder/sections/WhatWeDoSection";
import type { ProcessStep } from "@/components/builder/sections/AboutProcessSection";
import type { ServiceCard } from "@/components/builder/sections/ServicesSectionBlock";
import type { CredentialStat } from "@/components/builder/sections/ServicesCredentialsSection";
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
            // Read media_items from section.content directly — resolveContent must not merge
            // AR translations over the EN item array; AR alts are handled separately via arAlts.
            const rawItems = Array.isArray(section.content.media_items)
              ? (section.content.media_items as Array<{ type: "image" | "video"; url: string; posterUrl?: string; alt: string }>)
              : [];
            const arAlts = isAr
              ? ((section.translations?.ar as Record<string, unknown> | undefined)?.media_items_alts ?? []) as string[]
              : [];

            const config: CreativeHeroConfig = {
              headline: String(c.headline ?? ""),
              highlight: String(c.highlight ?? ""),
              body: String(c.body ?? ""),
              primaryCta: c.cta_label
                ? { label: String(c.cta_label), href: String(c.cta_url ?? "#") }
                : undefined,
              media: rawItems.length > 0
                ? {
                    items: rawItems.map((item, i) => ({
                      type: item.type,
                      url: item.url,
                      posterUrl: item.posterUrl,
                      alt: isAr ? (arAlts[i] || item.alt) : item.alt,
                    })),
                  }
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

          case "what_we_do":
            return (
              <WhatWeDoSection
                key={section.id}
                eyebrow={String(c.eyebrow ?? "")}
                title={String(c.title ?? "")}
                body={String(c.body ?? "")}
                items={Array.isArray(c.items) ? (c.items as WhatWeDoItem[]) : []}
              />
            );

          case "about_hero":
            return (
              <AboutHeroSection
                key={section.id}
                title={String(c.title ?? "")}
                body={String(c.body ?? "")}
              />
            );

          case "about_content":
            return (
              <AboutContentSection
                key={section.id}
                eyebrow={String(c.eyebrow ?? "")}
                title={String(c.title ?? "")}
                body={String(c.body ?? "")}
                sectionId={String(c.section_id ?? "")}
              />
            );

          case "about_mission":
            return (
              <AboutMissionSection
                key={section.id}
                eyebrow={String(c.eyebrow ?? "")}
                quote={String(c.quote ?? "")}
              />
            );

          case "about_process":
            return (
              <AboutProcessSection
                key={section.id}
                eyebrow={String(c.eyebrow ?? "")}
                title={String(c.title ?? "")}
                body={String(c.body ?? "")}
                steps={Array.isArray(c.steps) ? (c.steps as ProcessStep[]) : []}
              />
            );

          case "services_hero":
            return (
              <div key={section.id}>
                <ServicesHeroSection
                  title={String(c.title ?? "")}
                  body={String(c.body ?? "")}
                />
                <ServicesFilterBar />
              </div>
            );

          case "services_section": {
            // Track index across services_section instances
            const svcIdx = sections
              .slice(0, sections.indexOf(section))
              .filter((s) => s.type === "services_section").length;
            return (
              <ServicesSectionBlock
                key={section.id}
                index={svcIdx}
                sectionId={String(c.section_id ?? "")}
                eyebrow={String(c.eyebrow ?? "")}
                title={String(c.title ?? "")}
                body={String(c.body ?? "")}
                link_label={String(c.link_label ?? "")}
                cards={Array.isArray(c.cards) ? (c.cards as ServiceCard[]) : []}
              />
            );
          }

          case "services_credentials":
            return (
              <ServicesCredentialsSection
                key={section.id}
                eyebrow={String(c.eyebrow ?? "")}
                title={String(c.title ?? "")}
                body={String(c.body ?? "")}
                stats={Array.isArray(c.stats) ? (c.stats as CredentialStat[]) : []}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}
