"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import LiquidCard from "@/components/LiquidCard";
import {
  EditorialReveal,
  EditorialWordReveal,
} from "@/components/editorial/EditorialMotion";
import { useDirection } from "@/hooks/useDirection";
import type {
  AwardStat,
  ServiceArtKey,
  ServiceSection,
} from "@/lib/services-catalog";

type ServicesPageViewProps = {
  hero: {
    title: string;
    body: string;
  };
  sections: ServiceSection[];
  shinyThings: {
    eyebrow: string;
    title: string;
    body: string;
  };
  awardColumns: [AwardStat[], AwardStat[]];
};

function JumpAhead({ sections }: { sections: ServiceSection[] }) {
  const t = useTranslations("services");
  return (
    <div className="flex flex-col gap-1 text-[0.84rem] leading-[1.2] text-accent">
      <p className="pe-6 text-secondary/80">{t("jumpAheadLabel")}</p>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="transition-colors hover:text-secondary"
        >
          {section.title}
        </a>
      ))}
      <a href="#shiny-things" className="transition-colors hover:text-secondary">
        {t("shinyThingsLink")}
      </a>
    </div>
  );
}

function ProductsIllustration() {
  return (
    <svg
      viewBox="0 0 260 200"
      className="h-auto w-[13.5rem] text-accent/85 md:w-[15.25rem]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.1"
      aria-hidden="true"
    >
      <circle cx="84" cy="52" r="9" />
      <path d="M73 75c4-11 11-16 21-16 9 0 17 6 19 17" />
      <path d="M65 88l18-16 17 15" />
      <path d="M75 91l-6 32 18 39" />
      <path d="M98 90l3 29 6 44" />
      <path d="M72 168h36" />
      <path d="M57 93l14 36" />
      <path d="M112 93l18 32" />
      <rect x="62" y="98" width="33" height="54" rx="10" />
      <path d="M91 153h28" />
      <path d="M106 153l5 19" />
      <path d="M70 153l-2 19" />
      <circle cx="178" cy="35" r="8" />
      <path d="M168 55c3-10 9-15 18-15 10 0 17 6 20 17" />
      <path d="M164 72l15-13 15 11" />
      <path d="M171 73l-7 33 8 54" />
      <path d="M188 72l5 33-6 54" />
      <path d="M173 159h24" />
      <path d="M157 79l12 25" />
      <path d="M201 77l10 26" />
      <path d="M171 92c18 4 25 13 27 27-16 6-33 6-48 0 0-14 8-23 21-27Z" />
    </svg>
  );
}

function ExperiencesIllustration() {
  return (
    <svg
      viewBox="0 0 320 215"
      className="h-auto w-[16.5rem] text-accent/85 md:w-[19rem]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.1"
      aria-hidden="true"
    >
      <circle cx="49" cy="27" r="9" />
      <path d="M39 48c3-9 8-14 15-14 8 0 13 4 16 13" />
      <path d="M42 61l8 44v65" />
      <path d="M58 61l2 39 5 69" />
      <path d="M42 170h22" />
      <path d="M58 170h16" />
      <path d="M28 62l8 38" />
      <path d="M76 58l10 34" />
      <path d="M36 117l62-16" />
      <path d="M92 100h180c9 0 16 7 16 16v7c0 9-7 16-16 16H90" />
      <path d="M89 116l35-20h128l35 35-42 34H118L89 131Z" />
      <circle cx="255" cy="81" r="5" />
      <path d="M246 94c4-7 9-10 16-10 6 0 10 2 13 8" />
      <path d="M246 108l6 12 14 7" />
      <path d="M264 107l6 14-6 10" />
      <path d="M228 117l13 12" />
      <path d="M206 132l24-12" />
      <path d="M184 141l23-6" />
      <path d="M94 141l28 12" />
    </svg>
  );
}

function BrandingIllustration() {
  return (
    <svg
      viewBox="0 0 255 200"
      className="h-auto w-[13.75rem] text-accent/85 md:w-[15.25rem]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.1"
      aria-hidden="true"
    >
      <circle cx="74" cy="34" r="8" />
      <path d="M62 55c4-10 10-14 19-14 9 0 16 6 18 15" />
      <path d="M59 71l14-16 12 13" />
      <path d="M76 70l-7 30 8 58" />
      <path d="M87 70l8 30-4 58" />
      <path d="M65 128h34" />
      <path d="M51 77l11 30" />
      <path d="M101 76l8 28" />
      <path d="M67 88c16 5 23 11 25 22-15 6-30 6-44 0 1-11 8-18 19-22Z" />
      <circle cx="170" cy="32" r="8" />
      <path d="M159 53c3-9 9-14 18-14 8 0 14 5 17 14" />
      <path d="M156 70l14-16 13 13" />
      <path d="M171 69l-7 30 8 58" />
      <path d="M182 69l7 30-3 58" />
      <path d="M161 127h33" />
      <path d="M148 76l10 27" />
      <path d="M197 73l9 25" />
      <path d="M162 87c16 5 23 11 25 22-15 6-30 6-44 0 1-11 8-18 19-22Z" />
      <path d="M191 47l16 11" />
    </svg>
  );
}

