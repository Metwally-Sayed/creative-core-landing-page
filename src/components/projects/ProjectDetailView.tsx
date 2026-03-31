"use client";

import { useRef, useState, useEffect, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
import { ArrowUpRight, Plus, Minus, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

import type { ProjectDetail, ProjectSummary, ProjectSection } from "@/lib/project-catalog";
import LiquidCard from "@/components/LiquidCard";

type ProjectDetailViewProps = {
  project: ProjectDetail;
  relatedProjects: ProjectSummary[];
};

const transitionEase = [0.22, 1, 0.36, 1] as const;

// --- MOCK EXTENSIONS ---
const projectProcess = [
  { phase: "01", label: "Discovery", desc: "Understanding the core narrative, gathering requirements, and defining technical constraints." },
  { phase: "02", label: "Design", desc: "Crafting the visual language, typography scales, interactions, and motion curves." },
  { phase: "03", label: "Build", desc: "Developing the architecture and engineering the responsive frontend experience." },
  { phase: "04", label: "Launch", desc: "Performance optimization, accessibility audits, scaling, and final deployment." }
];

const projectColors = [
  { hex: "#0a1b3f", name: "Deep Navy" },
  { hex: "#8ea2ff", name: "Periwinkle" },
  { hex: "#ffc39b", name: "Warm Peach" },
  { hex: "#f6f7ff", name: "Cloud White" }
];

const projectTestimonials = [
  { quote: "Every interaction was thoughtfully considered. It's rare to see this level of craft and attention to detail.", author: "Jane Doe", role: "Creative Director" },
  { quote: "They didn't just understand the brief, they elevated it. The final product feels like absolute magic.", author: "John Smith", role: "Product Lead" },
  { quote: "The motion feels physically grounded yet entirely digital. It perfectly captures our brand ethos.", author: "Sarah Lee", role: "Founder" }
];
// ---------------------------------------------------

// -------------------------------------------------------------
// Interactive & Visual Components
// -------------------------------------------------------------

function Preloader({ title }: { title: string }) {
  const [isVisible, setIsVisible] = useState(true);

  // The preloader lasts 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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
            <p className="eyebrow text-white/50 mb-6">Loading Case Study</p>
            <h1 className="font-serif text-5xl md:text-7xl overflow-hidden">
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
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-4 bg-black/80 dark:bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-white/10 dark:border-black/10">
            <div className="size-2 rounded-full relative overflow-hidden bg-white/20 dark:bg-black/20 shrink-0">
               <motion.div 
                 className="absolute bottom-0 left-0 right-0 bg-secondary" 
                 style={{ height: `${progress * 100}%` }} 
               />
            </div>
            <span className="text-white dark:text-black font-medium text-sm tracking-wide whitespace-nowrap">
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
          className="flex whitespace-nowrap text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight ml-4"
        >
          <span className="mr-8">{content}{content}{content}{content}{content}{content}</span>
        </motion.div>
      </div>
    </div>
  );
}

function SplitText({ text, className }: { text: string; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  
  const chars = text.split("");
  
  return (
    <motion.div 
      ref={ref} 
      className={className} 
      initial="hidden" 
      animate={inView ? "visible" : "hidden"} 
      variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
    >
      {chars.map((char, i) => (
        <motion.span 
          key={i} 
          className="inline-block relative will-change-transform" 
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
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
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
          className="font-serif italic text-[2.2rem] md:text-[3.5rem] leading-[1.2] text-[hsl(var(--accent))] font-light tracking-[-0.02em]"
        >
          &ldquo;Every pixel serves a purpose.<br className="hidden md:block"/>Every interaction tells a story.&rdquo;
        </motion.h3>
      </div>
    </section>
  );
}

function MetricReveal({ metric, index, total }: { metric: { label: string, value: string }; index: number; total: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
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
        0{index + 1}
      </span>
      
      {/* Metric dot + label */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={inView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.4, delay: 0.4 + index * 0.15 }}
          className="size-2.5 rounded-full bg-[hsl(var(--secondary))] shrink-0" 
        />
        <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium">
          {index + 1} of {total}
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
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4 mix-blend-difference pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: 20 }}
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

  return (
    <motion.p
      ref={ref}
      variants={container}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className="inline-block mr-[0.25em]">
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}

function ExpandableCard({ title, items }: { title: string, items: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden mt-8 transition-colors hover:border-border">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="font-medium text-[1.1rem] tracking-tight">{title}</span>
        {isOpen ? <Minus className="size-5" /> : <Plus className="size-5" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: transitionEase }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 flex flex-wrap gap-3">
              {items.map((item, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-medium">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StoryChapter({ section, index }: { section: ProjectSection; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const isLeft = section.imageLayout === "left";
  const isNavy = section.tone === "navy";
  
  const content = (
    <div className={`grid md:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-start ${isNavy ? 'p-8 md:p-16 lg:p-20' : ''}`}>
      
      {/* Sticky Label (Desktop) */}
      <div className={`hidden lg:block absolute top-[20vh] ${isLeft ? 'right-full mr-12' : 'left-full ml-12'} whitespace-nowrap opacity-20 origin-left -rotate-90 select-none`}>
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
        
        {/* Mock Expandable Tech Details for testing the new feature */}
        {!isNavy && index % 2 === 0 && (
           <ExpandableCard title="Technical Specs & Tools" items={["React", "Three.js", "Framer Motion", "GSAP", "TailwindCSS", "Lenis"]} />
        )}
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
      {/* Added extra tall padding-bottom so the sticky image effect is more pronounced */}
      <section ref={ref} className={`relative site-shell ${index === 0 ? "pb-32 md:pb-64" : "py-16 md:pb-64 md:pt-32"} px-4 md:px-8`}>
        {isNavy ? (
          <div className="site-card-navy overflow-hidden">
            {content}
          </div>
        ) : (
          content
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
      <Link href={`/projects/${project.id}`} className="group flex flex-col space-y-6">
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
          <h4 className="font-serif text-[1.75rem] md:text-[2.2rem] leading-tight tracking-[-0.02em] text-[hsl(var(--accent))] group-hover:text-secondary transition-colors duration-300">
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

function ProcessTimeline() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <section className="site-shell py-24 md:py-40 px-6 md:px-12">
      <div className="mb-20">
        <SplitText text="The Process" className="font-serif text-[2.5rem] md:text-[4rem] text-accent tracking-[-0.03em]" />
      </div>
      <div ref={ref} className="relative">
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.5, ease: transitionEase }}
          className="absolute top-6 left-0 w-full h-px bg-border origin-left hidden md:block"
        />
        
        <div className="grid md:grid-cols-4 gap-12 md:gap-8">
          {projectProcess.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.3 + (idx * 0.15), ease: transitionEase }}
              className="relative pt-6"
            >
              <div className="absolute top-0 md:-top-[24px] left-0 size-3 rounded-full bg-secondary border-4 border-background z-10 hidden md:block" />
              <div className="space-y-4">
                <span className="text-secondary font-bold text-sm tracking-widest">{step.phase}</span>
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

function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });

  const next = () => setActive((prev) => (prev + 1) % projectTestimonials.length);
  const prev = () => setActive((prev) => (prev - 1 + projectTestimonials.length) % projectTestimonials.length);

  return (
    <section ref={ref} className="bg-accent text-white py-24 md:py-40 overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.4)_0%,transparent_70%)]" />
      
      <div className="site-shell px-6 md:px-12 relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: transitionEase }}
          className="mb-12"
        >
          <svg className="size-12 fill-secondary opacity-80" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </motion.div>

        <div className="relative w-full min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: transitionEase }}
              className="space-y-8"
            >
              <h3 className="font-serif text-[1.8rem] md:text-[2.8rem] leading-[1.3] text-white/90 font-light">
                &ldquo;{projectTestimonials[active].quote}&rdquo;
              </h3>
              <div>
                <p className="font-bold text-[1.1rem] text-white tracking-wide uppercase">{projectTestimonials[active].author}</p>
                <p className="text-secondary text-[1.05rem]">{projectTestimonials[active].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-6 mt-16">
          <button onClick={prev} className="p-4 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
            <ChevronLeft className="size-6" />
          </button>
          <div className="flex gap-2">
            {projectTestimonials.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setActive(idx)}
                className={`h-2 transition-all duration-300 rounded-full ${idx === active ? 'w-8 bg-secondary' : 'w-2 bg-white/20'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <button onClick={next} className="p-4 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
            <ChevronRight className="size-6" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ColorPaletteShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section ref={ref} className="site-shell py-24 md:py-32 px-6 md:px-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <SplitText text="Color Story" className="font-serif text-[2.5rem] md:text-[4rem] text-accent tracking-[-0.03em]" />
          <p className="text-muted-foreground text-lg mt-4 max-w-md">The carefully curated palette that brings the digital experience to life.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {projectColors.map((color, idx) => (
          <motion.button 
            key={idx}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: transitionEase }}
            onClick={() => copyToClipboard(color.hex)}
            className="group text-left"
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
            <p className="font-medium text-lg leading-none mb-2 text-accent">{color.name}</p>
            <p className="text-muted-foreground uppercase tracking-wider text-sm">{color.hex}</p>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------

export default function ProjectDetailView({ project, relatedProjects }: ProjectDetailViewProps) {
  const { scrollYProgress } = useScroll();

  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroTextY = useTransform(heroScroll, [0, 1], ["0%", "45%"]);
  const heroArtworkY = useTransform(heroScroll, [0, 1], ["0%", "85%"]);
  const heroLayer1Y = useTransform(heroScroll, [0, 1], ["0%", "60%"]);
  const heroLayer2Y = useTransform(heroScroll, [0, 1], ["0%", "120%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);

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
  // Map vertical scroll of container to horizontal translation of gallery track
  const horizontalX = useTransform(horizontalScrollProgress, [0, 1], ["0%", "-66.66%"]);

  // We need to pass the progress as a number to NavPill
  const [currentProgress, setCurrentProgress] = useState(0);
  useEffect(() => {
    return scrollYProgress.onChange((latest) => setCurrentProgress(latest));
  }, [scrollYProgress]);

  return (
    <>
      <Preloader title={project.title} />
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 2.2 }} // Wait for preloader
        className="pb-0 bg-background text-foreground relative"
      >
        <NoiseOverlay />
        <TableOfContents count={project.sections.length + 3} />
        <FloatingNavPill title={project.title} progress={currentProgress} />
        
        {/* Scroll Progress Bar */}
        <motion.div 
          className="fixed top-0 left-0 right-0 h-1 md:h-1.5 bg-secondary origin-left z-50 pointer-events-none" 
          style={{ scaleX: scrollYProgress }} 
        />

        {/* 1. Cinematic Layered Parallax Hero */}
        <section ref={heroRef} className="relative flex flex-col items-center justify-center overflow-hidden pt-32 pb-24 md:pt-48 md:pb-40 text-white min-h-[90vh]">
          {/* Animated Gradient Mesh Base */}
          <div className="absolute inset-0 bg-[#050811]">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#1a3280] rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#4b6a9e] rounded-full blur-[150px] mix-blend-screen opacity-30 animate-pulse" style={{ animationDuration: '10s' }} />
          </div>
          
          <motion.div style={{ y: heroLayer2Y, opacity: heroOpacity }} className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            <div className="size-160 border border-white/5 rounded-full absolute -left-40 top-40" />
            <div className="size-120 border border-white/5 rounded-full absolute -right-20 -top-20" />
          </motion.div>

          <motion.div style={{ y: heroLayer1Y, opacity: heroOpacity }} className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            <div className="w-[120%] h-px bg-linear-to-r from-transparent via-white/10 to-transparent absolute top-1/3 rotate-[-15deg]" />
            <div className="w-[120%] h-px bg-linear-to-r from-transparent via-white/10 to-transparent absolute bottom-1/4 rotate-10" />
          </motion.div>
          
          <div className="site-shell relative z-10 flex flex-col items-center justify-between text-center min-h-[50vh]">
            <motion.div style={{ y: heroTextY, opacity: heroOpacity }} className="space-y-6 max-w-5xl pt-8 relative z-20">
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.3, ease: transitionEase }}
                className="eyebrow text-[hsl(var(--secondary))] opacity-90"
              >
                {project.introMeta.client} {project.title.toLowerCase().includes("api") ? "API" : ""}
              </motion.p>
              
              <div className="font-serif text-[4rem] sm:text-[5.5rem] md:text-[7.5rem] leading-[0.95] tracking-[-0.04em] overflow-hidden">
                 <SplitText text={project.heroTitle} />
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.8, ease: transitionEase }}
                className="mx-auto max-w-2xl text-[1.15rem] md:text-[1.4rem] font-light text-white/70 leading-relaxed"
              >
                {project.heroSubtitle}
              </motion.p>
            </motion.div>
            
            {/* Parallax Artwork */}
            <motion.div 
              style={{ y: heroArtworkY, opacity: heroOpacity }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 3, ease: transitionEase }}
              className="w-[12rem] h-[16rem] md:w-[16rem] md:h-[20rem] mt-20 md:mt-28 relative rounded-t-full overflow-hidden border border-white/10 shadow-2xl z-10"
            >
               <Image src={project.primaryShowcase.src} alt="Hero Cover" fill className="object-cover opacity-60 mix-blend-luminosity" priority />
               <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-transparent to-transparent" />
            </motion.div>
          </div>
        </section>

        {/* 2. Overview Bar */}
        <section ref={overviewRef} className="site-shell -mt-12 md:-mt-20 relative z-20 px-4 md:px-8 mb-20 md:mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={overviewInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.7, delay: 3, ease: transitionEase }}
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
            <div className="shrink-0 pt-6 md:pt-0 border-t md:border-0 border-border/50 md:pl-8 w-full md:w-auto">
              <MagneticButton href="#" className="btn-primary group w-full md:w-auto mt-2 md:mt-0 text-[1.05rem] px-8 py-4">
                {project.introMeta.launchLabel}
                <ArrowUpRight className="ml-3 size-4 md:size-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </MagneticButton>
            </div>
          </motion.div>
        </section>

        {/* 3. Editorial Intro */}
        <section ref={introRef} className="site-shell pb-20 md:pb-32 px-6 md:px-12">
          <div className="grid gap-12 md:gap-20 lg:grid-cols-[1.1fr_1.4fr] items-start">
            <h2 className="font-serif text-[2.75rem] leading-[1.05] tracking-[-0.04em] text-accent md:text-[4rem] lg:text-[4.75rem] md:pr-10">
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
        </section>

        {/* 4. Primary LiquidCard Showcase */}
        <section className="site-shell pb-24 md:pb-40 px-4 md:px-8">
          <LiquidCard aspectRatio="aspect-[4/3] md:aspect-[2.2/1]" className="w-full shadow-2xl border border-black/5 dark:border-white/5">
            <RevealImage src={project.primaryShowcase.src} alt={project.primaryShowcase.alt} sizes="100vw" priority />
          </LiquidCard>
        </section>

        {/* NEW: Process Timeline */}
        <ProcessTimeline />

        {/* 5. Story Chapters (with Sticky Image Stacking) */}
        {project.sections.map((section, idx) => (
          <StoryChapter key={idx} section={section} index={idx} />
        ))}

        {/* NEW: Marquee Section */}
        <MarqueeTicker words={project.tags} />

        {/* NEW: Color Palette Showcase */}
        <ColorPaletteShowcase />

        {/* NEW: Pinned Horizontal Scroll Section */}
        <section ref={showcaseContainerRef} className="relative w-full bg-black/5 dark:bg-white/5" style={{ height: "200vh" }}>
          {/* Sticky wrapper that holds exactly 100vh and pins during scroll */}
          <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
            <div className="site-shell mb-8 md:mb-12 w-full px-6 md:px-12">
              <SplitText text="Visual Exploration" className="font-serif text-3xl md:text-5xl text-accent mix-blend-difference" />
            </div>
            {/* The horizontal track that translates based on vertical scroll */}
            <motion.div style={{ x: horizontalX }} className="flex gap-6 md:gap-12 px-6 md:px-12 w-[300vw] items-center">
              {project.gallery.slice(0, 3).map((image, idx) => (
                <div key={idx} className="w-[85vw] md:w-[60vw] shrink-0">
                  <LiquidCard className="w-full shadow-2xl" aspectRatio="aspect-[16/9]">
                    <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="(max-width: 768px) 85vw, 60vw" />
                  </LiquidCard>
                </div>
              ))}
            </motion.div>

            {/* Progress indicator for horizontal scroll */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-accent/20 rounded-full overflow-hidden hidden md:block z-50">
              <motion.div 
                className="h-full bg-secondary origin-left"
                style={{ scaleX: horizontalScrollProgress }}
              />
            </div>
          </div>
        </section>

        {/* NEW: Testimonial Carousel */}
        <TestimonialCarousel />

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
                <p className="eyebrow text-[hsl(var(--secondary))] mb-5 opacity-80">Results & Impact</p>
                <h3 className="font-serif text-[3rem] md:text-[5rem] tracking-tight text-white leading-[0.95]">
                  <SplitText text="Project Impact" />
                </h3>
              </div>
              <p className="text-white/40 text-sm md:text-base max-w-xs font-light leading-relaxed">
                Key outcomes that define the project&apos;s success and lasting value.
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
        <section className="bg-white/40 dark:bg-black/20 pt-28 pb-40 border-t border-border/40 backdrop-blur-3xl relative z-20 overflow-hidden">
          <div className="site-shell px-6 md:px-12 lg:px-20 mb-32 md:mb-48">
            <div className="mb-14 md:mb-20">
              <h3 className="font-serif text-[2.75rem] md:text-[4rem] tracking-[-0.03em] text-accent">Related projects</h3>
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
                    <span className="block text-sm uppercase tracking-widest text-[hsl(var(--secondary))] mb-2 font-bold">Inquiries</span>
                    <a href="mailto:hello@example.com" className="text-2xl md:text-3xl font-serif hover:text-[hsl(var(--secondary))] transition-colors border-b border-white/20 pb-1">
                      hello@example.com
                    </a>
                  </div>
                  <div>
                     <span className="block text-sm uppercase tracking-widest text-[hsl(var(--secondary))] mb-2 font-bold font-sans">Connect</span>
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
                   <p key={i} className="text-[0.7rem] md:text-[0.8rem] uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                     <span className="opacity-70 font-medium block md:inline mb-1 md:mb-0">{c.label}: </span>
                     <span className="font-semibold text-[hsl(var(--accent))]">{c.value}</span>
                   </p>
                 ))}
              </div>
            </div>
          </div>
        </section>
        
      </motion.main>
    </>
  );
}
