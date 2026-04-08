"use client";

import Link from "next/link";
import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

type ProductStat = {
  label: string;
  value: string;
  supportingText?: string;
};

interface ProductSectionProps {
  id?: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  backgroundMediaType?: "image" | "video";
  backgroundImage?: string;
  backgroundVideo?: string;
  stats?: ProductStat[];
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

const defaultStats: ProductStat[] = [
  { label: "Global Reach", value: "120M+", supportingText: "Users affected by our work" },
  { label: "Proven Impact", value: "23+", supportingText: "Dynamic case studies" },
  { label: "Client Success", value: "94%", supportingText: "Repeat business rate" },
];

export default function ProductSection({
  id = "product",
  eyebrow = "Product Acceleration",
  heading = "A booster rocket for digital product teams",
  body = "We collaborate with startups and product departments around the world to invent and reinvent the products of tomorrow.",
  backgroundMediaType = "image",
  backgroundImage = "/images/project-gemini-dev.jpg",
  backgroundVideo,
  stats = defaultStats,
  primaryCtaLabel = "Discover our methodology",
  primaryCtaHref = "/product",
  secondaryCtaLabel,
  secondaryCtaHref = "#",
}: ProductSectionProps) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-x-clip overflow-y-visible px-5 py-16 md:py-20 lg:px-20 lg:py-24"
      id={id}
    >
      <div className="site-shell relative max-w-[1400px] px-0">
        <div className="site-card-navy relative overflow-hidden p-0 rounded-[3rem]">
          {/* Curtain Reveal */}
          <motion.div
            initial={{ y: 0 }}
            whileInView={{ y: "-100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-20 bg-accent"
          />

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,181,123,0.22)_0%,rgba(255,181,123,0)_32%),radial-gradient(circle_at_78%_78%,rgba(157,172,255,0.18)_0%,rgba(157,172,255,0)_32%)]" />

          <div className="relative h-[52vh] min-h-[300px] overflow-hidden md:h-[64vh] md:min-h-[420px] lg:h-[80vh]">
            <motion.div
              style={{ y, scale }}
              className="absolute inset-0"
            >
              {backgroundMediaType === "video" && backgroundVideo ? (
                <video
                  src={backgroundVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover opacity-60 mix-blend-screen"
                />
              ) : (
                <img
                  src={backgroundImage}
                  alt={heading}
                  className="h-full w-full object-cover opacity-60 mix-blend-screen"
                />
              )}
            </motion.div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,48,81,0.08)_0%,rgba(24,48,81,0.7)_58%,rgba(24,48,81,0.94)_100%)]" />
          </div>

          <div className="relative px-5 pb-14 md:px-8 md:pb-20 lg:px-16 lg:pb-32">
            <div className="-mt-24 mx-auto max-w-[1000px] rounded-[2.5rem] border border-white/12 bg-white/5 p-6 text-center backdrop-blur-2xl md:-mt-40 md:p-10 lg:-mt-48 lg:p-16">
              <p className="eyebrow mb-6 text-secondary/80">{eyebrow}</p>
              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8 font-serif text-[clamp(2.4rem,10vw,4.5rem)] leading-[1.02] text-white lg:mb-10"
              >
                {heading}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mx-auto mb-10 max-w-2xl text-[1rem] leading-relaxed text-white/70 md:mb-14 md:text-[1.1rem] lg:mb-16 lg:text-xl"
              >
                {body}
              </motion.p>

              {/* Impact Stats Grid */}
              <div className="mb-10 grid grid-cols-1 gap-8 border-t border-white/10 pt-10 md:mb-14 md:grid-cols-3 md:gap-12 md:pt-14 lg:mb-16 lg:pt-16">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
                  >
                    <p className="mb-2 font-serif text-3xl text-white md:text-5xl">{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-secondary/80 mb-1">{stat.label}</p>
                    {stat.supportingText ? (
                      <p className="text-sm text-white/50">{stat.supportingText}</p>
                    ) : null}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3"
              >
                <Link href={primaryCtaHref} className="btn-primary">
                  {primaryCtaLabel}
                </Link>
                {secondaryCtaLabel ? (
                  <Link href={secondaryCtaHref} className="btn-secondary">
                    {secondaryCtaLabel}
                  </Link>
                ) : null}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
