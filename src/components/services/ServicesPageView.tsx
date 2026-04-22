"use client";

import Image from "next/image";

import { Link } from "@/i18n/navigation";
import LiquidCard from "@/components/LiquidCard";
import {
  EditorialReveal,
  EditorialWordReveal,
} from "@/components/editorial/EditorialMotion";
import { useDirection } from "@/hooks/useDirection";

// ─── Resolved (locale-picked) types passed from the server container ──────────

export type ResolvedCard = {
  title: string;
  subtitle: string;
  imageUrl: string;
  slug: string;
};

export type ResolvedSection = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  linkLabel: string;
  cards: [ResolvedCard, ResolvedCard];
};

export type ResolvedAwardStat = { label: string; value: string };

type Props = {
  hero: { title: string; body: string };
  sections: ResolvedSection[];
  credentials: { eyebrow: string; title: string; body: string };
  awardColumns: [ResolvedAwardStat[], ResolvedAwardStat[]];
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

function ServicesHero({ title, body }: { title: string; body: string }) {
  const dir = useDirection();
  return (
    <section className="border-b border-border/55">
      <div className="mx-auto max-w-[1450px] px-6 pb-20 pt-[8.6rem] md:px-10 md:pb-28 md:pt-40 lg:px-16 lg:pt-[10.5rem]">
        {/* Title + body */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(24rem,0.95fr)] lg:items-end lg:gap-x-16">
          <EditorialWordReveal
            as="h1"
            text={title}
            className="font-serif text-[clamp(4.8rem,9vw,8.4rem)] leading-[0.9] tracking-[-0.07em] text-accent"
          />
          <EditorialReveal delay={0.16} x={30 * dir} y={18}>
            <p className="max-w-[36rem] pb-2 text-[clamp(1.45rem,2.35vw,2.15rem)] leading-[1.25] tracking-[-0.03em] text-foreground/80">
              {body}
            </p>
          </EditorialReveal>
        </div>

      </div>
    </section>
  );
}

// ─── Service card ─────────────────────────────────────────────────────────────

function ServiceShowcaseCard({ imageUrl, subtitle, title, slug }: ResolvedCard) {
  return (
    <article className="group space-y-3">
      <Link href={`/projects/${slug}`} className="block">
        <LiquidCard
          aspectRatio="aspect-[0.88]"
          className="border border-white/70 bg-white/80 shadow-[var(--shadow-soft)]"
        >
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(22,49,82,0.22)_100%)]" />
          </div>
        </LiquidCard>
        <div className="space-y-1">
          <p className="text-[0.73rem] leading-none text-secondary/75">{subtitle}</p>
          <h3 className="max-w-[17ch] font-serif text-[2rem] leading-[0.95] tracking-[-0.04em] text-accent transition-opacity duration-300 group-hover:opacity-70">
            {title}
          </h3>
        </div>
      </Link>
    </article>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function ServicesSection({
  section,
  index,
}: {
  section: ResolvedSection;
  index: number;
}) {
  const dir = useDirection();
  const num = String(index + 1).padStart(2, "0");

  return (
    <section
      id={section.id}
      className="scroll-mt-20 border-b border-border/20 py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-[1450px] gap-y-10 px-6 md:px-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-16 lg:px-16">
        {/* Left: decorative number */}
        <EditorialReveal
          className="hidden items-start justify-center pt-3 lg:flex lg:justify-start"
          x={-36 * dir}
          y={12}
        >
          <span
            aria-hidden
            className="select-none font-serif text-[8rem] leading-none tracking-[-0.08em] text-accent/8"
          >
            {num}
          </span>
        </EditorialReveal>

        {/* Right: content */}
        <EditorialReveal className="space-y-8" x={34 * dir} y={18} delay={0.06}>
          <div className="space-y-5">
            <EditorialReveal delay={0.04} y={18}>
              <p className="text-[0.78rem] leading-none text-secondary/75">
                {section.eyebrow}
              </p>
            </EditorialReveal>
            <EditorialWordReveal
              as="h2"
              text={section.title}
              className="font-serif text-[clamp(4.1rem,7vw,6.25rem)] leading-[0.9] tracking-[-0.07em] text-accent"
              delayChildren={0.06}
            />
            <EditorialReveal delay={0.12} y={22}>
              <p className="max-w-[54rem] text-[1.05rem] leading-[1.72] text-muted-foreground md:text-[1.1rem]">
                {section.body}
              </p>
            </EditorialReveal>
          </div>

          <EditorialReveal delay={0.18} y={18}>
            <Link
              href="/work"
              className="inline-block text-[0.82rem] font-medium text-accent underline decoration-secondary/70 underline-offset-[3px] transition-colors hover:text-secondary"
            >
              {section.linkLabel}
            </Link>
          </EditorialReveal>

          <div className="grid gap-10 pt-1 md:grid-cols-2">
            {section.cards.map((card, i) => (
              <EditorialReveal key={card.slug} delay={0.2 + i * 0.08} y={28}>
                <ServiceShowcaseCard {...card} />
              </EditorialReveal>
            ))}
          </div>
        </EditorialReveal>
      </div>
    </section>
  );
}

// ─── Credentials ─────────────────────────────────────────────────────────────

function CredentialsSection({
  credentials,
  awardColumns,
}: Pick<Props, "credentials" | "awardColumns">) {
  const dir = useDirection();
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-[1450px] px-6 md:px-10 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-16 lg:px-16">
        <div />
        <EditorialReveal className="space-y-10" x={22 * dir} y={20}>
          <div className="space-y-5">
            <EditorialReveal delay={0.04} y={18}>
              <p className="text-[0.78rem] leading-none text-secondary/75">
                {credentials.eyebrow}
              </p>
            </EditorialReveal>
            <EditorialWordReveal
              as="h2"
              text={credentials.title}
              className="font-serif text-[clamp(4rem,7vw,6rem)] leading-[0.9] tracking-[-0.07em] text-accent"
              delayChildren={0.05}
            />
            <EditorialReveal delay={0.12} y={22}>
              <p className="max-w-[52rem] text-[1.05rem] leading-[1.72] text-muted-foreground md:text-[1.1rem]">
                {credentials.body}
              </p>
            </EditorialReveal>
          </div>

          <div className="grid gap-16 pt-6 md:grid-cols-2 md:gap-x-16">
            {awardColumns.map((col, ci) => (
              <EditorialReveal key={ci} delay={0.18 + ci * 0.06} y={24}>
                <div className="space-y-10">
                  {col.map((stat, si) => (
                    <EditorialReveal
                      key={stat.label}
                      delay={0.12 + si * 0.08}
                      y={24}
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 border-t border-border/60 pt-4">
                        <p className="font-serif text-[1.65rem] leading-[1.05] tracking-[-0.03em] text-accent md:text-[1.95rem]">
                          {stat.label}
                        </p>
                        <p className="font-serif text-[4.2rem] leading-none tracking-[-0.07em] text-accent md:text-[5rem]">
                          {stat.value}
                        </p>
                      </div>
                    </EditorialReveal>
                  ))}
                </div>
              </EditorialReveal>
            ))}
          </div>
        </EditorialReveal>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPageView({
  hero,
  sections,
  credentials,
  awardColumns,
}: Props) {
  return (
    <div className="relative overflow-hidden text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.68)_0%,hsl(var(--background)/0.8)_22%,hsl(var(--background)/0.92)_48%,hsl(var(--background)/0.96)_100%)] backdrop-blur-[2px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(64rem,100vh)] bg-[radial-gradient(circle_at_top_left,hsl(var(--secondary)/0.18),transparent_38%),radial-gradient(circle_at_top_right,hsl(var(--primary)/0.14),transparent_42%)]"
      />
      <div className="relative">
        <ServicesHero {...hero} />
        {sections.map((section, i) => (
          <ServicesSection key={section.id} section={section} index={i} />
        ))}
        <CredentialsSection credentials={credentials} awardColumns={awardColumns} />
      </div>
    </div>
  );
}
