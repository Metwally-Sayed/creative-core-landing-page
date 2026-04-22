"use client";

import { EditorialReveal, EditorialWordReveal } from "@/components/editorial/EditorialMotion";
import { useDirection } from "@/hooks/useDirection";

export type CredentialStat = { label: string; value: string };

export default function ServicesCredentialsSection({
  eyebrow,
  title,
  body,
  stats,
}: {
  eyebrow: string;
  title: string;
  body: string;
  stats: CredentialStat[];
}) {
  const dir = useDirection();
  // Split stats into 2 columns
  const mid = Math.ceil(stats.length / 2);
  const col1 = stats.slice(0, mid);
  const col2 = stats.slice(mid);

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-[1450px] px-6 md:px-10 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-16 lg:px-16">
        <div />
        <EditorialReveal className="space-y-10" x={22 * dir} y={20}>
          <div className="space-y-5">
            <EditorialReveal delay={0.04} y={18}>
              <p className="text-[0.78rem] leading-none text-secondary/75">{eyebrow}</p>
            </EditorialReveal>
            <EditorialWordReveal
              as="h2"
              text={title}
              className="font-serif text-[clamp(4rem,7vw,6rem)] leading-[0.9] tracking-[-0.07em] text-accent"
              delayChildren={0.05}
            />
            <EditorialReveal delay={0.12} y={22}>
              <p className="max-w-[52rem] text-[1.05rem] leading-[1.72] text-muted-foreground md:text-[1.1rem]">
                {body}
              </p>
            </EditorialReveal>
          </div>

          <div className="grid gap-16 pt-6 md:grid-cols-2 md:gap-x-16">
            {[col1, col2].map((col, ci) => (
              <EditorialReveal key={ci} delay={0.18 + ci * 0.06} y={24}>
                <div className="space-y-10">
                  {col.map((stat, si) => (
                    <EditorialReveal key={stat.label} delay={0.12 + si * 0.08} y={24}>
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
