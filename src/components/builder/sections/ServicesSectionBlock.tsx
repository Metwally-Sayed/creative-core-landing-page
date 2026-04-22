"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import LiquidCard from "@/components/LiquidCard";
import { EditorialReveal, EditorialWordReveal } from "@/components/editorial/EditorialMotion";
import { useDirection } from "@/hooks/useDirection";

export type ServiceCard = {
  title: string;
  subtitle: string;
  image_url: string;
  slug: string;
};

export default function ServicesSectionBlock({
  sectionId,
  index,
  eyebrow,
  title,
  body,
  link_label,
  cards,
}: {
  sectionId?: string;
  index: number;
  eyebrow: string;
  title: string;
  body: string;
  link_label: string;
  cards: ServiceCard[];
}) {
  const dir = useDirection();
  const num = String(index + 1).padStart(2, "0");

  return (
    <section
      id={sectionId}
      className="scroll-mt-20 border-b border-border/20 py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-[1450px] gap-y-10 px-6 md:px-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-16 lg:px-16">
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

        <EditorialReveal className="space-y-8" x={34 * dir} y={18} delay={0.06}>
          <div className="space-y-5">
            <EditorialReveal delay={0.04} y={18}>
              <p className="text-[0.78rem] leading-none text-secondary/75">{eyebrow}</p>
            </EditorialReveal>
            <EditorialWordReveal
              as="h2"
              text={title}
              className="font-serif text-[clamp(4.1rem,7vw,6.25rem)] leading-[0.9] tracking-[-0.07em] text-accent"
              delayChildren={0.06}
            />
            <EditorialReveal delay={0.12} y={22}>
              <p className="max-w-[54rem] text-[1.05rem] leading-[1.72] text-muted-foreground md:text-[1.1rem]">
                {body}
              </p>
            </EditorialReveal>
          </div>

          <EditorialReveal delay={0.18} y={18}>
            <Link
              href="/work"
              className="inline-block text-[0.82rem] font-medium text-accent underline decoration-secondary/70 underline-offset-[3px] transition-colors hover:text-secondary"
            >
              {link_label}
            </Link>
          </EditorialReveal>

          <div className="grid gap-10 pt-1 md:grid-cols-2">
            {cards.map((card, i) => (
              <EditorialReveal key={card.slug || i} delay={0.2 + i * 0.08} y={28}>
                <article className="group space-y-3">
                  <Link href={`/projects/${card.slug}`} className="block">
                    <LiquidCard
                      aspectRatio="aspect-[0.88]"
                      className="border border-white/70 bg-white/80 shadow-[var(--shadow-soft)]"
                    >
                      <div className="absolute inset-0 overflow-hidden">
                        {card.image_url && (
                          <Image
                            src={card.image_url}
                            alt={card.title}
                            fill
                            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(22,49,82,0.22)_100%)]" />
                      </div>
                    </LiquidCard>
                    <div className="space-y-1">
                      <p className="text-[0.73rem] leading-none text-secondary/75">{card.subtitle}</p>
                      <h3 className="max-w-[17ch] font-serif text-[2rem] leading-[0.95] tracking-[-0.04em] text-accent transition-opacity duration-300 group-hover:opacity-70">
                        {card.title}
                      </h3>
                    </div>
                  </Link>
                </article>
              </EditorialReveal>
            ))}
          </div>
        </EditorialReveal>
      </div>
    </section>
  );
}