function ConfettiWatchArt() {
  const confetti = [
    "left-[6%] top-[10%] bg-[#ee5b47] rotate-[35deg]",
    "left-[17%] top-[5%] bg-[#5d79d3] rotate-[120deg]",
    "left-[36%] top-[8%] bg-[#f4a0a2] rotate-[80deg]",
    "left-[54%] top-[7%] bg-[#53a1a5] rotate-[35deg]",
    "left-[78%] top-[9%] bg-[#f3c253] rotate-[140deg]",
    "left-[82%] top-[30%] bg-[#ee5b47] rotate-[40deg]",
    "left-[10%] top-[28%] bg-[#f3c253] rotate-[85deg]",
    "left-[25%] top-[22%] bg-[#5d79d3] rotate-[135deg]",
    "left-[63%] top-[20%] bg-[#f4a0a2] rotate-[110deg]",
    "left-[6%] top-[56%] bg-[#53a1a5] rotate-[90deg]",
    "left-[85%] top-[58%] bg-[#5d79d3] rotate-[120deg]",
    "left-[26%] top-[72%] bg-[#ee5b47] rotate-[30deg]",
    "left-[44%] top-[79%] bg-[#f3c253] rotate-[110deg]",
    "left-[68%] top-[74%] bg-[#53a1a5] rotate-[65deg]",
  ];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[hsl(var(--accent))]">
      {confetti.map((className) => (
        <span
          key={className}
          className={`absolute h-4 w-2 rounded-full ${className}`}
        />
      ))}
      <div className="absolute inset-x-[21%] bottom-[13%] top-[26%] rounded-[2.8rem] bg-[#11284b] shadow-[0_25px_45px_rgba(12,27,59,0.42)]" />
      <div className="absolute inset-x-[27%] bottom-[18%] top-[33%] rounded-[2rem] border border-white/8 bg-[#16345f] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" />
      <div className="absolute left-1/2 top-[58%] h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/6 bg-[#1d1d22] shadow-[0_22px_32px_rgba(0,0,0,0.38)]">
        <div className="absolute left-[29%] top-[39%] h-4 w-4 rounded-full border-[5px] border-[#f0a0a5]" />
        <div className="absolute right-[23%] top-[38%] h-4 w-4 rounded-full border-[4px] border-[#53a1a5]" />
        <div className="absolute left-[48%] top-[30%] h-5 w-[6px] -translate-x-1/2 rounded-full bg-[#f27f46]" />
        <div className="absolute left-[61%] top-[31%] h-[6px] w-5 rounded-full bg-[#f27f46]" />
        <div className="absolute left-[42%] top-[56%] h-[6px] w-7 rotate-[70deg] rounded-full bg-[#f3c253]" />
        <div className="absolute left-[49%] top-[56%] h-[6px] w-10 rotate-[-38deg] rounded-full bg-[#5d79d3]" />
      </div>
    </div>
  );
}

function YoutubePlayArt() {
  return (
    <div className="relative h-full w-full bg-secondary">
      <div className="absolute left-1/2 top-1/2 h-[28%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-white shadow-[0_14px_25px_rgba(255,255,255,0.18)]" />
      <div className="absolute left-1/2 top-1/2 h-0 w-0 -translate-x-[18%] -translate-y-1/2 border-b-[1.35rem] border-l-[2rem] border-t-[1.35rem] border-b-transparent border-l-[hsl(var(--secondary))] border-t-transparent" />
    </div>
  );
}

function BearFrameArt() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-white/88">
      <div className="absolute h-[52%] w-[46%] border-[0.9rem] border-secondary/90" />
      <div className="relative h-[44%] w-[34%] overflow-hidden grayscale">
        <Image
          src="/images/project-bearaby.jpg"
          alt=""
          fill
          sizes="(max-width: 1024px) 40vw, 18vw"
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}

