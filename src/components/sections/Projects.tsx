"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, useScroll, useTransform, useMotionTemplate, LayoutGroup } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import LiquidCard from '@/components/LiquidCard';
import { Link } from '@/i18n/navigation';
import { useDirection } from '@/hooks/useDirection';
import type { ProjectSummaryDb } from '@/lib/project-data';
import type { TagDb } from '@/lib/tags-data';

// Liquid blob card component
function LiquidProjectCard({ project, index, locale, allTags }: { project: ProjectSummaryDb; index: number; locale: string; allTags: TagDb[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isHovered, setIsHovered] = useState(false);

  // We start at -45 so its initial unhovered state matches the original "straight up" look before rotating.
  const angle = useMotionValue(-45);
  const smoothAngle = useSpring(angle, { damping: 20, stiffness: 200, mass: 0.5 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const x = e.clientX - rect.left - centerX;
      const y = e.clientY - rect.top - centerY;
      
      // Calculate angle. ArrowUpRight naturally points top-right (-45 degrees natively).
      // We add 45 to align it.
      let deg = Math.atan2(y, x) * (180 / Math.PI) + 45;
      
      // Prevent wild spinning when the angle wraps around 180/-180 bounds
      const prev = angle.get();
      while (deg - prev > 180) deg -= 360;
      while (deg - prev < -180) deg += 360;
      
      angle.set(deg);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    angle.set(-45); // Return to default pointing up
  };

  const aspectRatioClass = {
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    square: 'aspect-square',
  }[project.aspect_ratio];

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{
        duration: 0.7,
        delay: index * 0.08,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="group cursor-pointer h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <Link href={`/projects/${project.slug}`} className="block">
        <LiquidCard
          aspectRatio={aspectRatioClass}
          className="mb-3 border border-white/70 bg-white/78 shadow-[0_18px_44px_rgba(30,52,86,0.1)]"
        >
          <div ref={cardRef} className="absolute inset-0 overflow-hidden bg-white/70">
            <motion.img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-full object-cover"
              animate={{
                scale: isHovered ? 1.08 : 1,
              }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            />
            
            {/* Hover overlay */}
            <motion.div
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,49,82,0.02)_0%,rgba(22,49,82,0.22)_100%)] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* View button */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--secondary))] shadow-[0_18px_40px_rgba(255,146,92,0.35)]"
                style={{ rotate: smoothAngle }}
                initial={{ scale: 0 }}
                animate={{
                  scale: isHovered ? 1 : 0,
                }}
                transition={{
                  scale: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
                }}
              >
                <ArrowUpRight className="h-6 w-6 text-[hsl(var(--secondary-foreground))]" />
              </motion.div>
            </motion.div>
          </div>
        </LiquidCard>

        {/* Content */}
        {(() => {
          const ar = locale === "ar" ? project.translations?.ar : undefined;
          const displayTitle = ar?.title ?? project.title;
          const tagBySlug = new Map(allTags.map((t) => [t.slug, t]));
          const tagByTitle = new Map(allTags.map((t) => [t.title_en.toLowerCase(), t]));
          const seenSlugs = new Set<string>();
          const displayTags = project.tags
            .map((raw) => {
              const tag = tagBySlug.get(raw) ?? tagByTitle.get(raw.toLowerCase());
              if (!tag || seenSlugs.has(tag.slug)) return null;
              seenSlugs.add(tag.slug);
              return locale === "ar" && tag.title_ar ? tag.title_ar : tag.title_en;
            })
            .filter((v): v is string => v !== null);
          return (
            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-serif leading-tight text-[hsl(var(--accent))] transition-opacity duration-300 group-hover:opacity-60">
                {displayTitle}
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayTags.map((label, i) => (
                  <span
                    key={i}
                    className="text-xs text-[hsl(var(--muted-foreground))]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
      </Link>
    </motion.article>
  );
}

export default function Projects({ projects, tags = [], showHeader = true }: { projects: ProjectSummaryDb[]; tags?: TagDb[]; showHeader?: boolean }) {
  const t = useTranslations("home");
  const locale = useLocale();
  const dir = useDirection();
  const [activeSlug, setActiveSlug] = useState<string>("all");
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, { damping: 25, stiffness: 120, mass: 0.5 });
  const yUp = useTransform(smoothProgress, [0, 1], [0, -150]);
  const yDown = useTransform(smoothProgress, [0, 1], [0, 150]);
  
  const yUpPx = useMotionTemplate`${yUp}px`;
  const yDownPx = useMotionTemplate`${yDown}px`;

  const filteredProjects = activeSlug === "all"
    ? projects
    : (() => {
        const activeTag = tags.find(t => t.slug === activeSlug);
        if (!activeTag) return [];
        const titleLower = activeTag.title_en.toLowerCase();
        return projects.filter(p =>
          p.tags.some(raw => raw === activeTag.slug || raw.toLowerCase() === titleLower)
        );
      })();

  // ── Infinite-scroll pagination ──────────────────────────────────────────────
  // Page size = 6 → divides perfectly into the 3-column lg layout (2 per col),
  // matching the photography-tab look. Each scroll-triggered load adds 6 more.
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset pagination whenever the user changes the filter tab.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeSlug]);

  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

  // Observe the sentinel; when it enters the viewport, load the next page.
  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) =>
            Math.min(c + PAGE_SIZE, filteredProjects.length)
          );
        }
      },
      // Trigger 300px before the user actually reaches the bottom so the
      // load feels seamless rather than a hard stop.
      { rootMargin: "300px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, filteredProjects.length]);

  const headingText = t("projectsTitle");

  return (
    <motion.section 
      ref={sectionRef} 
      style={{
        "--y-up": yUpPx,
        "--y-down": yDownPx,
      } as React.CSSProperties}
      className={`relative overflow-hidden px-5 pb-16 md:pb-24 lg:px-20 lg:pb-28 ${showHeader ? "-mt-16 pt-28 lg:-mt-24 lg:pt-36" : "pt-40 lg:pt-52"}`}
      id="work"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background)/0.96)_34%,hsl(var(--background)/0.7)_68%,transparent_100%)] lg:h-40" />
      <div className="site-shell relative z-20 max-w-350 px-0 py-16">
        {showHeader && (
          <>
            <div className="mb-24 space-y-6 lg:mb-32">
              <motion.p
                initial={{ opacity: 0, x: -20 * dir }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                className="eyebrow"
              >
                {t("projectsEyebrow")}
              </motion.p>
              <h2 className="max-w-2xl text-4xl leading-[1.1] text-accent md:text-5xl lg:text-6xl">
                {headingText.split(" ").map((word, i) => (
                  <span key={i} className="inline-block overflow-hidden me-[0.2em] py-1">
                    <motion.span
                      initial={{ y: "100%" }}
                      animate={isInView ? { y: 0 } : {}}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.04,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="inline-block"
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </h2>
            </div>

            {/* Category Filters */}
            <div className="mb-16 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mb-20 lg:overflow-visible">
              <LayoutGroup id="filter-tabs">
                <div className="flex w-max gap-3 lg:w-auto lg:flex-wrap lg:gap-4">
                  {[{ slug: "all", label: t("projectsFilterAll") }, ...tags.map(tag => ({
                    slug: tag.slug,
                    label: locale === "ar" && tag.title_ar ? tag.title_ar : tag.title_en,
                  }))].map(({ slug, label }) => {
                    const isActive = activeSlug === slug;
                    return (
                      <button
                        key={slug}
                        onClick={() => setActiveSlug(slug)}
                        className="group relative shrink-0 overflow-hidden rounded-full px-6 py-2 text-xs font-semibold"
                      >
                        <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-accent group-hover:text-secondary'}`}>
                          {label}
                        </span>
                        {isActive ? (
                          <motion.div
                            layoutId="activeCat"
                            className="absolute inset-0 bg-accent"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        ) : (
                          <div className="absolute inset-0 border border-accent/10 rounded-full group-hover:border-accent/30 transition-colors" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </LayoutGroup>
            </div>
          </>
        )}

        {/* Masonry Grid — controlled columns so parallax is always conflict-free */}
        {(() => {
          const total = visibleProjects.length;
          if (total === 0) return null;

          // Use 4 lg columns when the full filtered set has 7+ items so the
          // layout stays balanced regardless of how many pages have loaded.
          // With 7–12 items: 4 cols → ~3/3/2/2 or 3/3/3/3 distributions.
          // With ≤6 items (e.g. a small filter tab): 3 cols → 2/2/2.
          const numLgCols: 3 | 4 = filteredProjects.length >= 7 ? 4 : 3;

          // Distribute items into N columns by *estimated height* while preserving
          // sequential reading order (items 0..k in col 0, k+1..m in col 1, etc).
          // Each card's height ≈ image aspect-ratio + a constant title block.
          // This keeps column bottoms roughly aligned even when aspect ratios vary
          // and the item count doesn't divide evenly into N.
          const TITLE_BLOCK = 0.28; // ~title + tags height, normalized to image width
          const estHeight = (ar: ProjectSummaryDb["aspect_ratio"]) => {
            // image height / image width
            const ratio = ar === "portrait" ? 4 / 3 : ar === "landscape" ? 3 / 4 : 1;
            return ratio + TITLE_BLOCK;
          };

          const makeCols = (n: number) => {
            const heights = visibleProjects.map((p) => estHeight(p.aspect_ratio));
            const totalH = heights.reduce((s, h) => s + h, 0);
            const targetPerCol = totalH / n;

            const cols: { p: typeof visibleProjects[0]; i: number }[][] =
              Array.from({ length: n }, () => []);

            let curCol = 0;
            let cumulative = 0;
            for (let i = 0; i < visibleProjects.length; i++) {
              // Advance to the next column when crossing the running threshold,
              // but only if we still have items left for the remaining columns
              // (avoid leaving a column empty).
              const itemsLeft = visibleProjects.length - i;
              const colsLeft = n - curCol;
              const mustAdvance = itemsLeft <= colsLeft - 1;
              const wantAdvance =
                curCol < n - 1 && cumulative >= targetPerCol * (curCol + 1);

              if (mustAdvance || wantAdvance) {
                curCol = Math.min(curCol + 1, n - 1);
              }

              cols[curCol].push({ p: visibleProjects[i], i });
              cumulative += heights[i];
            }

            return cols;
          };

          // Parallax direction: even column index → up, odd → down
          const colClass = (ci: number) =>
            `flex flex-col gap-4 will-change-transform ${
              ci % 2 === 0
                ? "![transform:translateY(var(--y-up))]"
                : "![transform:translateY(var(--y-down))]"
            }`;

          const renderCols = (cols: { p: typeof visibleProjects[0]; i: number }[][]) =>
            cols.map((colItems, ci) => (
              <div key={ci} className={colClass(ci)}>
                {colItems.map(({ p, i }) => (
                  <LiquidProjectCard key={p.id} project={p} index={i} locale={locale} allTags={tags} />
                ))}
              </div>
            ));

          return (
            <div key={activeSlug} className="min-h-[600px]">
              {/* Mobile — 1 column, original item order */}
              <div className="flex flex-col gap-4 md:hidden">
                {visibleProjects.map((p, i) => (
                  <LiquidProjectCard key={p.id} project={p} index={i} locale={locale} allTags={tags} />
                ))}
              </div>

              {/* md — 2 columns */}
              <div className={`hidden gap-x-8 gap-y-4 ${total >= 3 ? "md:grid lg:hidden" : "md:grid"} grid-cols-2`}>
                {renderCols(makeCols(2))}
              </div>

              {/* lg — 3 or 4 columns depending on how many items the active filter has */}
              {total >= 3 && (
                <div className={`hidden lg:grid gap-x-8 gap-y-4 ${numLgCols === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
                  {renderCols(makeCols(numLgCols))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Infinite-scroll sentinel + loading indicator. The observer watches
            this element; as it nears the viewport, the next 6 projects load. */}
        {hasMore && (
          <div
            ref={sentinelRef}
            className="mt-12 flex items-center justify-center py-8"
            aria-hidden
          >
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
          </div>
        )}

        {/* View All Button */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-40 flex justify-center pb-32"
        >
          <Link
            href="/projects"
            className="group relative flex flex-col items-center gap-6"
          >
            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-accent/20 transition-all duration-500 group-hover:scale-110 group-hover:border-secondary">
              <div className="h-16 w-16 rounded-full bg-accent transition-all duration-500 group-hover:scale-125 group-hover:bg-secondary flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <span className="text-xs font-bold uppercase 0.3em] text-accent">
                {t("projectsViewAllLabel")}
              </span>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("projectsViewAllSub")}
              </p>
            </div>
          </Link>
        </motion.div> */}
      </div>
    </motion.section>
  );
}
