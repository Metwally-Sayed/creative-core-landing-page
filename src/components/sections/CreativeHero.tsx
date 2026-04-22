"use client";

import { Link } from "@/i18n/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Highlighter } from "@/components/ui/highlighter";
import type { SphereMediaItem } from "@/components/ui/image-sphere";
import ImageSphere from "@/components/ui/image-sphere";
import { Magnetic } from "@/components/ui/magnetic";
import type { CreativeHeroConfig } from "@/lib/hero-types";
import { cn } from "@/lib/utils";

type CreativeHeroProps = {
  id?: string;
  config: CreativeHeroConfig;
};

const DEFAULT_SPHERE_MEDIA: SphereMediaItem[] = [
  { id: "1", type: "image", url: "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=200&h=200&fit=crop", alt: "Abstract art 1" },
  { id: "2", type: "image", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop", alt: "Abstract art 2" },
  { id: "3", type: "image", url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop", alt: "Brand design 1" },
  { id: "4", type: "image", url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=200&fit=crop", alt: "Brand design 2" },
  { id: "5", type: "image", url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&h=200&fit=crop", alt: "Creative work 1" },
  { id: "6", type: "image", url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop", alt: "Creative work 2" },
  { id: "7", type: "image", url: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=200&h=200&fit=crop", alt: "Portfolio piece 1" },
  { id: "8", type: "image", url: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=200&h=200&fit=crop", alt: "Portfolio piece 2" },
];

export default function CreativeHero({ id, config }: CreativeHeroProps) {
  const headline = (config.headline || "Ideas That\nOrbit Your").trim();
  const highlight = (config.highlight || "Core.").trim();
  const body =
    (config.body || "Brand strategy, identity, content, and 3D visuals that convert.").trim();

  const cmsMedia = (config.media?.items ?? []).filter((item) => item.url && item.alt);
  const combinedMedia = [...cmsMedia, ...DEFAULT_SPHERE_MEDIA].slice(0, 8);
  const items: SphereMediaItem[] = combinedMedia.map((item, index) => ({
    id: String(index + 1),
    type: item.type,
    url: item.url,
    posterUrl: item.posterUrl,
    alt: item.alt,
    href: item.href,
  }));

  const primaryLabel = config.primaryCta?.label || "Start Your Project";
  const primaryHref = config.primaryCta?.href || "#quote";
  const secondaryLabel = config.secondaryCta?.label || "See Our Work";
  const secondaryHref = config.secondaryCta?.href || "/work";

  const headlineLines = headline.split("\n").map((line) => line.trim()).filter(Boolean);

  return (
    <section id={id} className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-32 pb-16 md:py-0">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,hsl(var(--background))_0%,hsl(var(--background)/0.85)_45%,transparent_100%)]" />
      <div className="mx-auto grid max-w-7xl w-full grid-cols-1 items-center gap-12 px-5 md:grid-cols-2 md:px-20 md:py-32">
        <div>
          <h1 className="mb-6 text-[42px] font-bold leading-[1.15] text-primary md:text-[72px] md:leading-[1.1]">
            {headlineLines.length > 0 ? (
              <>
                {headlineLines.map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {line}
                    <br />
                  </span>
                ))}
              </>
            ) : null}
            <Highlighter
              action="highlight"
              color="#ef9a56"
              strokeWidth={5}
              animationDuration={750}
            >
              {highlight}
            </Highlighter>
          </h1>

          <p className="mb-4 text-base leading-relaxed text-foreground md:text-lg">{body}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            {primaryLabel ? (
              <Magnetic intensity={0.15} range={120}>
                <Link
                  href={primaryHref}
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "lg" }),
                    "h-auto rounded-xl bg-secondary px-8 py-3.5 text-base font-semibold text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  )}
                >
                  {primaryLabel}
                </Link>
              </Magnetic>
            ) : null}
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <ImageSphere items={items} sphereRadius={180} containerSize={400} autoRotate={true} />
        </div>
      </div>
    </section>
  );
}
