import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import ProductSection from "@/components/sections/ProductSection";
import FaqQuoteSection from "@/components/sections/FaqQuoteSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main>
        <Hero />
        <Projects />
        <ProductSection />
        <FaqQuoteSection />
      </main>
    </div>
  );
}
