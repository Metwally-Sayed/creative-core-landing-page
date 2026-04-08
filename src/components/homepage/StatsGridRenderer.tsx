import Link from "next/link";
import type { HomepageBlock } from "@/lib/cms-homepage";

interface StatsGridRendererProps {
  block: HomepageBlock;
}

export default function StatsGridRenderer({ block }: StatsGridRendererProps) {
  const stats = (block.stats as { label: string; value: string; supportingText?: string }[] | undefined) || [];
  const columns = String(block.columns || "3");
  const eyebrow = String(block.eyebrow || "");
  const heading = String(block.heading || "");
  const body = String(block.body || "");
  const primaryCtaLabel = String(block.primaryCtaLabel || "");
  const primaryCtaHref = String(block.primaryCtaHref || "#");
  
  const gridCols = {
    "2": "grid-cols-1 md:grid-cols-2",
    "3": "grid-cols-1 md:grid-cols-3",
    "4": "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns] || "grid-cols-1 md:grid-cols-3";

  return (
    <section className="site-section px-5 lg:px-20 py-24">
      <div className="site-shell max-w-[1400px]">
        {(eyebrow || heading || body) && (
          <div className="mb-16">
            {eyebrow && (
              <p className="eyebrow text-secondary">{eyebrow}</p>
            )}
            {heading && (
              <h2 className="text-5xl lg:text-7xl text-accent mt-4">
                {heading}
              </h2>
            )}
            {body && (
              <p className="text-xl text-muted-foreground mt-6 max-w-2xl">
                {body}
              </p>
            )}
          </div>
        )}
        
        {stats.length > 0 && (
          <div className={`grid ${gridCols} gap-12`}>
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-4xl md:text-5xl font-serif text-accent">{stat.value}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-secondary mt-2">{stat.label}</p>
                {stat.supportingText && (
                  <p className="text-sm text-muted-foreground mt-1">{stat.supportingText}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {primaryCtaLabel && (
          <div className="mt-12">
            <Link href={primaryCtaHref} className="btn-primary">
              {primaryCtaLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
