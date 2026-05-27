"use client";

import { useRef, useState, useEffect, useLayoutEffect, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
import { ArrowUpRight, Copy, Check } from "lucide-react";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations, useLocale } from "next-intl";

import { Link } from "@/i18n/navigation";

import type { ProjectColor, ProjectDetail, ProjectSummary, ProjectSection } from "@/lib/project-catalog";
import { COLOR_TOKENS, buildProjectThemeTokens } from "@/lib/project-theme";
import LiquidCard from "@/components/LiquidCard";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ProjectDetailViewProps = {
  project: ProjectDetail;
  relatedProjects: ProjectSummary[];
};

const transitionEase = [0.22, 1, 0.36, 1] as const;

const DEFAULT_PROCESS_EN = [
  { phase: "01", label: "Discovery", desc: "Understanding the core narrative, gathering requirements, and defining technical constraints." },
  { phase: "02", label: "Design", desc: "Crafting the visual language, typography scales, interactions, and motion curves." },
  { phase: "03", label: "Build", desc: "Developing the architecture and engineering the responsive frontend experience." },
  { phase: "04", label: "Launch", desc: "Performance optimization, accessibility audits, scaling, and final deployment." }
];

const DEFAULT_COLORS: ProjectColor[] = [
  { hex: "#0a1b3f", name: "Deep Navy", themeRole: null },
  { hex: "#8ea2ff", name: "Periwinkle", themeRole: null },
  { hex: "#ffc39b", name: "Warm Peach", themeRole: null },
  { hex: "#f6f7ff", name: "Cloud White", themeRole: null }
];
const EMPTY_COLORS: ProjectColor[] = [];

// ---------------------------------------------------

// -------------------------------------------------------------
// Interactive & Visual Components
// -------------------------------------------------------------

function Preloader({ title, skip = false }: { title: string; skip?: boolean }) {
  const t = useTranslations("projectDetail");
  const [isVisible, setIsVisible] = useState(!skip);

  // The preloader lasts 2 seconds (desktop only — skipped on mobile for perf).
  // `skip` flips after mount when the media query resolves, so we must
  // explicitly hide here — otherwise the earlier state (isVisible=true) sticks.
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), skip ? 0 : 2000);
    return () => clearTimeout(timer);
  }, [skip]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1.2, ease: transitionEase }}
          className="fixed inset-0 z-100 bg-accent flex flex-col items-center justify-center text-white overflow-hidden pointer-events-none"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: transitionEase }}
            className="text-center"
          >
            <p className="eyebrow text-[hsl(var(--accent-foreground))/60] mb-6">{t("loadingCaseStudy")}</p>
            <h1 className="font-serif text-5xl md:text-7xl overflow-hidden text-[hsl(var(--accent-foreground))]">
              <span className="block">{title}</span>
            </h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const NoiseOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.025] mix-blend-overlay">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);

function FloatingNavPill({ title, progress }: { title: string, progress: number }) {
  const visible = progress > 0.05 && progress < 0.95;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.5, ease: transitionEase }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none hidden md:block"
        >
          <div className="flex items-center gap-4 rounded-full border border-[hsl(var(--accent-foreground))/0.15] bg-[hsl(var(--accent))] px-6 py-3 text-[hsl(var(--accent-foreground))] shadow-[0_10px_40px_hsl(var(--accent)/0.35)]">
            <div className="relative size-2 shrink-0 overflow-hidden rounded-full bg-[hsl(var(--accent-foreground))/0.22]">
               <motion.div 
                 className="absolute bottom-0 left-0 right-0 bg-secondary" 
                 style={{ height: `${progress * 100}%` }} 
               />
            </div>
            <span className="whitespace-nowrap text-sm font-medium ">
              {title}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MarqueeTicker({ words }: { words: string[] }) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const content = words.join(" — ") + " — ";
  return (
    <div className="w-full py-20 md:py-32 bg-[hsl(var(--accent))] text-white overflow-hidden relative rotate-[-2deg] scale-[1.05] z-30 flex items-center">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[hsl(var(--accent))] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[hsl(var(--accent))] to-transparent z-10" />
      <div className="flex whitespace-nowrap will-change-transform py-4">
        {/* We animate two copies to create seamless infinite loop */}
        <motion.div 
          animate={isClient ? { x: ["0%", "-50%"] } : {}} 
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          className="flex whitespace-nowrap text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight ms-4"
        >
          <span className="me-8">{content}{content}{content}{content}{content}{content}</span>
        </motion.div>
      </div>
    </div>
  );
}

// Pin text direction on the split-text wrapper. Without this, each character
// renders as a separate inline-block span and the RTL page context reverses
// their visual order — turning "Burgitu" into "utigruB". We use an inline
// style (not the `dir` attribute) so Framer Motion can't swallow it.
function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