function VrFansArt() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_50%_25%,rgba(68,96,168,0.35),rgba(8,18,54,0)_32%),linear-gradient(180deg,#08153f_0%,#07143a_100%)]">
      <div className="absolute left-1/2 top-[48%] h-[34%] w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(112,150,255,0.9),rgba(56,84,146,0.7)_42%,rgba(18,31,76,0.95)_72%)] shadow-[0_0_60px_rgba(55,94,196,0.35)]" />
      <div className="absolute left-1/2 top-[63%] h-[18%] w-[20%] -translate-x-1/2 -translate-y-1/2 rounded-[1.25rem] bg-[linear-gradient(180deg,#1a295d_0%,#111f50_100%)] shadow-[0_18px_28px_rgba(0,0,0,0.26)]" />
      <div className="absolute inset-x-[18%] top-[44%] h-[0.42rem] rounded-full bg-white/90" />
      <div className="absolute inset-x-[16%] top-[49%] h-[0.25rem] rounded-full bg-[#f27f46]" />
      <p className="absolute inset-x-0 top-[41%] text-center text-[2.35rem] font-semibold uppercase tracking-[-0.06em] text-white/95">
        We The Fans
      </p>
    </div>
  );
}

function SplitRingsArt() {
  return (
    <div className="relative h-full w-full bg-[hsl(var(--accent))]">
      <div className="absolute left-1/2 top-1/2 h-[54%] w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.05rem] border-white/90" />
      <div className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1rem] border-white/90" />
      <div className="absolute bottom-[23%] left-1/2 top-[23%] w-[8%] -translate-x-1/2 bg-[hsl(var(--accent))]" />
    </div>
  );
}

function ResidentaPackArt() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f7f7f7_0%,#ececec_100%)]">
      <div className="absolute bottom-[15%] left-[20%] h-[10%] w-[60%] rounded-full bg-black/8 blur-2xl" />
      <div className="absolute left-[20%] top-[30%] h-[40%] w-[44%] rounded-[0.25rem] border border-black/6 bg-white shadow-[0_25px_35px_rgba(0,0,0,0.08)]" />
      <div className="absolute left-[24%] top-[40%] h-[12%] w-[31%] bg-[#f24a42]" />
      <div className="absolute left-[29%] top-[47%] h-[27%] w-[17%] rounded-full bg-[radial-gradient(circle_at_55%_35%,rgba(255,255,255,0.35),rgba(0,0,0,0.08)_18%,rgba(0,0,0,0.85)_62%)]" />
      <div className="absolute left-[57%] top-[31%] h-[38%] w-[12%] skew-y-[-8deg] rounded-r-[0.35rem] border border-black/6 bg-white shadow-[0_18px_28px_rgba(0,0,0,0.06)]" />
      <div className="absolute left-[66%] top-[43%] h-[10%] w-[17%] rounded-[999px] bg-[#f24a42]" />
      <div className="absolute left-[58%] top-[33%] h-[8%] w-[11%] bg-[#f4f4f4]" />
      <div className="absolute left-[31%] top-[23%] text-[0.7rem] font-semibold tracking-tight text-black/85">
        Residenta
      </div>
      <div className="absolute left-[18%] top-[46%] text-[4.8rem] font-black leading-none text-black">
        [
      </div>
      <div className="absolute left-[47%] top-[46%] text-[4.8rem] font-black leading-none text-black">
        ]
      </div>
    </div>
  );
}

function ServiceCardArt({ art }: { art: ServiceArtKey }) {
  switch (art) {
    case "confetti-watch":
      return <ConfettiWatchArt />;
    case "youtube-play":
      return <YoutubePlayArt />;
    case "bear-frame":
      return <BearFrameArt />;
    case "vr-fans":
      return <VrFansArt />;
    case "split-rings":
      return <SplitRingsArt />;
    case "residenta-pack":
      return <ResidentaPackArt />;
    default:
      return null;
  }
}

function ServicesIllustration({
  illustration,
}: {
  illustration: ServiceSection["illustration"];
}) {
  if (illustration === "products") {
    return <ProductsIllustration />;
  }

  if (illustration === "experiences") {
    return <ExperiencesIllustration />;
  }

  return <BrandingIllustration />;
}

function ServiceShowcaseCard({
  art,
  subtitle,
  title,
}: ServiceSection["cards"][number]) {
  return (
    <article className="group space-y-3">
      <LiquidCard
        aspectRatio="aspect-[0.88]"
        className="border border-white/70 bg-white/80 shadow-[var(--shadow-soft)]"
      >
        <div className="absolute inset-0 bg-white/24" />
        <div className="absolute inset-0 overflow-hidden">
          <ServiceCardArt art={art} />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.08)_100%)]" />
      </LiquidCard>
      <div className="space-y-1">
        <p className="text-[0.73rem] leading-none text-secondary/75">{subtitle}</p>
        <h3 className="max-w-[17ch] font-serif text-[2rem] leading-[0.95] tracking-[-0.04em] text-accent transition-opacity duration-300 group-hover:opacity-70">
          {title}
        </h3>
      </div>
    </article>
  );
}

