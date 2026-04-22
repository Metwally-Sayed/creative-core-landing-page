"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

type Props = { className?: string; inverted?: boolean };

const LOCALE_DATA: Record<Locale, { code: string; name: string }> = {
  en: { code: "EN", name: "English" },
  ar: { code: "AR", name: "العربية" },
};

export default function LocaleSwitch({ className, inverted }: Props) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale: Locale = locale === "ar" ? "en" : "ar";
  const current = LOCALE_DATA[locale];
  const other = LOCALE_DATA[otherLocale];

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: otherLocale })}
      aria-label={`Switch to ${other.name}`}
      className={cn(
        "group relative inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-4",
        "border transition-all duration-200 select-none outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-1",
        inverted
          ? [
              "border-white/20 hover:border-white/40 hover:bg-white/8",
              "focus-visible:ring-white/50",
            ]
          : [
              "border-[hsl(var(--accent)/0.25)] hover:border-[hsl(var(--accent)/0.5)]",
              "hover:bg-[hsl(var(--accent)/0.06)]",
              "focus-visible:ring-[hsl(var(--accent)/0.4)]",
            ],
        className,
      )}
    >
      {/* Sliding text — current slides up, target slides in */}
      <div className="relative h-[1.15rem] w-[4.6rem] overflow-hidden">
        {/* Current language — slides up on hover */}
        <div
          className={cn(
            "absolute inset-0 flex items-center gap-1.5",
            "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            "group-hover:-translate-y-full",
          )}
        >
          <span
            className={cn(
              "shrink-0 text-[0.6rem] font-black tracking-[0.16em] uppercase",
              inverted ? "text-white" : "text-[hsl(var(--accent))]",
            )}
          >
            {current.code}
          </span>
          <span
            className={cn(
              "truncate text-[0.55rem] leading-none",
              inverted ? "text-white/55" : "text-[hsl(var(--accent)/0.55)]",
            )}
          >
            {current.name}
          </span>
        </div>

        {/* Target language — slides in from below on hover */}
        <div
          className={cn(
            "absolute inset-0 flex translate-y-full items-center gap-1.5",
            "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            "group-hover:translate-y-0",
          )}
        >
          <span
            className={cn(
              "shrink-0 text-[0.6rem] font-black tracking-[0.16em] uppercase",
              inverted ? "text-white/80" : "text-[hsl(var(--accent)/0.8)]",
            )}
          >
            {other.code}
          </span>
          <span
            className={cn(
              "truncate text-[0.55rem] leading-none",
              inverted ? "text-white/45" : "text-[hsl(var(--accent)/0.45)]",
            )}
          >
            {other.name}
          </span>
        </div>
      </div>

      {/* Swap arrows */}
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className={cn(
          "h-3 w-3 shrink-0 transition-all duration-300",
          "group-hover:rotate-180 group-hover:scale-110",
          inverted
            ? "text-white/30 group-hover:text-white/60"
            : "text-[hsl(var(--accent)/0.3)] group-hover:text-[hsl(var(--accent)/0.7)]",
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 6l4-4 4 4M12 10l-4 4-4-4" />
      </svg>
    </button>
  );
}