function SplitText({ text, className }: { text: string; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  // Arabic characters must NOT be split into individual inline-block spans:
  // per-character inline-block in an RTL context reverses visual order AND
  // breaks Arabic ligature shaping. Animate the whole block instead.
  if (isArabicText(text)) {
    return (
      <motion.div
        ref={ref}
        className={className}
        style={{ direction: "rtl" }}
        initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
        animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 40, filter: "blur(6px)" }}
        transition={{ duration: 0.8, ease: transitionEase }}
      >
        {text}
      </motion.div>
    );
  }

  const chars = text.split("");

  return (
    <motion.div
      ref={ref}
      style={{ direction: "ltr" }}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block relative"
          variants={{
            hidden: { opacity: 0, y: 40, rotateX: -45, filter: "blur(6px)" },
            visible: { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: transitionEase } }
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
}

function MagneticButton({ children, href, className }: { children: React.ReactNode, href: string, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block"
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

function RevealImage({ src, alt, className, sizes, priority = false }: { src: string, alt: string, className?: string, sizes?: string, priority?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  return (
    <div ref={ref} className="relative w-full h-full overflow-hidden cursor-view">
      <motion.div
        initial={{ y: 0 }}
        animate={inView ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
        className="absolute inset-0 z-20 bg-accent"
      />
      <motion.div
        initial={{ scale: 1.15 }}
        animate={inView ? { scale: 1 } : { scale: 1.15 }}
        transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
        className="w-full h-full"
      >
        <Image src={src} alt={alt} fill className={`object-cover ${className}`} sizes={sizes} priority={priority} />
      </motion.div>
    </div>
  );
}

function AnimatedDivider() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  return (
    <div ref={ref} className="w-full flex justify-center py-8 md:py-16 overflow-hidden pointer-events-none">
      <motion.svg 
        initial={{ pathLength: 0, opacity: 0 }}
        animate={inView ? { pathLength: 1, opacity: 0.4 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        width="160" height="24" viewBox="0 0 160 24" fill="none" stroke="hsl(var(--secondary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M0,12 C20,24 40,0 60,12 C80,24 100,0 120,12 C140,24 160,0 160,12" />
      </motion.svg>
    </div>
  );
}

function PullQuote() {
  const t = useTranslations("projectDetail");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const quote = t("pullQuote");
  const isAr = isArabicText(quote);
  return (
    <section ref={ref} className="site-shell py-16 md:py-28 px-6 md:px-12 relative z-10">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, ease: transitionEase }}
          className="h-1 w-16 mb-12 bg-[hsl(var(--secondary))] origin-center rounded-full"
        />
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2, ease: transitionEase }}
          className="font-serif italic text-[2.2rem] md:text-[3.5rem] leading-[1.2] text-[hsl(var(--accent))] font-light -0.02em]"
          style={isAr ? { direction: "rtl" } : undefined}
        >
          &ldquo;{quote}&rdquo;
        </motion.h3>
      </div>
    </section>
  );
}

function MetricReveal({ metric, index, total }: { metric: { label: string, value: string }; index: number; total: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const locale = useLocale();
  const isAr = locale === "ar";
  const toE = (n: number) => isAr ? String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]) : String(n);
  const counterLabel = isAr
    ? `${toE(index + 1)} من ${toE(total)}`
    : `${index + 1} of ${total}`;
  const decorNum = isAr ? toE(index + 1) : `0${index + 1}`;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.9, delay: 0.15 + index * 0.2, ease: transitionEase }}
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 md:p-10 overflow-hidden transition-colors duration-500 hover:border-white/20 hover:bg-white/[0.06]"
    >
      {/* Decorative glow on hover */}
      <div className="absolute -top-12 -right-12 size-40 rounded-full bg-[hsl(var(--secondary))]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Phase index */}
      <span className="text-[5rem] md:text-[6rem] font-serif font-black leading-none text-white/[0.04] absolute -top-3 -left-1 select-none pointer-events-none">
        {decorNum}
      </span>

      {/* Metric dot + label */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.4, delay: 0.4 + index * 0.15 }}
          className="size-2.5 rounded-full bg-[hsl(var(--secondary))] shrink-0"
        />
        <p className="text-xs uppercase  text-white/40 font-medium" dir="ltr">
          {counterLabel}
        </p>
      </div>

      {/* Large value */}
      <div className="overflow-hidden mb-4 relative z-10">
        <motion.h4 
          initial={{ y: 80, filter: "blur(8px)" }}
          animate={inView ? { y: 0, filter: "blur(0px)" } : { y: 80, filter: "blur(8px)" }}
          transition={{ duration: 0.9, ease: transitionEase, delay: 0.3 + index * 0.2 }}
          className="text-[2.5rem] md:text-[3.5rem] font-serif tracking-tight text-white leading-[1.1]"
        >
          {metric.label}
        </motion.h4>
      </div>
      
      {/* Divider line */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8, delay: 0.5 + index * 0.15 }}
        className="h-px w-full bg-gradient-to-r from-[hsl(var(--secondary))]/40 via-white/10 to-transparent origin-left mb-5"
      />

      {/* Description */}
      <motion.p 
        initial={{ opacity: 0 }} 
        animate={inView ? { opacity: 1 } : { opacity: 0 }} 
        transition={{ duration: 0.6, delay: 0.7 + index * 0.15 }}
        className="text-[1.05rem] md:text-[1.15rem] font-light text-white/60 leading-relaxed relative z-10"
      >
        {metric.value}
      </motion.p>
    </motion.div>
  );
}

