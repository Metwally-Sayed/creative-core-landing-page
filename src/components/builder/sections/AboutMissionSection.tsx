"use client";

import { EditorialReveal, EditorialWordReveal } from "@/components/editorial/EditorialMotion";

export default function AboutMissionSection({ eyebrow, quote }: { eyebrow: string; quote: string }) {
  return (
    <section className="bg-accent py-24 md:py-36">
      <div className="mx-auto max-w-[1200px] px-6 text-center md:px-10 lg:px-16">
        <EditorialReveal delay={0.04} y={16}>
          <p className="mb-8 text-[0.78rem] leading-none tracking-[0.12em] text-white/55 uppercase">
            {eyebrow}
          </p>
        </EditorialReveal>
        <EditorialWordReveal
          as="h2"
          text={quote}
          className="font-serif text-[clamp(3rem,6vw,5.4rem)] leading-[1.05] tracking-[-0.055em] text-white"
          delayChildren={0.08}
        />
      </div>
    </section>
  );
}
