import LiquidCard from "@/components/LiquidCard";
import AboutCodeOfHonor from "@/components/about/AboutCodeOfHonor";
import {
  EditorialReveal,
  EditorialWordReveal,
} from "@/components/editorial/EditorialMotion";
import CreativeHero from "@/components/sections/CreativeHero";
import type { HeroConfig } from "@/lib/hero-types";
export type AboutJumpLink = {
  label: string;
  href: string;
};

export type CodeOfHonorItem = {
  id: string;
  index: string;
  title: string;
  body: string;
  art:
  | "be-nice"
  | "powers-for-good"
  | "try-the-truth"
  | "enjoy-the-ride"
  | "speak-up-and-listen"
  | "solve-the-problem"
  | "help-each-other"
  | "team-up";
};

export type Mondayteer = {
  name: string;
  city: string;
  role: string;
  art: string;
  accentLabel: string;
};

export type AboutLocation = {
  city: string;
  address: string[];
  email: string;
  href: string;
};

type AboutPageViewProps = {
  hero: HeroConfig;
  jumpLinks: AboutJumpLink[];
  locations: AboutLocation[];
  codeOfHonor: {
    eyebrow: string;
    title: string;
    body: string;
  };
  codeOfHonorItems: CodeOfHonorItem[];
  mondayteers: {
    eyebrow: string;
    title: string;
    body: string;
  };
  team: Mondayteer[];
};