function ServicesHero({
  body,
  sections,
  title,
}: {
  body: string;
  sections: ServiceSection[];
  title: string;
}) {
  const dir = useDirection();
  return (
    <section className="border-b border-border/55">
      <div className="mx-auto max-w-[1450px] px-6 pb-20 pt-[8.6rem] md:px-10 md:pb-28 md:pt-40 lg:px-16 lg:pt-[10.5rem]">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_13rem_15rem] lg:gap-x-12">
          <div className="hidden lg:block" />
          <EditorialReveal delay={0.08} x={24 * dir} y={0}>
            <JumpAhead sections={sections} />
          </EditorialReveal>
          <div />
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(24rem,0.95fr)] lg:items-end lg:gap-x-16">
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

export function ServicesSection({ section }: { section: ServiceSection }) {
  const dir = useDirection();
  return (
    <section
      id={section.id}
      className="scroll-mt-20 border-b border-border/20 py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-[1450px] gap-y-10 px-6 md:px-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-16 lg:px-16">
        <EditorialReveal
          className="flex items-start justify-center pt-3 lg:justify-start"
          x={-36 * dir}
          y={12}
        >
          <ServicesIllustration illustration={section.illustration} />
        </EditorialReveal>

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
            {section.cards.map((card, index) => (
              <EditorialReveal
                key={card.title}
                delay={0.2 + index * 0.08}
                y={28}
              >
                <ServiceShowcaseCard {...card} />
              </EditorialReveal>
            ))}
          </div>
        </EditorialReveal>
      </div>
    </section>
  );
}

function AwardColumn({ awards }: { awards: AwardStat[] }) {
  return (
    <div className="space-y-10">
      {awards.map((award, index) => (
        <EditorialReveal
          key={`${award.label}-${award.value}`}
          delay={0.12 + index * 0.08}
          y={24}
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 border-t border-border/60 pt-4">
            <p className="whitespace-pre-line font-serif text-[1.65rem] leading-[1.05] tracking-[-0.03em] text-accent md:text-[1.95rem]">
              {award.label}
            </p>
            <p className="font-serif text-[4.2rem] leading-none tracking-[-0.07em] text-accent md:text-[5rem]">
              {award.value}
            </p>
          </div>
        </EditorialReveal>
      ))}
    </div>
  );
}

function ShinyThingsSection({
  awardColumns,
  shinyThings,
}: {
  awardColumns: [AwardStat[], AwardStat[]];
  shinyThings: ServicesPageViewProps["shinyThings"];
}) {
  const dir = useDirection();
  return (
    <section id="shiny-things" className="scroll-mt-20 py-18 md:py-24">
      <div className="mx-auto max-w-[1450px] px-6 md:px-10 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-16 lg:px-16">
        <div />
        <EditorialReveal className="space-y-10" x={22 * dir} y={20}>
          <div className="space-y-5">
            <EditorialReveal delay={0.04} y={18}>
              <p className="text-[0.78rem] leading-none text-secondary/75">
                {shinyThings.eyebrow}
              </p>
            </EditorialReveal>
            <EditorialWordReveal
              as="h2"
              text={shinyThings.title}
              className="font-serif text-[clamp(4rem,7vw,6rem)] leading-[0.9] tracking-[-0.07em] text-accent"
              delayChildren={0.05}
            />
            <EditorialReveal delay={0.12} y={22}>
              <p className="max-w-[52rem] text-[1.05rem] leading-[1.72] text-muted-foreground md:text-[1.1rem]">
                {shinyThings.body}
              </p>
            </EditorialReveal>
          </div>

          <div className="grid gap-16 pt-6 md:grid-cols-2 md:gap-x-16">
            <EditorialReveal delay={0.18} y={24}>
              <AwardColumn awards={awardColumns[0]} />
            </EditorialReveal>
            <EditorialReveal delay={0.24} y={24}>
              <AwardColumn awards={awardColumns[1]} />
            </EditorialReveal>
          </div>
        </EditorialReveal>
      </div>
    </section>
  );
}

export default function ServicesPageView({
  awardColumns,
  hero,
  sections,
  shinyThings,
}: ServicesPageViewProps) {
  return (
    <div className="relative overflow-hidden text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.68)_0%,hsl(var(--background)/0.8)_22%,hsl(var(--background)/0.92)_48%,hsl(var(--background)/0.96)_100%)] backdrop-blur-[2px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,hsl(var(--secondary)/0.18),transparent_38%),radial-gradient(circle_at_top_right,hsl(var(--primary)/0.14),transparent_42%)]"
      />
      <div className="relative">
        <ServicesHero body={hero.body} sections={sections} title={hero.title} />
        {sections.map((section) => (
          <ServicesSection key={section.id} section={section} />
        ))}
        <ShinyThingsSection awardColumns={awardColumns} shinyThings={shinyThings} />
      </div>
    </div>
  );
}
