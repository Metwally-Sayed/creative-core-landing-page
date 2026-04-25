"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EditorialReveal, EditorialWordReveal } from "@/components/editorial/EditorialMotion";
import { useDirection } from "@/hooks/useDirection";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ServicesHeroSection({ title, body }: { title: string; body: string }) {
  const dir = useDirection();
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-background">

      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ghost numeral */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute select-none font-serif font-black leading-none text-accent/[0.04]"
        style={{
          fontSize: "clamp(18rem, 34vw, 42rem)",
          top: "-6%",
          right: dir === -1 ? "auto" : "-4%",
          left: dir === -1 ? "-4%" : "auto",
          lineHeight: 1,
          letterSpacing: "-0.07em",
        }}
        initial={reduced ? false : { opacity: 0, x: dir === -1 ? -60 : 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 2, ease }}
      >
        01
      </motion.span>

      {/* Top sweep */}
      <motion.div
        className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-transparent via-accent/20 to-transparent"
        initial={reduced ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.6, ease }}
      />

      <div className="relative mx-auto max-w-[1520px] px-6 pb-32 pt-[8rem] md:px-12 md:pb-40 md:pt-48 lg:px-20">

        {/* Vertical side label */}
        <motion.div
          className="absolute hidden items-center gap-3 lg:flex"
          style={{
            writingMode: "vertical-rl",
            top: "50%",
            [dir === -1 ? "right" : "left"]: "1.5rem",
            transform: "translateY(-50%) rotate(180deg)",
          }}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.45em] text-accent/25">Services</span>
          <div className="h-16 w-px bg-accent/15" />
          <span className="font-mono text-[0.5rem] tabular-nums tracking-[0.3em] text-accent/18">001</span>
        </motion.div>

        {/* Eyebrow strip */}
        <motion.div
          className="mb-16 flex items-center gap-5"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-accent/50"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.38em] text-accent/40">
              Studio · Services
            </span>
          </div>
          <motion.div
            className="h-px flex-1 origin-left bg-gradient-to-r from-accent/20 to-transparent"
            initial={reduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, delay: 0.3, ease }}
          />
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-[1fr_minmax(0,0.72fr)] lg:gap-x-0">

          {/* Title column */}
          <div className="relative lg:pe-20">
            <motion.div
              className="absolute -start-3 top-2 hidden h-[3.2rem] w-[3px] rounded-full bg-accent/25 lg:block"
              initial={reduced ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease }}
              style={{ transformOrigin: "top" }}
            />

            <EditorialWordReveal
              as="h1"
              text={title}
              className="font-serif text-[clamp(2.2rem,4.2vw,4rem)] leading-[0.92] tracking-[-0.05em] text-accent"
              delayChildren={0.18}
              stagger={0.06}
            />

            <div className="mt-10 space-y-2.5">
              <motion.div
                className="h-px origin-left bg-accent/20"
                initial={reduced ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5, ease }}
              />
              <motion.div
                className="h-px origin-left bg-accent/08"
                style={{ width: "60%" }}
                initial={reduced ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.7, ease }}
              />
            </div>
          </div>

          {/* Body column */}
          <EditorialReveal delay={0.45} x={22 * dir} y={22}>
            <div className="flex h-full flex-col justify-between gap-10 lg:border-s lg:border-accent/10 lg:ps-14 lg:pt-1">

              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 text-accent/35">
                  <rect x="0.5" y="0.5" width="17" height="17" stroke="currentColor" strokeWidth="0.8" />
                  <line x1="9" y1="0.5" x2="9" y2="17.5" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="0.5" y1="9" x2="17.5" y2="9" stroke="currentColor" strokeWidth="0.5" />
                </svg>
                <span className="font-mono text-[0.52rem] uppercase tracking-[0.4em] text-accent/30">
                  What we offer
                </span>
              </div>

              <p className="text-[clamp(1rem,1.6vw,1.22rem)] leading-[1.75] tracking-[-0.01em] text-foreground/60">
                {body}
              </p>

              <motion.div
                className="flex items-end gap-6 border-t border-accent/8 pt-7"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.9 }}
              >
                {["Brand", "Digital", "Motion"].map((tag, i) => (
                  <div key={tag} className="flex flex-col gap-1.5">
                    <div className="h-px bg-accent/30" style={{ width: `${2.5 - i * 0.5}rem` }} />
                    <span className="font-mono text-[0.48rem] uppercase tracking-[0.35em] text-accent/30">{tag}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </EditorialReveal>
        </div>

        {/* Bottom rule */}
        <motion.div
          className="mt-24 flex items-center gap-6"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.div
            className="h-px flex-1 origin-left bg-gradient-to-r from-accent/30 via-accent/8 to-transparent"
            initial={reduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.6, ease }}
          />
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-accent/25" />
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.42em] text-accent/20">Create Core</span>
            <div className="h-1 w-1 rounded-full bg-accent/25" />
          </div>
        </motion.div>

      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-border/40" />
    </section>
  );
}