function JumpAhead({ links }: { links: AboutJumpLink[] }) {
  return (
    <div className="flex flex-col gap-1 text-[0.84rem] leading-[1.2] text-accent">
      <p className="pr-6 text-secondary/80">Jump ahead:</p>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="transition-colors hover:text-secondary"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

function ContactIllustration() {
  return (
    <svg
      viewBox="0 0 320 380"
      className="h-auto w-[15rem] text-accent/88 md:w-[17.5rem]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.35"
      aria-hidden="true"
    >
      <circle cx="116" cy="78" r="18" />
      <path d="M93 112c7-17 18-24 33-24 15 0 26 8 31 24" />
      <path d="M100 132l11 58-8 92" />
      <path d="M132 132l7 61 5 88" />
      <path d="M93 321h33" />
      <path d="M126 321h30" />
      <path d="M74 141l15 50-7 80" />
      <path d="M152 140l18 47-6 84" />
      <path d="M173 168c9-25 20-36 43-36 18 0 34 9 44 27" />
      <path d="M186 176l16 96" />
      <path d="M222 160l7 110" />
      <path d="M199 270h42" />
      <path d="M186 197c22 7 38 17 51 31-18 11-41 16-64 14 1-23 5-34 13-45Z" />
      <circle cx="220" cy="104" r="13" />
      <path d="M210 88c1-10 6-17 12-22" />
      <path d="M174 281c-8-12-18-18-30-18-23 0-41 21-41 45 0 10 3 20 8 28" />
      <path d="M124 308c8-6 18-9 29-9 16 0 31 6 41 18" />
      <path d="M91 332c11 7 23 10 36 10 18 0 36-7 49-20" />
      <path d="M56 337c8 12 23 19 37 19 12 0 21-4 31-12" />
    </svg>
  );
}

function LocationBlock({ location }: { location: AboutLocation }) {
  return (
    <EditorialReveal className="space-y-4 border-t border-border/65 pt-5" y={20}>
      <div className="space-y-2">
        <a
          href={location.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-serif text-[clamp(3rem,5vw,4.5rem)] leading-[0.92] tracking-[-0.06em] text-accent transition-colors hover:text-secondary"
        >
          {location.city}
        </a>
        <div className="space-y-1 text-[0.98rem] leading-[1.55] text-muted-foreground">
          {location.address.map((line) => (
            <p key={`${location.city}-${line}`}>{line}</p>
          ))}
        </div>
      </div>

      <a
        href={`mailto:${location.email}`}
        className="inline-block text-[0.95rem] font-medium text-accent underline decoration-secondary/65 underline-offset-[4px] transition-colors hover:text-secondary"
      >
        {location.email}
      </a>
    </EditorialReveal>
  );
}

function MondayteerArt({ art, accentLabel }: Pick<Mondayteer, "art" | "accentLabel">) {
  if (art === "halo") {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(145deg,hsl(var(--background))_0%,white_55%,hsl(var(--secondary)/0.28)_100%)]">
        <div className="absolute inset-x-[22%] top-[16%] h-[44%] rounded-[2.5rem] border border-accent/15 bg-white/75" />
        <div className="absolute left-1/2 top-[48%] h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,rgba(255,255,255,0.88)_24%,rgba(228,236,248,0.65)_48%,rgba(27,53,104,0.92)_100%)]" />
        <div className="absolute left-1/2 top-[23%] h-[24%] w-[24%] -translate-x-1/2 rounded-full border border-secondary/50" />
        <p className="absolute bottom-6 left-6 text-[0.8rem] uppercase tracking-[0.18em] text-accent/70">
          {accentLabel}
        </p>
      </div>
    );
  }

  if (art === "ribbons") {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(160deg,hsl(var(--accent))_0%,hsl(var(--accent)/0.92)_56%,hsl(var(--secondary)/0.62)_100%)]">
        <div className="absolute inset-x-[17%] top-[18%] h-[56%] rounded-[2.7rem] bg-white/12" />
        <div className="absolute left-[22%] top-[12%] h-[72%] w-[18%] rounded-full bg-white/18 blur-[2px]" />
        <div className="absolute left-[44%] top-[8%] h-[80%] w-[14%] rounded-full bg-secondary/45" />
        <div className="absolute right-[18%] top-[16%] h-[68%] w-[16%] rounded-full bg-white/20" />
        <p className="absolute bottom-6 left-6 text-[0.8rem] uppercase tracking-[0.18em] text-white/74">
          {accentLabel}
        </p>
      </div>
    );
  }

  if (art === "signals") {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(180deg,#fff8f4_0%,#f5f0eb_44%,rgba(221,235,255,0.8)_100%)]">
        <div className="absolute inset-x-[18%] top-[18%] h-[58%] rounded-[2.2rem] border border-accent/10 bg-white/88" />
        <div className="absolute left-[28%] top-[28%] h-[18%] w-[44%] rounded-full border-[10px] border-accent/85" />
        <div className="absolute left-[36%] top-[44%] h-[14%] w-[28%] rounded-full border-[8px] border-secondary/90" />
        <div className="absolute left-1/2 top-[62%] h-[14%] w-[10px] -translate-x-1/2 rounded-full bg-accent/85" />
        <p className="absolute bottom-6 left-6 text-[0.8rem] uppercase tracking-[0.18em] text-accent/70">
          {accentLabel}
        </p>
      </div>
    );
  }

  if (art === "orbit") {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.85),rgba(255,255,255,0.18)_32%,rgba(18,42,84,0.96)_74%)]">
        <div className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/90" />
        <div className="absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50" />
        <div className="absolute left-1/2 top-1/2 h-[74%] w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/22" />
        <div className="absolute left-[24%] top-[34%] h-5 w-5 rounded-full bg-white/84" />
        <div className="absolute right-[22%] top-[58%] h-4 w-4 rounded-full bg-white/72" />
        <p className="absolute bottom-6 left-6 text-[0.8rem] uppercase tracking-[0.18em] text-white/74">
          {accentLabel}
        </p>
      </div>
    );
  }

  if (art === "grid") {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(145deg,hsl(var(--background))_0%,#f9fbff_48%,rgba(255,190,143,0.55)_100%)]">
        <div className="absolute inset-[14%] rounded-[2.4rem] border border-accent/12 bg-white/72" />
        <div className="absolute inset-[18%] grid grid-cols-4 gap-3">
          {Array.from({ length: 16 }).map((_, index) => (
            <div
              key={index}
              className={index % 5 === 0 ? "rounded-xl bg-secondary/80" : "rounded-xl bg-accent/10"}
            />
          ))}
        </div>
        <p className="absolute bottom-6 left-6 text-[0.8rem] uppercase tracking-[0.18em] text-accent/70">
          {accentLabel}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(155deg,hsl(var(--accent))_0%,rgba(26,56,108,0.94)_54%,rgba(243,160,108,0.7)_100%)]">
      <div className="absolute left-1/2 top-[18%] h-[56%] w-[56%] -translate-x-1/2 rounded-full border border-white/22" />
      <div className="absolute left-1/2 top-[26%] h-[40%] w-[40%] -translate-x-1/2 rounded-full bg-white/12" />
      <div className="absolute left-1/2 top-[42%] h-[26%] w-[10px] -translate-x-1/2 rounded-full bg-white/90" />
      <div className="absolute left-1/2 top-[36%] h-[8px] w-[32%] -translate-x-1/2 rounded-full bg-secondary" />
      <p className="absolute bottom-6 left-6 text-[0.8rem] uppercase tracking-[0.18em] text-white/74">
        {accentLabel}
      </p>
    </div>
  );
}

