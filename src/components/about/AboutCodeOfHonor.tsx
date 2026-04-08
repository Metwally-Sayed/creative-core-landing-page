"use client";

import { useState } from "react";

import LiquidCard from "@/components/LiquidCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  CodeOfHonorItem,
} from "./AboutPageView";

type CodeOfHonorArtKey = CodeOfHonorItem["art"];

type AboutCodeOfHonorProps = {
  items: CodeOfHonorItem[];
};

function CodeOfHonorArt({ art }: { art: CodeOfHonorArtKey }) {
  switch (art) {
    case "be-nice":
      return (
        <svg
          viewBox="0 0 220 160"
          className="h-full w-full text-accent/90"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.3"
          aria-hidden="true"
        >
          <circle cx="72" cy="40" r="10" />
          <circle cx="146" cy="40" r="10" />
          <path d="M60 63c4-11 11-16 21-16 9 0 17 5 20 16" />
          <path d="M134 63c4-11 11-16 21-16 9 0 17 5 20 16" />
          <path d="M68 73l-9 34 8 35" />
          <path d="M84 73l4 31 4 38" />
          <path d="M142 73l-8 34 7 35" />
          <path d="M157 73l4 31 5 38" />
          <path d="M87 86c15 5 21 14 23 28-13 6-27 6-40 0 1-15 7-23 17-28Z" />
          <path d="M160 86c15 5 21 14 23 28-13 6-27 6-40 0 1-15 7-23 17-28Z" />
          <path d="M100 78c7 7 11 10 22 10" />
          <path d="M116 91c5-9 8-13 14-16" />
          <path d="M109 70c5-8 12-8 17 0" />
        </svg>
      );
    case "powers-for-good":
      return (
        <svg
          viewBox="0 0 220 160"
          className="h-full w-full text-accent/90"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.3"
          aria-hidden="true"
        >
          <circle cx="107" cy="86" r="26" />
          <path d="M91 86h32" />
          <path d="M107 60c8 9 11 17 11 26s-3 17-11 26c-8-9-11-17-11-26s3-17 11-26Z" />
          <circle cx="54" cy="54" r="9" />
          <path d="M43 74c3-9 9-14 18-14 8 0 14 4 18 13" />
          <path d="M40 89l14 12 21-2" />
          <path d="M59 87l6 28" />
          <circle cx="166" cy="54" r="9" />
          <path d="M154 74c4-9 10-14 19-14 8 0 14 4 18 13" />
          <path d="M178 88l-14 14-20-2" />
          <path d="M160 87l-6 28" />
          <path d="M90 120c14 9 28 9 42 0" />
        </svg>
      );
    case "try-the-truth":
      return (
        <svg
          viewBox="0 0 220 160"
          className="h-full w-full text-accent/90"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.3"
          aria-hidden="true"
        >
          <rect x="128" y="26" width="42" height="56" rx="6" />
          <circle cx="149" cy="46" r="7" />
          <path d="M140 63h19" />
          <circle cx="63" cy="43" r="10" />
          <path d="M52 64c3-9 9-14 18-14 8 0 14 4 18 13" />
          <path d="M60 78l-6 27 8 31" />
          <path d="M74 78l4 28 5 30" />
          <path d="M84 92l30-12 8 11-30 13Z" />
          <path d="M124 91l17 10" />
          <path d="M124 101l12 18" />
        </svg>
      );
    case "enjoy-the-ride":
      return (
        <svg
          viewBox="0 0 220 160"
          className="h-full w-full text-accent/90"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.3"
          aria-hidden="true"
        >
          <path d="M30 120h150" />
          <path d="M45 106l19-30h56l26 19 12 23H60Z" />
          <circle cx="80" cy="120" r="11" />
          <circle cx="144" cy="120" r="11" />
          <circle cx="84" cy="52" r="8" />
          <path d="M75 69c3-8 8-12 16-12 7 0 12 3 15 10" />
          <path d="M79 78l13 17" />
          <path d="M97 78l20 18" />
          <circle cx="124" cy="60" r="7" />
          <path d="M116 76c2-7 7-10 14-10 6 0 11 3 13 9" />
          <path d="M123 84l7 12" />
        </svg>
      );
    case "speak-up-and-listen":
      return (
        <svg
          viewBox="0 0 220 160"
          className="h-full w-full text-accent/90"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.3"
          aria-hidden="true"
        >
          <rect x="34" y="44" width="24" height="42" rx="4" />
          <path d="M46 86v33" />
          <path d="M28 119h36" />
          <path d="M58 58c19 0 31-7 41-18v50c-10-11-22-18-41-18" />
          <path d="M111 54c7 8 11 16 11 26" />
          <path d="M118 47c11 10 17 22 17 33" />
          <circle cx="162" cy="61" r="9" />
          <path d="M151 81c4-10 10-14 18-14 8 0 14 4 18 13" />
          <path d="M157 96l-7 24 8 19" />
          <path d="M172 95l5 20 2 24" />
          <path d="M132 100h58" />
        </svg>
      );
    case "solve-the-problem":
      return (
        <svg
          viewBox="0 0 220 160"
          className="h-full w-full text-accent/90"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.3"
          aria-hidden="true"
        >
          <rect x="42" y="30" width="92" height="92" rx="8" />
          <path d="M57 44h62v18H91v18h27v28H84" />
          <path d="M57 108V82h19" />
          <path d="M152 52h22l14 14-14 14h-22Z" />
          <path d="M168 80v32" />
          <path d="M156 112h24" />
          <path d="M166 102l2 10 9-8" />
        </svg>
      );
    case "help-each-other":
      return (
        <svg
          viewBox="0 0 220 160"
          className="h-full w-full text-accent/90"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.3"
          aria-hidden="true"
        >
          <circle cx="71" cy="40" r="9" />
          <path d="M60 61c4-10 10-14 18-14 8 0 14 4 18 13" />
          <path d="M67 74l-13 29" />
          <path d="M82 74l5 31 1 29" />
          <path d="M40 124h50" />
          <circle cx="149" cy="55" r="9" />
          <path d="M138 76c3-10 9-14 18-14 8 0 14 4 17 13" />
          <path d="M145 89l-7 25 8 20" />
          <path d="M160 89l4 25 4 20" />
          <path d="M87 79c15 10 29 13 45 9" />
          <path d="M121 86l12-13" />
        </svg>
      );
    case "team-up":
      return (
        <svg
          viewBox="0 0 220 160"
          className="h-full w-full text-accent/90"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.3"
          aria-hidden="true"
        >
          <circle cx="77" cy="42" r="9" />
          <path d="M66 63c4-10 10-14 18-14 8 0 14 4 18 13" />
          <path d="M74 76l-8 28 8 30" />
          <path d="M88 76l4 27 4 31" />
          <path d="M54 82l23 16" />
          <circle cx="145" cy="42" r="9" />
          <path d="M134 63c4-10 10-14 18-14 8 0 14 4 18 13" />
          <path d="M142 76l-8 28 8 30" />
          <path d="M156 76l4 27 4 31" />
          <path d="M168 82l-23 16" />
          <path d="M96 92l16-14 16 14" />
        </svg>
      );
    default:
      return null;
  }
}

