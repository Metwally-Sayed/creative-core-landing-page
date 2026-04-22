"use client";

import { EditorialReveal, EditorialWordReveal } from "@/components/editorial/EditorialMotion";
import { useDirection } from "@/hooks/useDirection";

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
  return (
    <section
      id={sectionId}
      className="scroll-mt-20 border-b border-border/20 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1450px] px-6 md:px-10 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-16 lg:px-16">
        <div />
        <EditorialReveal className="space-y-5" x={34 * dir} y={18} delay={0.04}>
          <EditorialReveal delay={0.04} y={18}>
            <p className="text-[0.78rem] leading-none text-secondary/75">{eyebrow}</p>
          </EditorialReveal>
          <EditorialWordReveal
            as="h2"
            text={title}
            className="font-serif text-[clamp(4rem,7vw,6.25rem)] leading-[0.9] tracking-[-0.07em] text-accent"
            delayChildren={0.06}
          />
          <EditorialReveal delay={0.14} y={22}>
            <p className="max-w-[56rem] text-[1.05rem] leading-[1.72] text-muted-foreground md:text-[1.1rem]">
              {body}
            </p>
          </EditorialReveal>
        </EditorialReveal>
      </div>
    </section>
  );
}
