"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";

type ShowcaseImage = { url: string; alt: string };

export default function ServiceShowcaseSlider({
  images,
  aspectRatio = "4/3",
}: {
  images: ShowcaseImage[];
  aspectRatio?: string;
}) {
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [emblaRef, api] = useEmblaCarousel({
    loop: true,
    dragFree: false,
    direction: isRtl ? "rtl" : "ltr",
  });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api, onSelect]);

  const btnCls =
    "flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground/70 shadow backdrop-blur transition hover:bg-background hover:text-foreground";

  if (images.length === 1) {
    return (
      <div
        className="relative mt-5 w-full overflow-hidden rounded-xl"
        style={{ aspectRatio }}
      >
        <Image
          src={images[0].url}
          alt={images[0].alt || ""}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-2.5">
      {/* Embla viewport — explicit dir so Embla's RTL calc matches CSS layout */}
      <div ref={emblaRef} className="overflow-hidden rounded-xl" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative min-w-0 flex-[0_0_100%]"
              style={{ aspectRatio }}
            >
              <Image
                src={img.url}
                alt={img.alt || ""}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controls — always LTR so icon positions are predictable; handlers flip for RTL */}
      <div className="flex items-center justify-between px-0.5" dir="ltr">
        <button
          onClick={() => isRtl ? api?.scrollNext() : api?.scrollPrev()}
          className={btnCls}
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === selected
                  ? "w-5 bg-foreground/70"
                  : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => isRtl ? api?.scrollPrev() : api?.scrollNext()}
          className={btnCls}
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
