"use client";

import { useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, useScroll, useTransform, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import LiquidCard from '@/components/LiquidCard';
import Link from 'next/link';
import { projects, type ProjectSummary } from '@/lib/project-catalog';

// Liquid blob card component
function LiquidProjectCard({ project, index }: { project: ProjectSummary; index: number }) {
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
  }[project.aspectRatio];

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
      <Link href={`/projects/${project.id}`} className="block">
        <LiquidCard
          aspectRatio={aspectRatioClass}
          className="mb-4 border border-white/70 bg-white/78 shadow-[0_18px_44px_rgba(30,52,86,0.1)]"
        >
          <div ref={cardRef} className="absolute inset-0 overflow-hidden bg-white/70">
            <motion.img
              src={project.image}
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
        <div className="space-y-2">
          <h3 className="text-lg md:text-xl font-serif leading-tight text-[hsl(var(--accent))] transition-opacity duration-300 group-hover:opacity-60">
            {project.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="cursor-pointer text-xs tracking-[0.14em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--secondary))]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

const categories = ["All", "Design", "Strategy", "Experience", "Digital"] as const;
type Category = (typeof categories)[number];

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
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

  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter(p => p.tags.includes(activeCategory));

  const headingText = "Same motion system, now wrapped in the Creative visual language.";

  return (
    <motion.section 
      ref={sectionRef} 
      style={{
        "--y-up": yUpPx,
        "--y-down": yDownPx,
      } as React.CSSProperties}
      className="relative -mt-16 overflow-hidden px-5 pb-16 pt-28 md:pb-24 lg:-mt-24 lg:px-20 lg:pb-28 lg:pt-36" 
      id="work"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background)/0.96)_34%,hsl(var(--background)/0.7)_68%,transparent_100%)] lg:h-40" />
      <div className="site-shell relative z-20 max-w-[1400px] px-0">
        <div className="mb-24 flex flex-col gap-12 lg:mb-32 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-6">
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              className="eyebrow"
            >
              Selected Work
            </motion.p>
            <h2 className="max-w-2xl text-4xl leading-[1.1] text-accent md:text-5xl lg:text-6xl">
              {headingText.split(" ").map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-[0.2em] py-1">
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
          
          <div className="lg:max-w-md">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-balance text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              The layout stays editorial and kinetic, but the surfaces, color temperature,
              and typography now follow the softer premium theme from the reference site.
            </motion.p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-16 flex flex-wrap gap-4 lg:mb-20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="group relative px-6 py-2 text-xs font-semibold uppercase tracking-widest"
            >
              <span className={`relative z-10 transition-colors duration-300 ${activeCategory === cat ? 'text-white' : 'text-accent hover:text-secondary'}`}>
                {cat}
              </span>
              {activeCategory === cat && (
                <motion.div
                  layoutId="activeCat"
                  className="absolute inset-0 bg-accent rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {activeCategory !== cat && (
                <div className="absolute inset-0 border border-accent/10 rounded-full group-hover:border-accent/30 transition-colors" />
              )}
            </button>
          ))}
        </div>

        {/* Masonry Grid with AnimatePresence */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 min-h-[600px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredProjects.map((project, index) => {
              const total = filteredProjects.length;
              const lg1 = Math.ceil(total / 3);
              const lg2 = lg1 + Math.ceil((total - lg1) / 2);
              const md1 = Math.ceil(total / 2);

              let parallaxClass = "will-change-transform break-inside-avoid mb-8 ";
              if (index < md1) {
                parallaxClass += "md:![transform:translateY(var(--y-up))] ";
              } else {
                parallaxClass += "md:![transform:translateY(var(--y-down))] ";
              }

              if (index < lg1) {
                parallaxClass += "lg:![transform:translateY(var(--y-up))]";
              } else if (index < lg2) {
                parallaxClass += "lg:![transform:translateY(var(--y-down))]";
              } else {
                parallaxClass += "lg:![transform:translateY(var(--y-up))]";
              }

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={parallaxClass}
                >
                  <LiquidProjectCard project={project} index={index} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-24 flex justify-center pb-32"
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
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
                Explore All
              </span>
              <p className="mt-1 text-sm text-muted-foreground">
                23 dynamic case studies
              </p>
            </div>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