function TableOfContents({ count }: { count: number }) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  return (
    <div className="fixed end-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4 mix-blend-difference pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2 + (i * 0.1), duration: 0.5 }}
          className="size-[6px] rounded-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
        />
      ))}
    </div>
  );
}

function StaggeredText({ text, className }: { text: string; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.012, delayChildren: 0.05 * i },
    }),
  };

  const child = {
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 20, stiffness: 100 } },
    hidden: { opacity: 0, y: 20 },
  };

  // Same reasoning as SplitText: Arabic words as inline-block spans in RTL
  // context reverses word order visually. Animate the whole paragraph instead.
  if (isArabicText(text)) {
    return (
      <motion.p
        ref={ref}
        style={{ direction: "rtl" }}
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: transitionEase }}
      >
        {text}
      </motion.p>
    );
  }

  return (
    <motion.p
      ref={ref}
      style={{ direction: "ltr" }}
      variants={container}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className="inline-block me-[0.25em]">
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}

function StoryChapter({ section, index }: { section: ProjectSection; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const isLeft = section.imageLayout === "left";
  const isNavy = section.tone === "navy";

  // ── Desktop 2-col grid (hidden on mobile) ────────────────────────────────
  const desktopContent = (
    <div className={`hidden md:grid md:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-start ${isNavy ? 'p-8 md:p-16 lg:p-20' : ''}`}>

      {/* Sticky Label (Desktop) */}
      <div className={`hidden lg:block absolute top-[20vh] ${isLeft ? 'end-full me-12' : 'start-full ms-12'} whitespace-nowrap opacity-20 origin-left -rotate-90 select-none`}>
        <span className="font-serif text-8xl font-black">0{index + 1}</span>
      </div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? 40 : -40 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? 40 : -40 }}
        transition={{ duration: 0.8, delay: 0.1, ease: transitionEase }}
        className={`sticky top-40 space-y-6 ${isLeft ? "order-2" : "order-2 md:order-1"}`}
      >
        <p className={`eyebrow ${isNavy ? 'text-[hsl(var(--secondary))]' : 'text-muted-foreground'}`}>{section.eyebrow}</p>
        <h3 className={`font-serif text-[2.2rem] md:text-5xl lg:text-6xl leading-[1.05] tracking-tight ${isNavy ? 'text-white' : 'text-[hsl(var(--accent))]'}`}>
          {section.title}
        </h3>
        <div className="space-y-6 pt-2">
          {section.body.map((p, i) => (
            <p key={i} className={`text-[1.1rem] md:text-[1.25rem] font-light leading-relaxed ${isNavy ? 'text-white/75' : 'text-[hsl(var(--accent))]/80'}`}>
              {p}
            </p>
          ))}
        </div>
      </motion.div>

      {/* Media with SCROLL STACKING (sticky top) */}
      <div className={`relative w-full overflow-hidden sticky top-32 ${isLeft ? "order-1" : "order-1 md:order-2"}`}>
        <LiquidCard aspectRatio={isNavy ? "aspect-[0.9/1]" : "aspect-[0.8/1]"} className={`w-full ${isNavy ? 'shadow-2xl' : 'shadow-xl'}`}>
          <RevealImage src={section.image} alt={section.imageAlt} sizes="(max-width: 768px) 100vw, 50vw" />
        </LiquidCard>
      </div>
    </div>
  );

  return (
    <>
      {index === 1 && <PullQuote />}
      {index > 0 && index !== 1 && <AnimatedDivider />}

      <section ref={ref} className={`relative site-shell ${index === 0 ? "pb-32 md:pb-64" : "py-16 md:pb-64 md:pt-32"} px-4 md:px-8`}>

        {/* ── MOBILE LAYOUT ─────────────────────────────────────────────────
            Image pins to the top of the viewport while the text card scrolls
            up over it. Uses a negative margin + rounded top to "slide over".   */}
        <div className="md:hidden -mx-4">
          {/* Sticky image — full bleed, stays fixed as text scrolls over */}
          <div className="sticky top-0 overflow-hidden" style={{ height: "65vw", minHeight: "240px", maxHeight: "420px" }}>
            <RevealImage src={section.image} alt={section.imageAlt} sizes="100vw" />
          </div>

          {/* Text card — pulls up with -mt and slides over the fixed image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.65, ease: transitionEase }}
            className={`relative z-10 -mt-7 rounded-t-[1.75rem] px-5 pt-8 pb-10 space-y-5 ${
              isNavy
                ? 'bg-[hsl(var(--accent))]'
                : 'bg-background'
            }`}
          >
            {section.eyebrow && (
              <p className={`eyebrow ${isNavy ? 'text-[hsl(var(--secondary))]' : 'text-muted-foreground'}`}>
                {section.eyebrow}
              </p>
            )}
            <h3 className={`font-serif text-[1.9rem] leading-[1.08] tracking-tight ${isNavy ? 'text-white' : 'text-[hsl(var(--accent))]'}`}>
              {section.title}
            </h3>
            <div className="space-y-4 pt-1">
              {section.body.map((p, i) => (
                <p key={i} className={`text-[0.975rem] font-light leading-relaxed ${isNavy ? 'text-white/75' : 'text-[hsl(var(--accent))]/80'}`}>
                  {p}
                </p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── DESKTOP LAYOUT ──────────────────────────────────────────────── */}
        {isNavy ? (
          <div className="hidden md:block site-card-navy overflow-hidden">
            {desktopContent}
          </div>
        ) : (
          desktopContent
        )}

      </section>
    </>
  );
}

