import Link from "next/link";
import type { HomepageBlock } from "@/lib/cms-homepage";

interface CtaBannerRendererProps {
  block: HomepageBlock;
}

export default function CtaBannerRenderer({ block }: CtaBannerRendererProps) {
  const eyebrow = String(block.eyebrow || "");
  const heading = String(block.heading || "");
  const body = String(block.body || "");
  const primaryCtaLabel = String(block.primaryCtaLabel || "");
  const primaryCtaHref = String(block.primaryCtaHref || "#");
  const secondaryCtaLabel = String(block.secondaryCtaLabel || "");
  const secondaryCtaHref = String(block.secondaryCtaHref || "#");
  const themeVariant = String(block.themeVariant || "standard");

  const bgClass = themeVariant === "inverted" 
    ? "bg-accent text-white" 
    : "bg-white text-accent border border-[hsl(var(--border))]";

  return (
    <section className="site-section px-5 lg:px-20 py-24">
      <div className={`site-shell max-w-[1400px] rounded-[3rem] p-8 md:p-16 ${bgClass}`}>
        <div className="text-center max-w-3xl mx-auto">
          {eyebrow && (
            <p className="eyebrow text-secondary/80 mb-4">{eyebrow}</p>
          )}
          {heading && (
            <h2 className="text-4xl md:text-6xl font-serif mb-6">
              {heading}
            </h2>
          )}
          {body && (
            <p className="text-lg opacity-80 mb-8">
              {body}
            </p>
          )}
          
          {(primaryCtaLabel || secondaryCtaLabel) && (
            <div className="flex flex-wrap justify-center gap-4">
              {primaryCtaLabel && (
                <Link href={primaryCtaHref} className="btn-primary">
                  {primaryCtaLabel}
                </Link>
              )}
              {secondaryCtaLabel && (
                <Link href={secondaryCtaHref} className="btn-outline">
                  {secondaryCtaLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
