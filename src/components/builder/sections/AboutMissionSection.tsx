"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EditorialReveal, EditorialWordReveal } from "@/components/editorial/EditorialMotion";

const ease = [0.22, 1, 0.36, 1] as const;

export default function AboutMissionSection({ eyebrow, quote }: { eyebrow: string; quote: string }) {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-accent py-28 md:py-40">

      {/* Dot-grid texture over accent */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Large ghost quotation mark */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute select-none font-serif font-black leading-none text-white/[0.04]"
        style={{
          fontSize: "clamp(20rem, 40vw, 52rem)",
          top: "-15%",
          left: "-3%",
          letterSpacing: "-0.1em",
          lineHeight: 1,
        }}
        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease }}
      >
        "
      </motion.span>

      {/* Top sweep line */}
      <motion.div
        className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease }}
      />

      <div className="relative mx-auto max-w-[1200px] px-6 text-center md:px-12 lg:px-20">

        {/* Eyebrow strip */}
        <EditorialReveal delay={0.04} y={16}>
          <div className="mb-12 flex items-center justify-center gap-5">
            <motion.div
              className="h-px w-12 origin-right bg-white/20"
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
            />
            <div className="flex items-center gap-2.5">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-white/50"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="font-mono text-[0.72rem] uppercase tracking-[0.42em] text-white/45">
                {eyebrow}
              </span>
            </div>
            <motion.div
              className="h-px w-12 origin-left bg-white/20"
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
            />
          </div>
        </EditorialReveal>

        {/* Quote */}
        <EditorialWordReveal
          as="h2"
          text={quote}
          className="font-serif text-[clamp(2.4rem,5.2vw,5rem)] leading-[1.06] tracking-[-0.055em] text-white"
          delayChildren={0.1}
          stagger={0.045}
        />

        {/* Closing mark */}
        <motion.div
          className="mt-14 flex items-center justify-center gap-4"
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="h-px w-10 bg-white/18" />
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/25">
            <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="0.7" />
            <line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeWidth="0.5" />
            <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="0.5" />
          </svg>
          <div className="h-px w-10 bg-white/18" />
        </motion.div>

      </div>

      {/* Bottom sweep line */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px origin-right bg-gradient-to-l from-transparent via-white/20 to-transparent"
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, delay: 0.3, ease }}
      />
    </section>
  );
}
