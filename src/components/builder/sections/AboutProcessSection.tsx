"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { EditorialReveal, EditorialWordReveal } from "@/components/editorial/EditorialMotion";
import { useDirection } from "@/hooks/useDirection";

const ease = [0.22, 1, 0.36, 1] as const;

export type ProcessStep = { num: string; title: string; body: string };

export default function AboutProcessSection({
  eyebrow,
  title,
  body,
  steps,
}: {
  eyebrow: string;
  title: string;
  body: string;
  steps: ProcessStep[];
}) {
  const dir = useDirection();
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-background">

      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ghost numeral */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute select-none font-serif font-black leading-none text-accent/[0.028]"
        style={{
          fontSize: "clamp(14rem, 24vw, 30rem)",
          top: "0%",
          left: dir === -1 ? "auto" : "-2%",
          right: dir === -1 ? "-2%" : "auto",
          letterSpacing: "-0.07em",
          lineHeight: 1,
        }}
        initial={reduced ? false : { opacity: 0, x: dir === -1 ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease }}
      >
        03
      </motion.span>

      <div className="relative mx-auto max-w-[1520px] px-6 pb-32 pt-24 md:px-12 md:pb-40 md:pt-32 lg:px-20">

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

        {/* Header grid */}
        <div className="mb-20 grid grid-cols-1 gap-y-14 lg:grid-cols-[1fr_minmax(0,0.72fr)] lg:gap-x-0">

          {/* Title */}
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

          {/* Body */}
          <EditorialReveal delay={0.38} x={20 * dir} y={20}>
            <div className="flex h-full flex-col justify-between gap-10 lg:border-s lg:border-accent/10 lg:ps-14 lg:pt-1">
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-accent/30">
                  <rect x="0.5" y="0.5" width="15" height="15" stroke="currentColor" strokeWidth="0.7" />
                  <line x1="8" y1="0.5" x2="8" y2="15.5" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="0.5" y1="8" x2="15.5" y2="8" stroke="currentColor" strokeWidth="0.5" />
                </svg>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-accent/28">
                  Process
                </span>
              </div>
              <p className="text-[clamp(1rem,1.55vw,1.18rem)] leading-[1.75] tracking-[-0.01em] text-foreground/60">
                {body}
              </p>
            </div>
          </EditorialReveal>
        </div>

        {/* Steps grid */}
        <div className="grid gap-px bg-border/20 sm:grid-cols-2 lg:grid-cols-2">
          {steps.map((step, i) => (
            <EditorialReveal key={step.num} delay={0.12 + i * 0.08} y={28}>
              <div className="group relative overflow-hidden bg-background p-8 md:p-10">

                {/* Step dot-grid */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.018]"
                  style={{
                    backgroundImage: "radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />

                {/* Ghost step number */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-4 -end-2 select-none font-serif font-black leading-none text-accent/[0.055] transition-opacity duration-500 group-hover:opacity-80"
                  style={{ fontSize: "9rem", letterSpacing: "-0.08em", lineHeight: 1 }}
                >
                  {step.num}
                </span>

                {/* Top scan line */}
                <motion.div
                  className="mb-8 h-px origin-left bg-accent/15"
                  initial={reduced ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease }}
                />

                {/* Step counter label */}
                <div className="mb-5 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-accent/40" />
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.38em] text-accent/35">
                    Step {step.num}
                  </span>
                </div>

                <h3 className="relative mb-4 font-serif text-[1.75rem] leading-[0.95] tracking-[-0.04em] text-accent md:text-[2rem]">
                  {step.title}
                </h3>
                <p className="relative text-[0.96rem] leading-[1.72] text-foreground/55">
                  {step.body}
                </p>

              </div>
            </EditorialReveal>
          ))}
        </div>

        {/* CTA + bottom rule */}
        <div className="mt-16 flex items-center gap-8">
          <EditorialReveal delay={0.3} y={16}>
            <Link
              href="/work"
              className="group flex items-center gap-3 font-mono text-[0.75rem] uppercase tracking-[0.3em] text-accent/60 transition-colors hover:text-accent"
            >
              <span className="h-px w-6 bg-accent/40 transition-all group-hover:w-10" />
              See our work
            </Link>
          </EditorialReveal>

          <motion.div
            className="h-px flex-1 origin-left bg-gradient-to-r from-accent/20 via-accent/6 to-transparent"
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
        </div>

      </div>
    </section>
  );
}
