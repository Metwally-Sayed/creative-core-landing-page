"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useDirection } from "@/hooks/useDirection";
import {
  ChevronLeft,
  ChevronRight,
  Palette,
  Zap,
  Layout,
  FileText,
  Camera,
  Globe,
  Star,
  Layers,
  Megaphone,
  BarChart2,
  Code2,
  Sparkles,
  PenTool,
  Video,
  ShoppingBag,
  Lightbulb,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

// ─── Icon registry ────────────────────────────────────────────────────────────

type IconName =
  | "palette"
  | "zap"
  | "layout"
  | "file_text"
  | "camera"
  | "globe"
  | "star"
  | "layers"
  | "megaphone"
  | "bar_chart"
  | "code"
  | "sparkles"
  | "pen_tool"
  | "video"
  | "shopping_bag"
  | "lightbulb";

const ICON_MAP: Record<IconName, React.ComponentType<LucideProps>> = {
  palette: Palette,
  zap: Zap,
  layout: Layout,
  file_text: FileText,
  camera: Camera,
  globe: Globe,
  star: Star,
  layers: Layers,
  megaphone: Megaphone,
  bar_chart: BarChart2,
  code: Code2,
  sparkles: Sparkles,
  pen_tool: PenTool,
  video: Video,
  shopping_bag: ShoppingBag,
  lightbulb: Lightbulb,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WhatWeDoItem {
  icon?: string;
  title: string;
  description: string;
}

interface Props {
  eyebrow?: string;
  title?: string;
  body?: string;
  items?: WhatWeDoItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AUTOPLAY_MS = 3500;

function calcVisible(width: number) {
  if (width >= 1024) return 4;
  if (width >= 640) return 2;
  return 1;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WhatWeDoSection({
  eyebrow,
  title,
  body,
  items = [],
}: Props) {
  const [active, setActive] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4); // SSR-safe default
  const [paused, setPaused] = useState(false);
  const [instant, setInstant] = useState(false); // skip animation on wrap-back

  const dir = useDirection();   // 1 for LTR, -1 for RTL
  const isRTL = dir === -1;

  const activeRef = useRef(0);
  activeRef.current = active;

  const dragStartX = useRef(0);

  // Responsive visible count — runs client-side only
  useEffect(() => {
    const update = () => setVisibleCount(calcVisible(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxActive = Math.max(0, items.length - visibleCount);
  const positions = maxActive + 1; // number of unique scroll positions

  const next = useCallback(() => {
    const curr = activeRef.current;
    const max = Math.max(0, items.length - visibleCount);
    if (curr >= max) {
      // wrap back to start without animation
      setInstant(true);
      setActive(0);
    } else {
      setActive(curr + 1);
    }
  }, [items.length, visibleCount]);

  const prev = useCallback(() => {
    const curr = activeRef.current;
    const max = Math.max(0, items.length - visibleCount);
    if (curr <= 0) {
      setInstant(true);
      setActive(max);
    } else {
      setActive(curr - 1);
    }
  }, [items.length, visibleCount]);

  // Re-enable animation one frame after an instant jump
  useEffect(() => {
    if (!instant) return;
    const id = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(id);
  }, [instant]);

  // Auto-advance
  useEffect(() => {
    if (paused || items.length <= visibleCount) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, next, items.length, visibleCount]);

  if (items.length === 0) {
    return (
      <section className="py-20 md:py-32 px-5 md:px-20 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16 md:mb-24">
            {eyebrow && (
              <p className="mb-4 text-sm font-bold uppercase text-secondary">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-serif text-4xl font-bold leading-tight text-primary md:text-5xl lg:text-6xl">
                {title}
              </h2>
            )}
            {body && (
              <p className="mt-6 mx-auto max-w-2xl text-base leading-relaxed text-foreground/70 md:text-lg">
                {body}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  // translateX as % of the track's own width.
  // In RTL, the flex track flows right-to-left, so "next" items live to the
  // LEFT of the visible window. Revealing them requires moving the track to the
  // RIGHT (positive x). Multiplying by `dir` (-1 for RTL) flips the sign.
  const trackWidthPct = (items.length / visibleCount) * 100;
  const translatePct = -(active / items.length) * 100 * dir;

  return (
    <section className="py-20 md:py-32 px-5 md:px-20 bg-background">
      <div className="mx-auto max-w-7xl">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="text-center mb-16 md:mb-24">
          {eyebrow && (
            <p className="mb-4 text-sm font-bold uppercase text-secondary">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="font-serif text-4xl font-bold leading-tight text-primary md:text-5xl lg:text-6xl">
              {title}
            </h2>
          )}
          {body && (
            <p className="mt-6 mx-auto max-w-2xl text-base leading-relaxed text-foreground/70 md:text-lg">
              {body}
            </p>
          )}
        </div>

        {/* ── Carousel ───────────────────────────────────────────────────── */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Slide track */}
          <div
            className="overflow-hidden"
            onPointerDown={(e) => { dragStartX.current = e.clientX; }}
            onPointerUp={(e) => {
              // diff > 0 = finger moved left, diff < 0 = finger moved right.
              // In LTR: swipe-left (diff>0) = next; in RTL flip the sign.
              const diff = (dragStartX.current - e.clientX) * dir;
              if (diff > 60) next();
              else if (diff < -60) prev();
            }}
          >
            <motion.div
              className="flex"
              style={{ width: `${trackWidthPct}%` }}
              animate={{ x: `${translatePct}%` }}
              transition={
                instant
                  ? { duration: 0 }
                  : { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
              }
            >
              {items.map((item, i) => {
                const IconComp = item.icon
                  ? (ICON_MAP[item.icon as IconName] ?? null)
                  : null;
                return (
                  <div
                    key={i}
                    style={{ width: `${100 / items.length}%` }}
                    className="shrink-0 px-3"
                  >
                    <div className="group rounded-2xl border border-foreground/10 bg-background p-6 transition-all duration-300 hover:border-[hsl(var(--secondary)/0.4)] hover:shadow-lg h-full">
                      {IconComp && (
                        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--secondary)/0.12)] transition-colors duration-300 group-hover:bg-[hsl(var(--secondary)/0.2)]">
                          <IconComp
                            className="h-5 w-5 text-[hsl(var(--secondary))]"
                            strokeWidth={1.8}
                          />
                        </div>
                      )}
                      <h3 className="mb-2 font-semibold text-primary leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-foreground/65">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* ── Arrows ── only when there is overflow */}
          {items.length > visibleCount && (
            <>
              {/* Left arrow — "prev" in LTR, "next" in RTL */}
              <button
                onClick={isRTL ? next : prev}
                aria-label={isRTL ? "Next" : "Previous"}
                className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background border border-foreground/10 shadow-md transition-all duration-200 hover:border-[hsl(var(--secondary)/0.4)] hover:shadow-lg"
              >
                <ChevronLeft className="h-4 w-4 text-foreground/60" />
              </button>

              {/* Right arrow — "next" in LTR, "prev" in RTL */}
              <button
                onClick={isRTL ? prev : next}
                aria-label={isRTL ? "Previous" : "Next"}
                className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background border border-foreground/10 shadow-md transition-all duration-200 hover:border-[hsl(var(--secondary)/0.4)] hover:shadow-lg"
              >
                <ChevronRight className="h-4 w-4 text-foreground/60" />
              </button>
            </>
          )}

          {/* ── Dots ── */}
          {positions > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: positions }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Go to position ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-6 bg-[hsl(var(--secondary))]"
                      : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
