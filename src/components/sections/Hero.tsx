"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const transitionEase = [0.22, 1, 0.36, 1] as const;
const scenes = ["Products", "Branding", "Products", "Branding", "Experiences", "Branding"] as const;

export default function Hero() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });

  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.38], [1, 0]);

  const eyebrowText = "We make digital (and magical)...";
  const sceneTitle = scenes[sceneIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSceneIndex((current) => (current + 1) % scenes.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-[118vh] overflow-hidden bg-white px-5 pt-24 lg:px-20"
    >
      <div className="absolute inset-0 bg-white" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34vh] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.96)_42%,rgba(255,255,255,0.9)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[32vh] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.7)_42%,rgba(255,255,255,0.94)_72%,#ffffff_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-3rem] h-24 bg-white blur-2xl" />

      <div className="sticky top-0 h-screen min-h-[560px] sm:min-h-[660px] lg:min-h-[760px]">
        <div className="relative z-10 h-full">
          <motion.div
            style={{ y: mediaY }}
            className="pointer-events-none absolute left-1/2 top-[13vh] w-[86vw] max-w-[760px] -translate-x-1/2 sm:w-[82vw] sm:max-w-[820px] lg:top-[11vh] lg:w-[64vw] lg:max-w-[920px]"
          >
            <div className="relative isolate overflow-hidden bg-white">
              <motion.div
                style={{ scale: mediaScale }}
                className="relative origin-center will-change-transform"
              >
                <video
                  src="/hm-hero-desktop.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="block h-auto w-full origin-center [filter:contrast(1.04)_brightness(1.02)]"
                />
                <div className="absolute inset-0 z-10 bg-[hsl(var(--accent))] mix-blend-screen" />
                <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0)_0%,rgba(255,255,255,0.08)_45%,rgba(255,255,255,0.26)_100%)]" />
                <div className="absolute inset-x-0 bottom-[-1px] z-30 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.78)_56%,#ffffff_100%)]" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            style={{ y: contentY, opacity }}
            className="absolute left-1/2 top-[62%] flex w-[92vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center sm:top-[64%] sm:max-w-[580px] lg:top-[84%] lg:w-[38vw] lg:max-w-[680px]"
          >
            <div className="mb-2 flex flex-wrap justify-center overflow-hidden py-1">
              {eyebrowText.split("").map((char, index) => (
                <motion.span
                  key={`${char}-${index}`}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.02,
                    ease: transitionEase,
                  }}
                  className="inline-block whitespace-pre text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))] sm:text-[0.76rem] lg:text-[0.8rem]"
                >
                  {char}
                </motion.span>
              ))}
            </div>

            <AnimatePresence initial={false} mode="wait">
              <motion.h1
                key={`${sceneTitle}-${sceneIndex}`}
                initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                transition={{ duration: 0.52, ease: transitionEase }}
                className="font-serif text-[clamp(3.6rem,7vw,6.2rem)] leading-[0.88] tracking-[-0.04em] text-accent"
              >
                {sceneTitle}
              </motion.h1>
            </AnimatePresence>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.35, ease: transitionEase }}
              className="mt-4 h-px w-10 bg-accent/20"
            />

            <motion.span
              animate={{
                y: [0, 8, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mt-8 block h-4 w-px bg-secondary"
            />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
        <motion.p
          style={{ opacity }}
          className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          Scroll to explore
        </motion.p>
      </div>
    </section>
  );
}
