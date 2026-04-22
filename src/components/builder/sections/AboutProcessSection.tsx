"use client";

import { Link } from "@/i18n/navigation";
import { EditorialReveal, EditorialWordReveal } from "@/components/editorial/EditorialMotion";
import { useDirection } from "@/hooks/useDirection";

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
  return (
    <section className="py-16 md:py-28">
      <div className="mx-auto max-w-[1450px] px-6 md:px-10 lg:px-16">
        <div className="lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-16">
          <div />
          <div className="space-y-12">
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
              <EditorialReveal delay={0.12} y={22}>
                <p className="max-w-[50rem] text-[1.05rem] leading-[1.72] text-muted-foreground md:text-[1.1rem]">
                  {body}
                </p>
              </EditorialReveal>
            </EditorialReveal>

            <div className="grid gap-px bg-border/25 md:grid-cols-2">
              {steps.map((step, i) => (
                <EditorialReveal key={step.num} delay={0.14 + i * 0.07} y={24}>
                  <div className="space-y-4 bg-background p-8 md:p-10">
                    <span
                      aria-hidden
                      className="block font-serif text-[4.5rem] leading-none tracking-[-0.08em] text-accent/10"
                    >
                      {step.num}
                    </span>
                    <h3 className="font-serif text-[2rem] leading-[0.95] tracking-[-0.045em] text-accent md:text-[2.4rem]">
                      {step.title}
                    </h3>
                    <p className="text-[0.98rem] leading-[1.7] text-muted-foreground">{step.body}</p>
                  </div>
                </EditorialReveal>
              ))}
            </div>

            <EditorialReveal delay={0.32} y={18}>
              <Link
                href="/work"
                className="inline-block text-[0.82rem] font-medium text-accent underline decoration-secondary/70 underline-offset-[3px] transition-colors hover:text-secondary"
              >
                See our work →
              </Link>
            </EditorialReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
