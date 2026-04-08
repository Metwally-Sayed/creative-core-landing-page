import type { HomepageBlock } from "@/lib/cms-homepage";

interface MediaGalleryRendererProps {
  block: HomepageBlock;
}

export default function MediaGalleryRenderer({ block }: MediaGalleryRendererProps) {
  const items = block.mediaItems ?? [];
  const eyebrow = String(block.eyebrow || "");
  const heading = String(block.heading || "");
  const body = String(block.body || "");
  const layoutVariant = String(block.layoutVariant || "grid");

  const gridClass = {
    grid: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    carousel: "flex overflow-x-auto gap-4",
    masonry: "columns-1 md:columns-2 lg:columns-3",
  }[layoutVariant] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="site-section px-5 lg:px-20 py-24">
      <div className="site-shell max-w-[1400px]">
        {(eyebrow || heading || body) && (
          <div className="mb-12">
            {eyebrow && <p className="eyebrow text-secondary">{eyebrow}</p>}
            {heading && <h2 className="text-5xl lg:text-7xl text-accent mt-4">{heading}</h2>}
            {body && <p className="text-xl text-muted-foreground mt-6 max-w-2xl">{body}</p>}
          </div>
        )}
        
        {items.length > 0 && (
          <div className={`grid ${gridClass} gap-6`}>
            {items.map((item, i) => (
              <div key={i} className="relative">
                {item.url ? (
                  item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noreferrer noopener" : undefined}
                      className="block"
                    >
                      <img
                        src={item.url}
                        alt={item.alt || ""}
                        className="w-full h-auto rounded-lg transition-opacity hover:opacity-90"
                      />
                    </a>
                  ) : (
                    <img src={item.url} alt={item.alt || ""} className="w-full h-auto rounded-lg" />
                  )
                ) : null}
                {item.caption && <p className="mt-2 text-sm text-muted-foreground">{item.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
