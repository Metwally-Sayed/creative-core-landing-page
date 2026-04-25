"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import LiquidCard from "@/components/LiquidCard";
import { EditorialReveal, EditorialWordReveal } from "@/components/editorial/EditorialMotion";
import { useDirection } from "@/hooks/useDirection";

const ease = [0.22, 1, 0.36, 1] as const;

export type ServiceCard = {
  title: string;
  subtitle: string;
  image_url: string;
  slug: string;
};

export default function ServicesSectionBlock({
  sectionId,
  index,
  eyebrow,
  title,
  body,
  link_label,
  cards,
}: {
  sectionId?: string;
  index: number;
  eyebrow: string;
  title: string;
  body: string;
  link_label: string;
  cards: ServiceCard[];
}) {
  const dir = useDirection();
  const reduced = useReducedMotion();
  const num = String(index + 1).padStart(2, "0");

  return (
    <section
      id={sectionId}
      className="relative scroll-mt-20 overflow-hidden border-b border-border/30 bg-background"
    >
      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ghost section number */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute select-none font-serif font-black leading-none text-accent/[0.032]"
        style={{
          fontSize: "clamp(14rem, 26vw, 32rem)",
          bottom: "-8%",
          right: dir === -1 ? "auto" : "-2%",
          left: dir === -1 ? "-2%" : "auto",
          letterSpacing: "-0.07em",
          lineHeight: 1,
        }}
        initial={reduced ? false : { opacity: 0, x: dir === -1 ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease }}
      >
        {num}
      </motion.span>

      <div className="relative mx-auto max-w-[1520px] px-6 py-24 md:px-12 md:py-32 lg:px-20">

        {/* Eyebrow strip */}
        <motion.div
          className="mb-14 flex items-center gap-5"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-accent/50"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.38em] text-accent/40">
              {eyebrow}
            </span>
          </div>
          <motion.div
            className="h-px flex-1 origin-left bg-gradient-to-r from-accent/20 to-transparent"
            initial={reduced ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.2, ease }}
          />
          <span className="font-mono text-[0.65rem] tabular-nums tracking-[0.28em] text-accent/20">{num}</span>
        </motion.div>

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-y-14 lg:grid-cols-[1fr_minmax(0,0.72fr)] lg:gap-x-0">

          {/* Title column */}
          <div className="relative lg:pe-20">
            <motion.div
              className="absolute -start-3 top-2 hidden h-[3.2rem] w-[3px] rounded-full bg-accent/25 lg:block"
              initial={reduced ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3, ease }}
              style={{ transformOrigin: "top" }}
            />

            <EditorialWordReveal
              as="h2"
              text={title}
              className="font-serif text-[clamp(2.4rem,4.6vw,4.4rem)] leading-[0.92] tracking-[-0.05em] text-accent"
              delayChildren={0.1}
              stagger={0.055}
            />

            <div className="mt-10 space-y-2.5">
              <motion.div
                className="h-px origin-left bg-accent/20"
                initial={reduced ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5, ease }}
              />
              <motion.div
                className="h-px origin-left bg-accent/08"
                style={{ width: "55%" }}
                initial={reduced ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.7, ease }}
              />
            </div>
          </div>

          {/* Body column */}
          <EditorialReveal delay={0.38} x={20 * dir} y={20}>
            <div className="flex h-full flex-col justify-between gap-8 lg:border-s lg:border-accent/10 lg:ps-14 lg:pt-1">

              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-accent/30">
                  <rect x="0.5" y="0.5" width="15" height="15" stroke="currentColor" strokeWidth="0.7" />
                  <line x1="8" y1="0.5" x2="8" y2="15.5" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="0.5" y1="8" x2="15.5" y2="8" stroke="currentColor" strokeWidth="0.5" />
                </svg>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-accent/28">
                  {eyebrow}
                </span>
              </div>

              <p className="text-[clamp(1rem,1.55vw,1.18rem)] leading-[1.75] tracking-[-0.01em] text-foreground/60">
                {body}
              </p>

              <EditorialReveal delay={0.18} y={14}>
                <Link
                  href="/work"
                  className="group flex items-center gap-3 font-mono text-[0.75rem] uppercase tracking-[0.3em] text-accent/60 transition-colors hover:text-accent"
                >
                  <span className="h-px w-6 bg-accent/40 transition-all duration-300 group-hover:w-10" />
                  {link_label}
                </Link>
              </EditorialReveal>
            </div>
          </EditorialReveal>
        </div>

        {/* Cards grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {cards.map((card, i) => (
            <EditorialReveal key={card.slug || i} delay={0.2 + i * 0.1} y={28}>
              <article className="group space-y-4">
                <Link href={`/projects/${card.slug}`} className="block">
                  <LiquidCard
                    aspectRatio="aspect-[0.88]"
                    className="border border-white/70 bg-white/80 shadow-[var(--shadow-soft)]"
                  >
                    <div className="absolute inset-0 overflow-hidden">
                      {card.image_url && (
                        <Image
                          src={card.image_url}
                          alt={card.title}
                          fill
                          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(22,49,82,0.22)_100%)]" />
                    </div>
                  </LiquidCard>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-px w-4 bg-accent/30" />
                      <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-accent/35">{card.subtitle}</p>
                    </div>
                    <h3 className="max-w-[17ch] font-serif text-[1.9rem] leading-[0.95] tracking-[-0.04em] text-accent transition-opacity duration-300 group-hover:opacity-70">
                      {card.title}
                    </h3>
                  </div>
                </Link>
              </article>
            </EditorialReveal>
          ))}
        </div>

        {/* Bottom rule */}
        <motion.div
          className="mt-20 flex items-center gap-5"
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="h-px flex-1 origin-left bg-gradient-to-r from-accent/25 via-accent/6 to-transparent"
            initial={reduced ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5, ease }}
          />
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-accent/20" />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.42em] text-accent/18">Create Core</span>
            <div className="h-1 w-1 rounded-full bg-accent/20" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