function MondayteerCard({ member }: { member: Mondayteer }) {
  return (
    <article className="group space-y-4">
      <LiquidCard
        aspectRatio="aspect-[0.92]"
        className="border border-white/70 bg-white/84 shadow-[var(--shadow-soft)]"
      >
        <div className="absolute inset-0 bg-white/16" />
        <div className="absolute inset-0 overflow-hidden">
          <MondayteerArt art={member.art} accentLabel={member.accentLabel} />
        </div>
      </LiquidCard>

      <div className="space-y-1">
        <h3 className="font-serif text-[2rem] leading-[0.95] tracking-[-0.045em] text-accent transition-opacity duration-300 group-hover:opacity-70">
          {member.name}
        </h3>
        <p className="text-[0.92rem] text-secondary/85">{member.city}</p>
        <p className="text-[0.85rem] text-muted-foreground">{member.role}</p>
      </div>
    </article>
  );
}

function AboutHero({
  body,
  jumpLinks,
  title,
}: {
  body: string;
  jumpLinks: AboutJumpLink[];
  title: string;
}) {
  return (
    <section className="relative border-b border-border/55">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--secondary)/0.18),transparent_38%),radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_42%),radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.78),transparent_50%)]"
      />
      <div className="relative mx-auto max-w-[1450px] px-5 pb-16 pt-[7.5rem] sm:px-6 md:px-10 md:pb-24 md:pt-30 lg:px-16 lg:pb-28 lg:pt-42 ">
        <div className="hidden gap-16 lg:grid lg:grid-cols-[minmax(0,1fr)_13rem_15rem] lg:gap-x-12">
          <div className="hidden lg:block" />
          {jumpLinks.length > 0 && <EditorialReveal delay={0.08} x={24} y={0}>
            <JumpAhead links={jumpLinks} />
          </EditorialReveal>}
          <div />
        </div>

        <div className="mt-10 grid gap-6 md:mt-14 md:gap-8 lg:mt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)] lg:items-start lg:gap-x-16">
          <EditorialWordReveal
            as="h1"
            text={title}
            className="font-serif text-[clamp(2.8rem,13vw,8.4rem)] leading-[0.9] tracking-[-0.07em] text-accent"
          />
          <EditorialReveal delay={0.16} x={30} y={18}>
            <p className="max-w-[38rem] pb-1 text-[clamp(1.05rem,4.8vw,2.15rem)] leading-[1.28] tracking-[-0.02em] text-foreground/80 md:pb-2">
              {body}
            </p>
          </EditorialReveal>
        </div>
      </div>
    </section>
  );
}

