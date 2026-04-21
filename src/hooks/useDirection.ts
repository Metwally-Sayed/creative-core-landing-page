"use client";

import { useLocale } from "next-intl";
import { localeDirection, type Locale } from "@/i18n/config";

/**
 * Returns 1 for ltr, -1 for rtl. Use to mirror directional axis values
 * in framer-motion props: `x: -40 * dir`.
 */
export function useDirection(): 1 | -1 {
  const locale = useLocale() as Locale;
  return localeDirection[locale] === "rtl" ? -1 : 1;
}
