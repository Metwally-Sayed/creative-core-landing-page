"use client";

import Link from "next/link";
import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

export default function ProductSection() {
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
      className="relative overflow-hidden px-5 py-24 lg:px-20"
      id="product"
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

          <div className="relative h-[70vh] overflow-hidden md:h-[80vh]">
            <motion.div
              style={{ y, scale }}
              className="absolute inset-0"
            >
              <img
                src="/images/project-gemini-dev.jpg"
                alt="Product team working"
                className="h-full w-full object-cover opacity-60 mix-blend-screen"
              />
            </motion.div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,48,81,0.08)_0%,rgba(24,48,81,0.7)_58%,rgba(24,48,81,0.94)_100%)]" />
          </div>

          <div className="relative px-6 pb-20 md:px-10 lg:px-16 lg:pb-32">
            <div className="-mt-48 mx-auto max-w-[1000px] rounded-[2.5rem] border border-white/12 bg-white/5 p-8 text-center backdrop-blur-2xl md:p-16">
              <p className="eyebrow mb-6 text-secondary/80">Product Acceleration</p>
              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-10 font-serif text-5xl leading-[1.1] text-white md:text-6xl lg:text-7xl"
              >
                A booster rocket for digital product teams
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mx-auto mb-16 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl"
              >
                We collaborate with startups and product departments around the world
                to invent and reinvent the products of tomorrow.
              </motion.p>

              {/* Impact Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 border-t border-white/10 pt-16">
                {[
                  { label: "Global Reach", val: "120M+", sub: "Users affected by our work" },
                  { label: "Proven Impact", val: "23+", sub: "Dynamic case studies" },
                  { label: "Client Success", val: "94%", sub: "Repeat business rate" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
                  >
                    <p className="text-4xl md:text-5xl font-serif text-white mb-2">{stat.val}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-secondary/80 mb-1">{stat.label}</p>
                    <p className="text-sm text-white/50">{stat.sub}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <Link
                  href="/product"
                  className="btn-primary"
                >
                  Discover our methodology
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
