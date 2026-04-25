"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EditorialReveal, EditorialWordReveal } from "@/components/editorial/EditorialMotion";
import { useDirection } from "@/hooks/useDirection";

const ease = [0.22, 1, 0.36, 1] as const;

export default function AboutContentSection({
  eyebrow,
  title,
  body,
  sectionId,
}: {
  eyebrow: string;
  title: string;
  body: string;
  sectionId?: string;
}) {
  const dir = useDirection();
  const reduced = useReducedMotion();

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

      {/* Ghost text watermark */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute select-none font-serif font-black leading-none text-accent/[0.03]"
        style={{
          fontSize: "clamp(12rem, 22vw, 28rem)",
          bottom: "-5%",
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
        02
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
            <div className="flex h-full flex-col justify-between gap-10 lg:border-s lg:border-accent/10 lg:ps-14 lg:pt-1">

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

            </div>
          </EditorialReveal>
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
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.42em] text-accent/18">
              Create Core
            </span>
            <div className="h-1 w-1 rounded-full bg-accent/20" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