function ContactSection({ locations }: { locations: AboutLocation[] }) {
  return (
    <section
      id="contact"
      className="scroll-mt-20 border-b border-border/20 py-14 md:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1450px] gap-y-12 px-6 md:px-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-16 lg:px-16">
        <EditorialReveal
          className="flex items-start justify-center pt-2 lg:justify-start"
          x={-36}
          y={12}
        >
          <ContactIllustration />
        </EditorialReveal>

        <div className="space-y-10">
          {locations.map((location) => (
            <LocationBlock key={location.city} location={location} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeOfHonorSection({
  intro,
  items,
}: {
  intro: AboutPageViewProps["codeOfHonor"];
  items: CodeOfHonorItem[];
}) {
  return (
    <section
      id="code-of-honor"
      className="scroll-mt-20 border-b border-border/20 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1450px] px-6 md:px-10 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-16 lg:px-16">
        <div />

        <div className="space-y-10">
          <div className="space-y-5">
            <EditorialReveal delay={0.04} y={18}>
              <p className="text-[0.78rem] leading-none text-secondary/75">
                {intro.eyebrow}
              </p>
            </EditorialReveal>
            <EditorialWordReveal
              as="h2"
              text={intro.title}
              className="font-serif text-[clamp(2.3rem,10vw,6.25rem)] leading-[0.92] tracking-[-0.06em] text-accent"
              delayChildren={0.05}
            />
            <EditorialReveal delay={0.12} y={22}>
              <p className="max-w-[54rem] text-[0.98rem] leading-[1.68] text-muted-foreground md:text-[1.08rem] md:leading-[1.72]">
                {intro.body}
              </p>
            </EditorialReveal>
          </div>

          <EditorialReveal delay={0.16} y={24}>
            <AboutCodeOfHonor items={items} />
          </EditorialReveal>
        </div>
      </div>
    </section>
  );
}

function MondayteersSection({
  intro,
  team,
}: {
  intro: AboutPageViewProps["mondayteers"];
  team: Mondayteer[];
}) {
  return (
    <section id="mondayteers" className="scroll-mt-20 py-14 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1450px] px-6 md:px-10 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-16 lg:px-16">
        <div />

        <div className="space-y-10">
          <div className="space-y-5">
            <EditorialReveal delay={0.04} y={18}>
              <p className="text-[0.78rem] leading-none text-secondary/75">
                {intro.eyebrow}
              </p>
            </EditorialReveal>
            <EditorialWordReveal
              as="h2"
              text={intro.title}
              className="font-serif text-[clamp(2.3rem,10vw,6.25rem)] leading-[0.92] tracking-[-0.06em] text-accent"
              delayChildren={0.05}
            />
            <EditorialReveal delay={0.12} y={22}>
              <p className="max-w-[52rem] text-[0.98rem] leading-[1.68] text-muted-foreground md:text-[1.08rem] md:leading-[1.72]">
                {intro.body}
              </p>
            </EditorialReveal>
          </div>

          <div className="grid gap-10 pt-1 md:grid-cols-2 xl:grid-cols-3">
            {team.map((member, index) => (
              <EditorialReveal
                key={member.name}
                delay={0.18 + index * 0.05}
                y={26}
              >
                <MondayteerCard member={member} />
              </EditorialReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutPageView({
  codeOfHonor,
  codeOfHonorItems,
  hero,
  jumpLinks,
  locations,
  mondayteers,
  team,
}: AboutPageViewProps) {
  return (
    <div className="relative overflow-x-clip overflow-y-visible text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.72)_0%,hsl(var(--background)/0.84)_22%,hsl(var(--background)/0.94)_54%,hsl(var(--background)/0.98)_100%)] backdrop-blur-[2px]"
      />

      <div className="relative">
        {hero.isVisible ? (
          hero.variant === "creative" && hero.creative ? (
            <>
              <CreativeHero id="about" config={hero.creative} />
              {jumpLinks.length > 0 ? (
                <div className="border-b border-border/20">
                  <div className="mx-auto max-w-[1450px] px-5 py-8 sm:px-6 md:px-10 lg:px-16">
                    <JumpAhead links={jumpLinks} />
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <AboutHero
              body={hero.current?.body ?? ""}
              jumpLinks={jumpLinks}
              title={hero.current?.title ?? ""}
            />
          )
        ) : null}
        {/* <ContactSection locations={locations} /> */}
        <CodeOfHonorSection intro={codeOfHonor} items={codeOfHonorItems} />
        <MondayteersSection intro={mondayteers} team={team} />
      </div>
    </div>
  );
}
