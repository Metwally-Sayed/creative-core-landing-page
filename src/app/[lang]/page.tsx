import { getPage } from "@/lib/page-data";
import { getProjects } from "@/lib/project-data";
import { getFaqItems } from "@/lib/faq-data";
import SectionRenderer from "@/components/builder/SectionRenderer";
import CreativeHero from "@/components/sections/CreativeHero";
import Projects from "@/components/sections/Projects";
import ProductSection from "@/components/sections/ProductSection";
import FaqQuoteSection from "@/components/sections/FaqQuoteSection";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { CreativeHeroConfig } from "@/lib/hero-types";

export const revalidate = 60;

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);

  const homePage = await getPage("home");

  // If a home page exists in DB with sections, render via builder
  if (homePage && homePage.sections.length > 0) {
    const needsProjects = homePage.sections.some((s) => s.type === "projects_grid");
    const needsFaq = homePage.sections.some((s) => s.type === "faq");
    const [projects, faqItems] = await Promise.all([
      needsProjects ? getProjects() : Promise.resolve([]),
      needsFaq ? getFaqItems() : Promise.resolve([]),
    ]);
    return (
      <div className="min-h-screen bg-transparent text-foreground">
        <SectionRenderer sections={homePage.sections} projects={projects} faqItems={faqItems} />
      </div>
    );
  }

  // Fallback: static homepage if no home page in DB yet
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