function HonorItemCard({
  item,
  open,
  onOpenChange,
}: {
  item: CodeOfHonorItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="border-t border-border/70 pt-3"
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-start justify-between gap-4 text-left outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
          open ? "text-accent" : "text-accent/92 hover:text-secondary",
        )}
      >
        <div className="space-y-2">
          <p className="text-[0.72rem] leading-none text-muted-foreground/70">
            {item.index}
          </p>
          <h3 className="font-serif text-[1.9rem] leading-[0.95] tracking-[-0.045em]">
            {item.title}
          </h3>
        </div>
        <span className="pt-1 text-[1.4rem] leading-none text-secondary">
          {open ? "x" : "+"}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="space-y-5 pt-5">
          <LiquidCard
            aspectRatio="aspect-[1.24]"
            className="border border-white/70 bg-white/82 shadow-[var(--shadow-soft)]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--secondary)/0.12)_0%,hsl(var(--background)/0.3)_100%)]" />
            <div className="absolute inset-0 overflow-hidden p-6">
              <CodeOfHonorArt art={item.art} />
            </div>
          </LiquidCard>

          <p className="max-w-[34rem] text-[0.98rem] leading-[1.72] text-muted-foreground">
            {item.body}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function AboutCodeOfHonor({
  items,
}: AboutCodeOfHonorProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const renderCard = (item: CodeOfHonorItem) => {
    const isOpen = openIds.includes(item.id);

    return (
      <HonorItemCard
        key={item.id}
        item={item}
        open={isOpen}
        onOpenChange={(nextOpen) => {
          setOpenIds((current) =>
            nextOpen
              ? current.includes(item.id)
                ? current
                : [...current, item.id]
              : current.filter((id) => id !== item.id),
          );
        }}
      />
    );
  };

  const twoColLeft = items.filter((_, index) => index % 2 === 0);
  const twoColRight = items.filter((_, index) => index % 2 === 1);

  const threeColA = items.filter((_, index) => index % 3 === 0);
  const threeColB = items.filter((_, index) => index % 3 === 1);
  const threeColC = items.filter((_, index) => index % 3 === 2);

  return (
    <>
      <div className="space-y-8 md:hidden">{items.map(renderCard)}</div>

      <div className="hidden items-start gap-10 md:grid md:grid-cols-2 xl:hidden">
        <div className="space-y-8">{twoColLeft.map(renderCard)}</div>
        <div className="space-y-8">{twoColRight.map(renderCard)}</div>
      </div>

      <div className="hidden items-start gap-10 xl:grid xl:grid-cols-3">
        <div className="space-y-8">{threeColA.map(renderCard)}</div>
        <div className="space-y-8">{threeColB.map(renderCard)}</div>
        <div className="space-y-8">{threeColC.map(renderCard)}</div>
      </div>
    </>
  );
}
