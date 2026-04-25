"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const categories = [
  { label: "All", id: null },
  { label: "Branding", id: "branding" },
  { label: "3D interior design", id: "3d-interior-design" },
  { label: "social media", id: "social-media" },
  { label: "photography", id: "photography" },
  { label: "Packaging & Print Design", id: "packaging-print-design" },
  { label: "Content Creation", id: "content-creation" },
] as const;

type CategoryId = (typeof categories)[number]["id"];

export default function ServicesFilterBar() {
  const [active, setActive] = useState<CategoryId>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionIds = categories
      .map((c) => c.id)
      .filter(Boolean) as string[];

    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id as CategoryId);
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  function scrollTo(id: CategoryId) {
    setActive(id);
    if (!id) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      ref={barRef}
      className="sticky top-[64px] z-30 w-full border-b border-border/30 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto max-w-[1520px] px-6 md:px-12 lg:px-20">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
          {categories.map((cat) => {
            const isActive = active === cat.id;
            return (
              <button
                key={cat.label}
                onClick={() => scrollTo(cat.id)}
                className="relative shrink-0 rounded-full px-4 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.3em] transition-colors duration-200"
              >
                <span className={`relative z-10 transition-colors duration-200 ${isActive ? "text-white" : "text-accent/50 hover:text-accent"}`}>
                  {cat.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="services-filter-pill"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
