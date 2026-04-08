import QuoteBriefDialog from "@/components/QuoteBriefDialog";
import type { HomepageBlock } from "@/lib/cms-homepage";

interface QuoteLauncherRendererProps {
  block: HomepageBlock;
}

export default function QuoteLauncherRenderer({ block }: QuoteLauncherRendererProps) {
  const triggerLabel = String(block.triggerLabel || "Get Quote");
  const eyebrow = String(block.eyebrow || "");
  const heading = String(block.heading || "");
  const body = String(block.body || "");
  const themeVariant = String(block.themeVariant || "primary");
  const containerClass =
    themeVariant === "secondary"
      ? "site-card-solid border border-[hsl(var(--border))]/70 text-center"
      : "site-card-navy text-center";
  
  return (
    <section id={block.anchorId || undefined} className="px-5 py-20 lg:px-20">
      <div className={`${containerClass} rounded-[2.5rem] p-8 lg:p-12`}>
        {(eyebrow || heading || body) && (
          <div className="mb-8">
            {eyebrow && (
              <p className="eyebrow mb-4 text-secondary/80">{eyebrow}</p>
            )}
            {heading && (
              <h2 className={`mb-4 text-4xl font-serif lg:text-5xl ${themeVariant === "secondary" ? "text-accent" : "text-white"}`}>
                {heading}
              </h2>
            )}
            {body && (
              <p className={`mx-auto max-w-2xl text-lg ${themeVariant === "secondary" ? "text-muted-foreground" : "text-white/70"}`}>
                {body}
              </p>
            )}
          </div>
        )}
        <QuoteBriefDialog
          triggerLabel={triggerLabel}
          triggerClassName="h-14 rounded-full bg-secondary text-secondary-foreground font-bold uppercase tracking-widest"
        />
      </div>
    </section>
  );
}
