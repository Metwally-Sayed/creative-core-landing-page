import {
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function WhatWeDoSection({
  eyebrow,
  title,
  body,
  items = [],
}: Props) {
  return (
    <section className="py-20 md:py-32 px-5 md:px-20 bg-background">
      <div className="mx-auto max-w-7xl">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="text-center mb-16 md:mb-24">
          {eyebrow && (
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--secondary))]">
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

        {/* ── Service cards ───────────────────────────────────────────────── */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => {
              const IconComp = item.icon
                ? (ICON_MAP[item.icon as IconName] ?? null)
                : null;
              return (
                <div
                  key={i}
                  className="group rounded-2xl border border-foreground/10 bg-background p-6 transition-all duration-300 hover:border-[hsl(var(--secondary)/0.4)] hover:shadow-lg"
                >
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
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
