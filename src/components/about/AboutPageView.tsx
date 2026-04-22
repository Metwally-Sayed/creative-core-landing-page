"use client";

import { Link } from "@/i18n/navigation";
import {
  EditorialReveal,
  EditorialWordReveal,
} from "@/components/editorial/EditorialMotion";
import { useDirection } from "@/hooks/useDirection";
import type { ProcessStep } from "@/lib/about-catalog";

// ─── Types ────────────────────────────────────────────────────────────────────

type ResolvedStep = {
  num: string;
  title: string;
  body: string;
};

type Props = {
  hero: { title: string; body: string };
  whoAreWe: { eyebrow: string; title: string; body: string };
  whyUs: { eyebrow: string; title: string; body: string };
  mission: { eyebrow: string; quote: string };
  process: { eyebrow: string; title: string; body: string; steps: ResolvedStep[] };
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

function AboutHero({ title, body }: { title: string; body: string }) {
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

// ─── Content section (Who Are We / Why Us) ────────────────────────────────────

function ContentSection({
  eyebrow,
  title,
  body,
  id,
}: {
  eyebrow: string;
  title: string;
  body: string;
  id: string;
}) {
  const dir = useDirection();
  return (
    <section
      id={id}
      className="scroll-mt-20 border-b border-border/20 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1450px] px-6 md:px-10 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-16 lg:px-16">
        <div />
        <EditorialReveal className="space-y-5" x={34 * dir} y={18} delay={0.04}>
          <EditorialReveal delay={0.04} y={18}>
            <p className="text-[0.78rem] leading-none text-secondary/75">
              {eyebrow}
            </p>
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

// ─── Mission ──────────────────────────────────────────────────────────────────

function MissionSection({
  eyebrow,
  quote,
}: {
  eyebrow: string;
  quote: string;
}) {
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

// ─── Process ──────────────────────────────────────────────────────────────────

function ProcessSection({
  eyebrow,
  title,
  body,
  steps,
}: {
  eyebrow: string;
  title: string;
  body: string;
  steps: ResolvedStep[];
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
                <p className="text-[0.78rem] leading-none text-secondary/75">
                  {eyebrow}
                </p>
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
                    <p className="text-[0.98rem] leading-[1.7] text-muted-foreground">
                      {step.body}
                    </p>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPageView({
  hero,
  whoAreWe,
  whyUs,
  mission,
  process,
}: Props) {
  return (
    <div className="relative overflow-hidden text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.68)_0%,hsl(var(--background)/0.82)_22%,hsl(var(--background)/0.94)_54%,hsl(var(--background)/0.98)_100%)] backdrop-blur-[2px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(64rem,100vh)] bg-[radial-gradient(circle_at_top_left,hsl(var(--secondary)/0.18),transparent_38%),radial-gradient(circle_at_top_right,hsl(var(--primary)/0.14),transparent_42%)]"
      />
      <div className="relative">
        <AboutHero {...hero} />
        <ContentSection
          id="who-are-we"
          eyebrow={whoAreWe.eyebrow}
          title={whoAreWe.title}
          body={whoAreWe.body}
        />
        <ContentSection
          id="why-us"
          eyebrow={whyUs.eyebrow}
          title={whyUs.title}
          body={whyUs.body}
        />
        <MissionSection eyebrow={mission.eyebrow} quote={mission.quote} />
        <ProcessSection
          eyebrow={process.eyebrow}
          title={process.title}
          body={process.body}
          steps={process.steps}
        />
      </div>
    </div>
  );
}
