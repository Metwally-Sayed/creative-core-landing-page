"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

type Props = { className?: string; inverted?: boolean };

const LANGS: { locale: Locale; label: string; ariaLabel: string }[] = [
  { locale: "en", label: "EN", ariaLabel: "English" },
  { locale: "ar", label: "AR", ariaLabel: "العربية" },
];

export default function LocaleSwitch({ className, inverted }: Props) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (target: Locale) => {
    if (target !== locale) router.replace(pathname, { locale: target });
  };

  const isAr = locale === "ar";

  return (
    <div
      role="group"
      aria-label="Language / اللغة"
      className={cn(
        "relative inline-flex items-center rounded-full border p-1 transition-colors duration-300",
        inverted ? "border-white/20" : "border-accent/20",
        className,
      )}
    >
      {/* Sliding pill indicator */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-1 w-10 rounded-full shadow-sm",
          "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          inverted ? "bg-white" : "bg-[hsl(var(--accent))]",
          isAr ? "translate-x-10" : "translate-x-0",
        )}
        style={{ left: "4px" }}
      />

      {LANGS.map(({ locale: lang, label, ariaLabel }) => {
        const isActive = locale === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => switchTo(lang)}
            aria-pressed={isActive}
            aria-label={ariaLabel}
            className={cn(
              "relative z-10 w-10 py-[5px] rounded-full text-center",
              "text-[0.65rem] font-bold tracking-[0.12em] uppercase select-none",
              "outline-none transition-colors duration-200",
              "focus-visible:ring-2 focus-visible:ring-offset-1",
              inverted
                ? "focus-visible:ring-white/60 focus-visible:ring-offset-transparent"
                : "focus-visible:ring-[hsl(var(--accent)/0.5)] focus-visible:ring-offset-white",
              isActive
                ? inverted
                  ? "text-[hsl(var(--accent))]"
                  : "text-white"
                : inverted
                  ? "text-white/45 hover:text-white/80"
                  : "text-[hsl(var(--accent)/0.45)] hover:text-[hsl(var(--accent)/0.8)]",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
