import CreativeHero from "@/components/sections/CreativeHero";
import Projects from "@/components/sections/Projects";
import ProductSection from "@/components/sections/ProductSection";
import FaqQuoteSection from "@/components/sections/FaqQuoteSection";
import type { CreativeHeroConfig } from "@/lib/hero-types";

const heroConfig: CreativeHeroConfig = {
  headline: "Ideas That\nOrbit Your",
  highlight: "Core.",
  body: "Brand strategy, identity, content, and 3D visuals that convert.",
  primaryCta: { label: "Start Your Project", href: "#quote" },
  secondaryCta: { label: "See Our Work", href: "/work" },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main>
        <CreativeHero config={heroConfig} />
        <Projects />
        <ProductSection />
        <FaqQuoteSection />
      </main>
    </div>
  );
}