function RelatedProjectCard({ project, index }: { project: ProjectSummary; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: transitionEase }}
    >
      <Link href={`/projects/${project.id}` as `/projects/${string}`} className="group flex flex-col space-y-6">
        <LiquidCard className="w-full shadow-lg border border-black/5 dark:border-white/5" aspectRatio="aspect-[1.3/1]">
          <Image 
            src={project.image} 
            alt={project.title} 
            fill 
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]" 
            sizes="(max-width: 768px) 100vw, 50vw" 
          />
        </LiquidCard>
        <div className="space-y-3 px-2">
          <h4 className="font-serif text-[1.75rem] md:text-[2.2rem] leading-tight -0.02em] text-[hsl(var(--accent))] group-hover:text-secondary transition-colors duration-300">
            {project.title}
          </h4>
          <p className="eyebrow text-muted-foreground">
            {project.tags.join(" / ")}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function ProcessTimeline({ steps }: { steps: typeof DEFAULT_PROCESS_EN }) {
  const t = useTranslations("projectDetail");
  // If the steps are the English defaults (no project-specific process data),
  // replace labels/descs with translated versions.
  const isDefaultSteps = steps === DEFAULT_PROCESS_EN;
  const translatedSteps = isDefaultSteps ? [
    { phase: "01", label: t("processPhase01Label"), desc: t("processPhase01Desc") },
    { phase: "02", label: t("processPhase02Label"), desc: t("processPhase02Desc") },
    { phase: "03", label: t("processPhase03Label"), desc: t("processPhase03Desc") },
    { phase: "04", label: t("processPhase04Label"), desc: t("processPhase04Desc") },
  ] : steps;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <section className="site-shell py-24 md:py-40 px-6 md:px-12">
      <div className="mb-20">
        <SplitText text={t("theProcess")} className="font-serif text-[2.5rem] md:text-[4rem] text-accent -0.03em]" />
      </div>
      <div ref={ref} className="relative">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.5, ease: transitionEase }}
          className="absolute top-6 left-0 w-full h-px bg-border origin-left hidden md:block"
        />

        <div className="grid md:grid-cols-4 gap-12 md:gap-8">
          {translatedSteps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.3 + (idx * 0.15), ease: transitionEase }}
              className="relative pt-6"
            >
              <div className="absolute top-0 md:-top-[24px] start-0 size-3 rounded-full bg-secondary border-4 border-background z-10 hidden md:block" />
              <div className="space-y-4">
                <span className="text-secondary font-bold text-sm st">{step.phase}</span>
                <h4 className="font-serif text-2xl text-accent">{step.label}</h4>
                <p className="text-muted-foreground leading-relaxed text-[1.05rem]">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ColorPaletteShowcase({ colors }: { colors: ProjectColor[] }) {
  const t = useTranslations("projectDetail");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [copied, setCopied] = useState<string | null>(null);
  const displayColors = colors.filter((color) => color.hex.trim() && color.name.trim());
  const swatches = displayColors.length > 0 ? displayColors : DEFAULT_COLORS;

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section ref={ref} className="site-shell py-24 md:py-32 px-6 md:px-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className={isRtl ? "text-right" : ""}>
          <SplitText text={t("colorStory")} className="font-serif text-[2.5rem] md:text-[4rem] text-accent -0.03em]" />
          <p className="text-muted-foreground text-lg mt-4 max-w-md" style={isRtl ? { direction: "rtl" } : undefined}>{t("colorStoryBody")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {swatches.map((color, idx) => (
          <motion.button 
            key={idx}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: transitionEase }}
            onClick={() => copyToClipboard(color.hex)}
            className="group text-start"
          >
            <div 
              className="w-full aspect-square md:aspect-4/5 rounded-2xl shadow-sm mb-6 relative overflow-hidden transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-xl"
              style={{ backgroundColor: color.hex }}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                <div className={`p-3 rounded-full bg-white text-black shadow-lg transform ${copied === color.hex ? 'scale-100 opacity-100' : 'scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100'} transition-all duration-300`}>
                  {copied === color.hex ? <Check className="size-5" /> : <Copy className="size-5" />}
                </div>
              </div>
            </div>
            <p className="font-medium text-lg leading-none mb-2 text-accent">{isRtl && color.name_ar ? color.name_ar : color.name}</p>
            <p className="text-muted-foreground uppercase r text-sm">{color.hex}</p>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Brand-Wordmark Hero — gradient + ghosted white logo + GSAP timeline
// -------------------------------------------------------------

function ProjectCinematicHero({
  project,
  isMobile,
  isRtl,
}: {
  project: ProjectDetail;
  isMobile: boolean;
  isRtl: boolean;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const editorialRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);

  const dir = isRtl ? -1 : 1;
  const titleIsAr = isArabicText(project.heroTitle);
  const subtitleIsAr = project.heroSubtitle ? isArabicText(project.heroSubtitle) : isRtl;
  const summaryIsAr = project.heroSummary ? isArabicText(project.heroSummary) : isRtl;

  useGSAP(
    () => {
      // Read mobile state at setup time, not from React state (which flips
      // post-mount and would otherwise force useGSAP to re-run mid-animation,
      // leaving elements stuck at the from() initial state on mobile).
      const isPhone =
        typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (gradientRef.current) tl.from(gradientRef.current, { autoAlpha: 0, duration: 0.8 }, 0);

      if (wordmarkRef.current) {
        tl.from(
          wordmarkRef.current,
          {
            autoAlpha: 0,
            scale: 1.18,
            y: 60,
            filter: "blur(18px)",
            duration: 1.8,
            ease: "expo.out",
          },
          0.1
        );
      }

      if (topBarRef.current) tl.from(topBarRef.current, { autoAlpha: 0, y: -16, duration: 0.7 }, 0.4);
      if (eyebrowRef.current) tl.from(eyebrowRef.current, { autoAlpha: 0, x: dir * -28, duration: 0.65 }, 0.85);

      const chars = titleWrapRef.current?.querySelectorAll<HTMLElement>("[data-char]");
      if (chars && chars.length) {
        tl.from(
          chars,
          { yPercent: 120, autoAlpha: 0, stagger: 0.05, duration: 0.9, ease: "expo.out" },
          0.95
        );
      } else if (titleWrapRef.current) {
        tl.from(
          titleWrapRef.current,
          { yPercent: 35, autoAlpha: 0, duration: 1.0, ease: "expo.out" },
          0.95
        );
      }

      if (subtitleRef.current) tl.from(subtitleRef.current, { autoAlpha: 0, y: 18, duration: 0.7 }, 1.25);
      if (summaryRef.current) tl.from(summaryRef.current, { autoAlpha: 0, y: 14, duration: 0.65 }, 1.4);

      const tagItems = tagsRef.current?.children;
      if (tagItems && tagItems.length) {
        tl.from(tagItems, { autoAlpha: 0, y: 12, scale: 0.9, stagger: 0.08, duration: 0.55 }, 1.55);
      }

      if (ruleRef.current) {
        tl.from(
          ruleRef.current,
          {
            scaleX: 0,
            transformOrigin: dir > 0 ? "left center" : "right center",
            duration: 1.4,
            ease: "power4.out",
          },
          1.3
        );
      }

      if (!isPhone && heroRef.current) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          })
          .to(wordmarkRef.current, { y: -100, scale: 1.05, ease: "none" }, 0)
          .to(editorialRef.current, { y: -40, ease: "none" }, 0);
      }
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ height: "100svh", minHeight: "640px" }}
    >
      {/* Layer 1 — tinted brand gradient (no harsh cream→dark jump; tinted blush throughout) */}
      <div
        ref={gradientRef}
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, " +
            "color-mix(in oklab, hsl(var(--background)) 88%, hsl(var(--accent))) 0%, " +
            "color-mix(in oklab, hsl(var(--background)) 70%, hsl(var(--accent))) 28%, " +
            "color-mix(in oklab, hsl(var(--background)) 38%, hsl(var(--accent))) 60%, " +
            "color-mix(in oklab, hsl(var(--background)) 12%, hsl(var(--accent))) 85%, " +
            "hsl(var(--accent)) 100%)",
        }}
      />

      {/* Layer 2 — soft grain for tactile depth */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay">
        <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
          <filter id="hero-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-grain)" />
        </svg>
      </div>

      {/* Layer 3 — giant white wordmark watermark */}
      {project.heroImage && (
        <div
          ref={wordmarkRef}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[44%] z-10 -translate-x-1/2 -translate-y-1/2 will-change-transform"
          style={{ width: isMobile ? "92vw" : "min(78vw, 1100px)" }}
        >
          <div
            className="relative w-full"
            style={{ aspectRatio: "3 / 1", opacity: isMobile ? 0.45 : 0.55 }}
          >
            <Image
              src={project.heroImage}
              alt=""
              fill
              sizes="(max-width: 768px) 92vw, 1100px"
              className="object-contain select-none"
              priority
            />
          </div>
        </div>
      )}

      {/* Layer 4 — top bar */}
      <div
        ref={topBarRef}
        className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-8 lg:px-12 lg:pt-10"
      >
        <div />
        {!isMobile && (
          <div className="flex items-center gap-3 text-white/40">
            <span className="font-mono text-[0.58rem] uppercase 0.42em]">
              {isRtl ? "مرّر" : "Scroll"}
            </span>
            <div className="h-7 w-px bg-white/30" />
          </div>
        )}
      </div>

      {/* Layer 5 — editorial content */}
      <div
        ref={editorialRef}
        className="absolute inset-x-0 bottom-0 z-20 px-5 pb-12 lg:px-12 lg:pb-14 will-change-transform"
      >
        <div className="flex flex-col gap-5 lg:items-start lg:text-start">
            {/* Eyebrow */}
            {project.heroLabel && (
              <div ref={eyebrowRef} className="flex items-center gap-3 text-white/70">
                <div className="h-px w-8 bg-white/50" />
                <span className="font-mono text-[0.66rem] uppercase 0.42em]">
                  {project.heroLabel}
                </span>
              </div>
            )}

            {/* Project name */}
            <div ref={titleWrapRef} className="overflow-hidden">
              <h1
                className="font-serif leading-[0.96]  text-white"
                style={{
                  fontSize: "clamp(3rem, 8.4vw, 6.75rem)",
                  direction: titleIsAr ? "rtl" : "ltr",
                }}
              >
                {titleIsAr
                  ? project.heroTitle
                  : project.heroTitle.split("").map((c, i) => (
                      <span key={i} data-char className="inline-block">
                        {c === " " ? " " : c}
                      </span>
                    ))}
              </h1>
            </div>

            {/* Subtitle */}
            {project.heroSubtitle && (
              <p
                ref={subtitleRef}
                className="max-w-md text-[1rem] font-light leading-relaxed text-white/80 md:text-[1.1rem]"
                style={{ direction: subtitleIsAr ? "rtl" : "ltr" }}
              >
                {project.heroSubtitle}
              </p>
            )}

            {/* Summary — desktop only */}
            {project.heroSummary && !isMobile && (
              <p
                ref={summaryRef}
                className="hidden max-w-md text-[0.9rem] leading-relaxed text-white/60 md:block"
                style={{ direction: summaryIsAr ? "rtl" : "ltr" }}
              >
                {project.heroSummary}
              </p>
            )}

            {/* Tags */}
            {project.tags.length > 0 && (
              <div ref={tagsRef} className="flex flex-wrap gap-2 lg:justify-start">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/30 px-3.5 py-1.5 font-mono text-[0.62rem] uppercase  text-white/85 transition-colors duration-300 hover:border-white/70 hover:text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
        </div>

        {/* Bottom rule */}
        <div ref={ruleRef} className="mt-10 h-px w-full bg-white/25" />
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------

export default function ProjectDetailView({ project, relatedProjects }: ProjectDetailViewProps) {
  const t = useTranslations("projectDetail");
  const projectThemeColors = project.colors ?? EMPTY_COLORS;
  const projectColors = project.colors?.length ? project.colors : DEFAULT_COLORS;
  const projectProcess = project.process?.length ? project.process : DEFAULT_PROCESS_EN;

  // Mobile gets stripped-down effects — blur/mix-blend/parallax tank perf on phones.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    if (!project.inheritThemeFromPalette) return;

    const tokens = buildProjectThemeTokens(projectThemeColors);
    if (!tokens) return;

    const root = document.documentElement;
    const previous = new Map<string, string>();

    for (const token of COLOR_TOKENS) {
      previous.set(token, root.style.getPropertyValue(token));
      root.style.setProperty(token, tokens[token]);
    }

    return () => {
      for (const token of COLOR_TOKENS) {
        const priorValue = previous.get(token) ?? "";
        if (priorValue.trim()) {
          root.style.setProperty(token, priorValue);
        } else {
          root.style.removeProperty(token);
        }
      }
    };
  }, [project.inheritThemeFromPalette, projectThemeColors]);

  const { scrollYProgress } = useScroll();

  const overviewRef = useRef(null);
  const overviewInView = useInView(overviewRef, { once: true, margin: "-50px" });

  const introRef = useRef(null);

  const metricsRef = useRef(null);
  const metricsInView = useInView(metricsRef, { once: true, margin: "-10%" });

  // Pinned Horizontal Showcase Scroll Control
  const showcaseContainerRef = useRef(null);
  const { scrollYProgress: horizontalScrollProgress } = useScroll({
    target: showcaseContainerRef,
    offset: ["start start", "end end"] // The container itself generates progress
  });
  // Map vertical scroll of container to horizontal translation of gallery track.
  // In RTL the track starts at the end (right), so it slides right (positive x).
  const locale = useLocale();
  const isRtl = locale === "ar";
  const galleryCount = project.gallery.length || 1;
  const galleryEndPct = `${((galleryCount - 1) / galleryCount) * 100}%`;
  const horizontalX = useTransform(horizontalScrollProgress, [0, 1], ["0%", isRtl ? galleryEndPct : `-${galleryEndPct}`]);

  // We need to pass the progress as a number to NavPill
  const [currentProgress, setCurrentProgress] = useState(0);
  useEffect(() => {
    return scrollYProgress.onChange((latest) => setCurrentProgress(latest));
  }, [scrollYProgress]);

  return (
    <>
      <Preloader title={project.title} skip={isMobile} />
      <main className="pb-0 bg-background text-foreground relative">
        {!isMobile && <NoiseOverlay />}
        <TableOfContents count={project.sections.length + 3} />
        <FloatingNavPill title={project.title} progress={currentProgress} />
        
        {/* Scroll Progress Bar */}
        <motion.div 
          className="fixed top-0 inset-x-0 h-1 md:h-1.5 bg-secondary origin-left z-50 pointer-events-none"
          style={{ scaleX: scrollYProgress }} 
        />

        {/* 1. Cinematic Full-Bleed Hero */}
        <ProjectCinematicHero
          project={project}
          isMobile={isMobile}
          isRtl={isRtl}
        />

        {/* 2. Overview Bar */}
        <section ref={overviewRef} className="site-shell -mt-12 md:-mt-20 relative z-20 px-4 md:px-8 mb-20 md:mb-32">
          {/* <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={overviewInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.7, delay: isMobile ? 0.2 : 3, ease: transitionEase }}
            className="site-card p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10 md:gap-16"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full">
              {project.overview.map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <p className="eyebrow text-muted-foreground opacity-80">{item.label}</p>
                  <p className="text-accent font-medium text-[1.05rem] md:text-[1.15rem]">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="shrink-0 pt-6 md:pt-0 border-t md:border-0 border-border/50 md:ps-8 w-full md:w-auto">
              <MagneticButton href="#" className="btn-primary group w-full md:w-auto mt-2 md:mt-0 text-[1.05rem] px-8 py-4">
                {project.introMeta.launchLabel}
                <ArrowUpRight className="ms-3 size-4 md:size-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </MagneticButton>
            </div>
          </motion.div> */}
        </section>

        {/* 3. Editorial Intro */}
        {/* <section ref={introRef} className="site-shell pb-20 md:pb-32 px-6 md:px-12">
          <div className="grid gap-12 md:gap-20 lg:grid-cols-[1.1fr_1.4fr] items-start">
            <h2 className="font-serif text-[2.75rem] leading-[1.05]  text-accent md:text-[4rem] lg:text-[4.75rem] md:pe-10">
              <SplitText text={project.title} />
            </h2>
            <div className="space-y-10 mt-2">
              {project.intro.map((p, i) => (
                <StaggeredText 
                  key={i} 
                  text={p} 
                  className="font-sans text-[1.25rem] md:text-[1.5rem] lg:text-[1.75rem] leading-[1.65] tracking-tight text-accent font-light" 
                />
              ))}
            </div>
          </div>
        </section> */}

        {/* 4. Primary LiquidCard Showcase */}
        <section className="site-shell pb-24 md:pb-10 px-4 md:px-8">
          <LiquidCard aspectRatio="aspect-[4/3] md:aspect-[2.2/1]" className="w-full shadow-2xl border border-black/5 dark:border-white/5">
            <RevealImage src={project.primaryShowcase.src} alt={project.primaryShowcase.alt} sizes="100vw" priority />
          </LiquidCard>
        </section>

        {/* NEW: Process Timeline */}
        <ProcessTimeline steps={projectProcess} />

        {/* 5. Story Chapters (with Sticky Image Stacking) */}
        {project.sections.map((section, idx) => (
          <StoryChapter key={idx} section={section} index={idx} />
        ))}

        {/* NEW: Marquee Section */}
        <div className="overflow-hidden w-full">
          <MarqueeTicker words={project.tags} />
        </div>

        {/* NEW: Color Palette Showcase */}
        <ColorPaletteShowcase colors={projectColors} />

        {/* Mobile: CSS snap scroll — natural height, no JS pinning */}
        <section className="md:hidden w-full bg-black/5 dark:bg-white/5 py-10">
          <div className={`mb-6 px-6 ${isRtl ? "text-right" : ""}`}>
            <SplitText text={t("visualExploration")} className="font-serif text-3xl text-accent" />
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 gap-4 px-6">
            {project.gallery.map((image, idx) => (
              <div key={idx} className="snap-center shrink-0 w-[85vw]">
                <LiquidCard className="w-full shadow-2xl" aspectRatio="aspect-[16/9]">
                  <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="85vw" />
                </LiquidCard>
              </div>
            ))}
          </div>
          <div className="mt-4 px-6 font-mono text-[0.6rem] 0.3em] text-accent/40">{galleryCount} frames</div>
        </section>

        {/* Desktop: pinned full-screen horizontal scroll */}
        <section ref={showcaseContainerRef} className="hidden md:block relative w-full" style={{ height: `${galleryCount * 100}vh` }}>
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            <div className={`absolute top-12 z-10 w-full px-12 ${isRtl ? "text-right" : ""}`}>
              <SplitText text={t("visualExploration")} className="font-serif text-5xl text-white mix-blend-difference" />
            </div>
            <motion.div
              style={{ x: horizontalX, width: `${galleryCount * 100}vw` }}
              className="flex h-full"
              dir="ltr"
            >
              {project.gallery.map((image, idx) => (
                <div key={idx} className="w-screen h-full shrink-0 relative">
                  <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="100vw" />
                </div>
              ))}
            </motion.div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/20 rounded-full overflow-hidden z-10">
              <motion.div className="h-full bg-white origin-left" style={{ scaleX: horizontalScrollProgress }} />
            </div>
            <div className="absolute bottom-8 right-12 z-10 font-mono text-[0.65rem] 0.3em] text-white/50">
              {galleryCount} frames
            </div>
          </div>
        </section>

        {/* 6. Impact Metrics — Redesigned */}
        <section ref={metricsRef} className="relative py-32 md:py-48 overflow-hidden">
          {/* Full-bleed dark background */}
          <div className="absolute inset-0 bg-[hsl(var(--accent))]">
            {/* Decorative radial rays */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(142,162,255,0.12)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_80%_100%,rgba(255,195,155,0.06)_0%,transparent_70%)]" />
            {/* Subtle grid lines */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
          </div>
          
          <div className="site-shell px-6 md:px-12 relative z-10">
            {/* Section Header */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={metricsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, ease: transitionEase }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-6"
            >
              <div>
                <p className="eyebrow text-[hsl(var(--secondary))] mb-5 opacity-80">{t("resultsEyebrow")}</p>
                <h3 className="font-serif text-[3rem] md:text-[5rem] tracking-tight text-white leading-[0.95]">
                  <SplitText text={t("projectImpact")} />
                </h3>
              </div>
              <p className="text-white/40 text-sm md:text-base max-w-xs font-light leading-relaxed">
                {t("projectImpactBody")}
              </p>
            </motion.div>
            
            {/* Metrics Cards Grid */}
            <div className="grid md:grid-cols-3 gap-5 md:gap-6">
              {project.impactMetrics.map((metric, idx) => (
                <MetricReveal key={idx} metric={metric} index={idx} total={project.impactMetrics.length} />
              ))}
            </div>
          </div>
        </section>

        {/* 8. Split-Screen Footer CTA & Related Projects */}
        <section className="bg-white/40 dark:bg-black/20 pt-28 pb-40 border-t border-border/40 md:backdrop-blur-3xl relative z-20 overflow-hidden">
          <div className="site-shell px-6 md:px-12 lg:px-20 mb-32 md:mb-48">
            <div className="mb-14 md:mb-20">
              <h3 className="font-serif text-[2.75rem] md:text-[4rem] -0.03em] text-accent">{t("relatedProjects")}</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-12 md:gap-x-20 md:gap-y-24">
              {relatedProjects.slice(0, 2).map((relatedProject, idx) => (
                <RelatedProjectCard key={relatedProject.id} project={relatedProject} index={idx} />
              ))}
            </div>
          </div>
          
          {/* NEW Split Screen CTA Block */}
          {/* <div className="site-shell px-4 md:px-12 lg:px-20 mt-20">
            <div className="bg-[hsl(var(--accent))] text-white rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-2xl h-[500px]">
              <div className="p-10 md:p-16 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.4)_0%,transparent_70%)]" />
                <h3 className="font-serif text-4xl md:text-6xl leading-[1.1] mb-6 relative z-10">Have an idea?<br/>Let&apos;s build it.</h3>
                <p className="text-white/70 text-lg md:text-xl max-w-sm relative z-10">
                  Ready to elevate your digital experience to the next level?
                </p>
              </div>
              
              <div className="bg-white/5 p-10 md:p-16 flex flex-col justify-center items-start border-l border-white/10 relative z-10">
                <div className="space-y-8 w-full">
                  <div>
                    <span className="block text-sm uppercase st text-[hsl(var(--secondary))] mb-2 font-bold">Inquiries</span>
                    <a href="mailto:hello@example.com" className="text-2xl md:text-3xl font-serif hover:text-[hsl(var(--secondary))] transition-colors border-b border-white/20 pb-1">
                      hello@example.com
                    </a>
                  </div>
                  <div>
                     <span className="block text-sm uppercase st text-[hsl(var(--secondary))] mb-2 font-bold font-sans">Connect</span>
                     <div className="flex gap-6">
                        {['Twitter', 'LinkedIn', 'Dribbble'].map((social) => (
                          <MagneticButton key={social} href="#" className="text-lg font-light hover:text-[hsl(var(--secondary))] transition-colors">
                            {social}
                          </MagneticButton>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
          
          {/* Legacy Credits Strip at the very bottom */}
          <div className="site-shell px-6 md:px-12 lg:px-20 mt-24">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 border-t border-border/60 pt-12 md:pt-16">
              <div className="flex flex-wrap gap-x-12 gap-y-6">
                 {project.credits.map((c, i) => (
                   <p key={i} className="text-[0.7rem] md:text-[0.8rem] uppercase  text-[hsl(var(--muted-foreground))]">
                     <span className="opacity-70 font-medium block md:inline mb-1 md:mb-0">{c.label}: </span>
                     <span className="font-semibold text-[hsl(var(--accent))]">{c.value}</span>
                   </p>
                 ))}
              </div>
            </div>
          </div>
        </section>
        
      </main>
    </>
  );
}
