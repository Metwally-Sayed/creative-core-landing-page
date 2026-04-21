import { getTranslations } from "next-intl/server";
import { getFaqItems } from "@/lib/faq-data";
import { getProjects } from "@/lib/project-data";
import CreativeHero from "@/components/sections/CreativeHero";
import Projects from "@/components/sections/Projects";
import ProductSection from "@/components/sections/ProductSection";
import FaqQuoteSection from "@/components/sections/FaqQuoteSection";
import type { CreativeHeroConfig } from "@/lib/hero-types";

export const revalidate = 60;

export default async function Home() {
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const [faqItems, projects] = await Promise.all([getFaqItems(), getProjects()]);

  const heroConfig: CreativeHeroConfig = {
    headline: `${t("heroHeadlineLine1")}\n${t("heroHeadlineLine2")}`,
    highlight: t("heroHighlight"),
    body: t("heroBody"),
    primaryCta: { label: tCommon("startProject"), href: "#quote" },
    secondaryCta: { label: tCommon("seeWork"), href: "/work" },
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main>
        <CreativeHero config={heroConfig} />
        <Projects projects={projects} />
        <ProductSection />
        <FaqQuoteSection faqItems={faqItems} />
      </main>
    </div>
  );
}
