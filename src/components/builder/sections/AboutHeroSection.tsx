"use client";

import { EditorialReveal, EditorialWordReveal } from "@/components/editorial/EditorialMotion";
import { useDirection } from "@/hooks/useDirection";

export default function AboutHeroSection({ title, body }: { title: string; body: string }) {
  const dir = useDirection();
  return (
    <section className="border-b border-border/55">
      <div className="mx-auto max-w-[1450px] px-6 pb-20 pt-[8.6rem] md:px-10 md:pb-28 md:pt-40 lg:px-16 lg:pt-[10.5rem]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(24rem,0.95fr)] lg:items-end lg:gap-x-16">
          <EditorialWordReveal
            as="h1"
            text={title}
            className="font-serif text-[clamp(4.8rem,9vw,8.4rem)] leading-[0.9] tracking-[-0.07em] text-accent"
          />
          <EditorialReveal delay={0.16} x={30 * dir} y={18}>
            <p className="max-w-[38rem] pb-2 text-[clamp(1.35rem,2.2vw,2.05rem)] leading-[1.28] tracking-[-0.03em] text-foreground/80">
              {body}
            </p>
          </EditorialReveal>
        </div>
      </div>
    </section>
  );
}
