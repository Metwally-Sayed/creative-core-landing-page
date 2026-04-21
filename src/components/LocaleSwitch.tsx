"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

type Props = { className?: string };

export default function LocaleSwitch({ className }: Props) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("locale");

  const next: Locale = locale === "en" ? "ar" : "en";

  const handleClick = () => {
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t("switchAria")}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider",
        className,
      )}
    >
      <span className={locale === "en" ? "opacity-100" : "opacity-50"}>EN</span>
      <span className="opacity-40">|</span>
      <span className={locale === "ar" ? "opacity-100" : "opacity-50"}>ع</span>
    </button>
  );
}
