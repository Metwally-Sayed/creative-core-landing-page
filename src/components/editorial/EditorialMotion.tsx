"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const transitionEase = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  amount?: number;
  x?: number;
  y?: number;
};

type HeadingTag = "h1" | "h2" | "h3";

type WordRevealProps = {
  text: string;
  as?: HeadingTag;
  className?: string;
  amount?: number;
  delayChildren?: number;
  stagger?: number;
};

export function EditorialReveal({
  children,
  className,
  delay = 0,
  duration = 0.8,
  amount = 0.24,
  x = 0,
  y = 32,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        prefersReducedMotion
          ? false
          : {
              opacity: 0,
              x,
              y,
            }
      }
      whileInView={
        prefersReducedMotion
          ? undefined
          : {
              opacity: 1,
              x: 0,
              y: 0,
            }
      }
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: transitionEase }}
    >
      {children}
    </motion.div>
  );
}

export function EditorialWordReveal({
  text,
  as = "h2",
  className,
  amount = 0.24,
  delayChildren = 0,
  stagger = 0.045,
}: WordRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(" ");

  const MotionTag =
    as === "h1" ? motion.h1 : as === "h2" ? motion.h2 : motion.h3;

  if (prefersReducedMotion) {
    return <MotionTag className={className}>{text}</MotionTag>;
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden pb-[0.06em] pe-[0.17em]"
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: "105%" },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.72, ease: transitionEase }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
