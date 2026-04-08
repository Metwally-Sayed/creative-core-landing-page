import type { HomepageBlock } from "@/lib/cms-homepage";

interface LogoStripRendererProps {
  block: HomepageBlock;
}

export default function LogoStripRenderer({ block }: LogoStripRendererProps) {
  const logos = block.logos ?? [];
  const eyebrow = String(block.eyebrow || "");
  const heading = String(block.heading || "");
  const body = String(block.body || "");

  return (
    <section className="site-section px-5 lg:px-20 py-24">
      <div className="site-shell max-w-[1400px]">
        {(eyebrow || heading || body) && (
          <div className="mb-12 text-center">
            {eyebrow && <p className="eyebrow text-secondary">{eyebrow}</p>}
            {heading && <h2 className="text-5xl lg:text-7xl text-accent mt-4">{heading}</h2>}
            {body && <p className="text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">{body}</p>}
          </div>
        )}
        
        {logos.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {logos.map((logo, i) => (
              <div key={i} className="flex items-center justify-center h-12 md:h-16">
                {logo.url ? (
                  logo.href ? (
                    <a
                      href={logo.href}
                      target={logo.href.startsWith("http") ? "_blank" : undefined}
                      rel={logo.href.startsWith("http") ? "noreferrer noopener" : undefined}
                      className="block"
                    >
                      <img
                        src={logo.url}
                        alt={logo.name || ""}
                        className="h-full w-auto object-contain grayscale opacity-60 transition-opacity hover:opacity-100"
                      />
                    </a>
                  ) : (
                    <img
                      src={logo.url}
                      alt={logo.name || ""}
                      className="h-full w-auto object-contain grayscale opacity-60 transition-opacity hover:opacity-100"
                    />
                  )
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
