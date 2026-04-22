"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { Link, usePathname } from "@/i18n/navigation";
import type { CSSProperties } from "react";
import { useEffect, useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useDirection } from "@/hooks/useDirection";
import QuoteBriefDialog from "@/components/QuoteBriefDialog";
import LocaleSwitch from "@/components/LocaleSwitch";
import BrandLogo from "@/components/BrandLogo";
import type { NavLink } from "@/lib/nav-data";
import type { SiteSettings } from "@/lib/page-data";

const transitionEase = [0.22, 1, 0.36, 1] as const;

const menuShellStyles = {
  "--menu-lead": "clamp(17rem, 26vw, 24rem)",
  "--menu-right-seam": "clamp(3.4rem, 4vw, 4.1rem)",
  "--menu-right-curve": "clamp(2rem, 3vw, 2.8rem)",
} as CSSProperties;

function LogoMark({
  inverted = false,
  neutral = false,
  className = "",
}: {
  inverted?: boolean;
  neutral?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`flex flex-col leading-[0.9] tracking-[0.08em] uppercase ${className}`.trim()}
    >
      <span
        className={`text-[0.92rem] font-black transition-colors duration-300 ${
          inverted
            ? "text-white"
            : neutral
              ? "text-black"
              : "text-[hsl(var(--accent))]"
        }`}
      >
        Hello Monday
      </span>
      <span
        className={`mt-0.5 text-[0.92rem] font-black transition-colors duration-300 ${
          inverted
            ? "text-white"
            : neutral
              ? "text-black"
              : "text-[hsl(var(--accent))]"
        }`}
      >
        / Dept.
      </span>
    </span>
  );
}

export default function Header({ navLinks = [], settings }: { navLinks?: NavLink[]; settings?: SiteSettings }) {
  const tCommon = useTranslations("common");
  const tHeader = useTranslations("header");
  const locale = useLocale();
  const dir = useDirection();

  const menuItems = navLinks.map((link) => ({
    label: locale === "ar" && link.label_ar ? link.label_ar : link.label_en,
    href: link.href,
  }));

  const pathname = usePathname() || "";
  const isProjectPage = pathname.startsWith("/projects");
  const isProductPage = pathname.startsWith("/product");
  const isServicesPage = pathname.startsWith("/services");
  const isWorkPage = pathname.startsWith("/work");
  const isAboutPage = pathname.startsWith("/about");
  const hideQuoteCta = isServicesPage || isWorkPage || isAboutPage || isProductPage;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [activeMenuIndex, setActiveMenuIndex] = useState(2);
  const [inHero, setInHero] = useState(true);
  const [isNearEdge, setIsNearEdge] = useState(false);
  const [isHoveringTrigger, setIsHoveringTrigger] = useState(false);

  const pointerY = useMotionValue(0);
  const smoothY = useSpring(pointerY, { damping: 25, stiffness: 200, mass: 0.5 });

  const realMouseY = useRef(0);

  useEffect(() => {
    pointerY.set(typeof window !== "undefined" ? window.innerHeight / 2 : 500);
    realMouseY.current = typeof window !== "undefined" ? window.innerHeight / 2 : 500;
    
    const handleMouse = (e: MouseEvent) => {
      realMouseY.current = e.clientY;
      if (window.scrollY > 140) {
        pointerY.set(e.clientY);
      }
      setIsNearEdge(e.clientX > window.innerWidth - 120);
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [pointerY]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);
  
  // Projects page has a taller hero, so header stays inverted longer (e.g. 80vh to match the dark hero gradient)
  // Normal scroll threshold for appearing/disappearing is 140px. 
  // Let's use 100 for hiding header, and ~500 for inverted color swap
  const scrollThreshold = 140;

  useEffect(() => {
    const updateHeaderShowing = () => {
      const isTop = window.scrollY <= scrollThreshold;
      const hasExtendedHero = isProjectPage || isProductPage;
      const isTopHero = window.scrollY <= (hasExtendedHero ? window.innerHeight * 0.75 : scrollThreshold);
      
      setShowHeader(isTop);
      setInHero(isTopHero);
      
      if (isTop) {
        pointerY.set(typeof window !== "undefined" ? window.innerHeight / 2 : 500);
      } else {
        pointerY.set(realMouseY.current);
      }
    };

    updateHeaderShowing();
    window.addEventListener("scroll", updateHeaderShowing, { passive: true });
    window.addEventListener("resize", updateHeaderShowing, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateHeaderShowing);
      window.removeEventListener("resize", updateHeaderShowing);
    };
  }, [pointerY, isProjectPage, isProductPage]);

  const showHeroTrigger = !isMenuOpen && (inHero || isNearEdge);
  // Revert back when out of hero or not on project.
  const forceInvert = (isProjectPage || isProductPage) && inHero;
  const useNeutralHeader = isWorkPage && !forceInvert;
  // Trigger blob always uses accent fill (white icon) — only the logo text goes neutral on the work page
  const heroTriggerFill = forceInvert ? "#ffffff" : "hsl(var(--accent))";
  const heroTriggerIconFill = forceInvert ? "#1d1f23" : "#ffffff";

  return (
    <>
      <AnimatePresence>
        {showHeader && (
          <motion.header
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: transitionEase }}
            className="pointer-events-none fixed inset-x-0 top-0 z-50"
          >
            <div className="pointer-events-auto mx-auto flex max-w-[1740px] items-center justify-between px-5 pt-5 lg:px-20 lg:pt-8 w-full">
              <Link href="/" aria-label={tHeader("homeAriaLabel")}>
                <BrandLogo logoUrl={settings?.logo_url} siteName={settings?.site_name} inverted={forceInvert} neutral={useNeutralHeader} className="h-12 min-w-0 max-w-[10rem]" />
              </Link>

              <div className="flex items-center gap-3">
                <LocaleSwitch inverted={forceInvert} />
                {!hideQuoteCta ? (
                  <>
                    <QuoteBriefDialog
                      triggerLabel={tCommon("getQuote")}
                      triggerClassName={`hidden h-10 rounded-full px-4 text-[0.78rem] font-semibold lg:inline-flex transition-colors duration-300 ${
                        forceInvert
                          ? "bg-white text-black hover:bg-white/90 shadow-md"
                          : "bg-[#0b1b3b] text-white hover:bg-[#0b1b3b]/90 shadow-[0_4px_16px_rgba(30,52,86,0.14)]"
                      }`}
                    />
                    {/* <QuoteBriefDialog
                      triggerLabel="Quote"
                      triggerClassName={`inline-flex h-10 rounded-full px-4 text-[0.72rem] font-semibold lg:hidden transition-colors duration-300 ${
                        forceInvert
                          ? "bg-white text-black hover:bg-white/90 shadow-md"
                          : "bg-[#0b1b3b] text-white hover:bg-[#0b1b3b]/90"
                      }`}
                    /> */}
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((open) => !open)}
                  className={`rounded-full px-4 py-2 text-[0.62rem] tracking-[0.24em] uppercase lg:hidden transition-colors duration-300 ${
                    forceInvert
                      ? "text-white border border-white/20 bg-white/10"
                      : "site-card text-[hsl(var(--accent))]"
                  }`}
                  aria-expanded={isMenuOpen}
                  aria-controls="site-menu"
                >
                  {tHeader("menuLabel")}
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHeroTrigger && (
            <motion.button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              initial={{ x: 72 * dir, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 72 * dir, opacity: 0 }}
              transition={{ duration: 0.42, ease: transitionEase }}
              className="fixed inset-y-0 end-0 z-55 hidden w-[6.9rem] items-center justify-end bg-transparent text-white lg:flex"
              aria-label={tHeader("openMenu")}
            >
              <div
                className="absolute inset-y-0 end-0 w-[8rem] pointer-events-auto"
                onMouseEnter={() => setIsHoveringTrigger(true)}
                onMouseLeave={() => setIsHoveringTrigger(false)}
              />
            <motion.div
              className="absolute end-0 w-full"
              style={{
                height: "50vh",
                top: "-25vh",
                y: smoothY,
              }}
              animate={{
                x: isHoveringTrigger ? -6 * dir : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <svg
                viewBox="0 0 114 1000"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
                style={{ left: dir === 1 ? "25%" : "auto", right: dir === -1 ? "25%" : "auto", transform: dir === -1 ? "scaleX(-1)" : undefined }}
                aria-hidden="true"
              >
                <path
                  d="M114 0 L114 1000 L86 1000 C48 820 40 654 40 500 C40 346 48 180 86 0 Z"
                  fill={heroTriggerFill}
                />
              </svg>
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 19 15"
                className="pointer-events-none absolute end-4 top-1/2 h-[15px] w-[19px] -translate-y-1/2"
                animate={{
                  scale: isHoveringTrigger ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <path d="M689.48,376.38c0,.14-.22,0-.22.18s.19.07.28.06l.67,0a9.8,9.8,0,0,1,2.34-.14c.07,0,.09.2.17.24s.2-.15.33,0c.05.61-.56.27-.64.77-.35.07-.87,0-1,.4-1.37.11-2.52.92-3.82.6a8.77,8.77,0,0,1-2.57.14c-.45,0-.9.08-1.34,0-.08,0-.13-.12-.19-.12a14.89,14.89,0,0,0-1.67.09c-.33,0-.59.12-.95.1s-1.05.06-1.67.09c-.31,0-.62-.12-.92-.07-.06,0-.13.11-.2.12s-.1-.06-.17-.06-.1.11-.14.12c-.19,0-.43,0-.64,0a4.81,4.81,0,0,1-.75,0,2,2,0,0,1-.56-.13c-.07,0-.13-.14-.19-.18s-.14,0-.2,0c-.26-.11-.45-.5-.75-.37-.09-.1-.16-.25-.28-.3a.79.79,0,0,1,.22-.48c0-.22-.13-.34-.08-.48.28-.16.52.1.75,0s.33-.39.53-.29c.08-.06.11-.24.2-.3.35.11.73-.1,1.14-.1.14,0,.28.12.42.13s.06-.11.08-.12a3.19,3.19,0,0,1,.56,0c.24,0,.72.07,1.09.08a11.88,11.88,0,0,1,2.09-.09c.31-.2.81,0,1.2-.1s.87.09,1.31.08C685.79,376.25,687.55,376.3,689.48,376.38Z" transform="translate(-674 -376)" fill={heroTriggerIconFill} fillRule="evenodd"></path>
                <path d="M692.08,383.38c0,.26-.12,0-.17.07s.05.59-.07.58a2.62,2.62,0,0,0-.92.13c-.12.11.1,0,0,.24s-.38,0-.63.08-.68.34-1,.21c0,.26.1.08.14.16a18.09,18.09,0,0,1-3.31.11c-.13,0-.27-.11-.4-.1s-.31.23-.46.24-.61-.11-.91-.11c-.56,0-1.13.29-1.69.29a6.74,6.74,0,0,0-.91,0s-.1-.08-.14,0a1.63,1.63,0,0,0-.06.23s-.09-.26-.14-.28-.34.18-.49.12a2.18,2.18,0,0,0-.71-.3,6.06,6.06,0,0,0-1.57,0,4.76,4.76,0,0,1-1.12.31,3.28,3.28,0,0,0-1.54.08c-.18.08-.37.36-.55.34s-.35-.51-.57-.15c-.17-.39-.17-.54-.39-.34,0-.8.2-.67.3-1a6,6,0,0,1,.21-.91,2.82,2.82,0,0,0,1-.58c.23-.19.31-.15.6-.08.08,0,.14-.16.23-.18.25-.05.52.22.77.2s.29-.2.43-.25.17.1.26.07.08-.21.12-.21.24.13.37.1.26-.24.4-.26.54.19.82.21c.6,0,1.23,0,1.85,0a14.32,14.32,0,0,0,2.92-.33,8.05,8.05,0,0,0,1,0,16.56,16.56,0,0,1,2.4,0,5.91,5.91,0,0,1,3,.67C691.55,382.84,691.85,382.75,692.08,383.38Z" transform="translate(-674 -376)" fill={heroTriggerIconFill} fillRule="evenodd"></path>
                <path d="M693.05,389.21c0,.2-.13,0-.18.06s.06.44-.07.44a3.83,3.83,0,0,0-1,.09c-.13.09.11,0,0,.18s-.4,0-.66.06a2.3,2.3,0,0,1-1.09.16c0,.19.11.06.15.12a26.87,26.87,0,0,1-3.5.08c-.14,0-.28-.08-.42-.08s-.32.17-.49.18c-.32,0-.64-.08-1-.09-.59,0-1.19.22-1.78.21-.34,0-.67,0-1,0,0,0-.11-.06-.15,0a1,1,0,0,0-.06.17s-.09-.19-.15-.21-.36.13-.51.09a2.87,2.87,0,0,0-.75-.23,9,9,0,0,0-1.66,0,6.7,6.7,0,0,1-1.18.24,4.84,4.84,0,0,0-1.63.06c-.19.06-.39.27-.58.26s-.37-.38-.6-.11c-.18-.29-.18-.4-.42-.26,0-.6.21-.5.32-.75a3.47,3.47,0,0,1,.22-.68,3.47,3.47,0,0,0,1.09-.43.74.74,0,0,1,.63-.06c.09,0,.15-.12.24-.14.26,0,.55.17.81.15s.31-.15.46-.19.18.08.27,0,.08-.15.12-.16.26.1.39.07.28-.18.43-.19a6.62,6.62,0,0,1,.87.16c.63,0,1.3,0,2,0a21.09,21.09,0,0,0,3.08-.25c.34,0,.69.07,1,0a24.61,24.61,0,0,1,2.53,0,8.43,8.43,0,0,1,3.22.5C692.48,388.81,692.8,388.74,693.05,389.21Z" transform="translate(-674 -376)" fill={heroTriggerIconFill} fillRule="evenodd"></path>
              </motion.svg>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-60 overflow-hidden">
            <motion.div
              initial={{ x: `${100 * dir}%` }}
              animate={{ x: 0 }}
              exit={{ x: `${100 * dir}%` }}
              transition={{ duration: 0.9, ease: transitionEase }}
              className="absolute inset-y-0"
              style={{
                ...menuShellStyles,
                left: dir === 1 ? "calc(0px - var(--menu-lead))" : "auto",
                right: dir === -1 ? "calc(0px - var(--menu-lead))" : "auto",
                width: "calc(100vw + var(--menu-lead) + var(--menu-right-seam))",
              }}
            >
              <div
                className="absolute inset-y-0"
                style={{
                  left: dir === 1 ? "calc(var(--menu-lead) - 1px)" : "calc(var(--menu-right-seam) - 1px)",
                  right: dir === 1 ? "calc(var(--menu-right-seam) - 1px)" : "calc(var(--menu-lead) - 1px)",
                  background: "hsl(var(--accent))",
                }}
              />
              {/* Left curved edge (entrance side) */}
              <div
                className="absolute top-[-6vh] bg-accent"
                style={{
                  left: dir === 1 ? 0 : "auto",
                  right: dir === -1 ? 0 : "auto",
                  height: "112vh",
                  width: "calc(var(--menu-lead) + 1px)",
                  borderRadius: dir === 1 ? "58% 0 0 42% / 30% 0 0 70%" : "0 58% 42% 0 / 0 30% 70% 0",
                }}
              />
              {/* Right curved edge (exit seam side) */}
              <div
                className="absolute top-[-6vh] bg-accent"
                style={{
                  right: dir === 1 ? "calc(var(--menu-right-seam) - var(--menu-right-curve))" : "auto",
                  left: dir === -1 ? "calc(var(--menu-right-seam) - var(--menu-right-curve))" : "auto",
                  height: "112vh",
                  width: "calc(var(--menu-right-curve) + 1px)",
                  borderRadius: dir === 1 ? "0 44% 40% 0 / 0 24% 76% 0" : "44% 0 0 40% / 24% 0 0 76%",
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.36, delay: 0.18 }}
              className="absolute inset-0"
            >
              <Link
                href="/"
                className="absolute left-[7.2vw] top-[32%] hidden -translate-y-1/2 lg:block"
                aria-label={tHeader("homeAriaLabel")}
              >
                <BrandLogo logoUrl={settings?.logo_url} siteName={settings?.site_name} inverted className="opacity-[0.92] h-12 min-w-0 max-w-[10rem]" />
              </Link>

              <motion.button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                initial={{ x: 72 * dir, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 72 * dir, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: transitionEase }}
                className="fixed inset-y-0 end-[-1.7rem] z-65 hidden w-[6.9rem] items-center justify-end bg-transparent text-black lg:flex cursor-pointer"
                aria-label={tHeader("closeMenu")}
              >
                <svg
                  viewBox="0 0 114 1000"
                  preserveAspectRatio="none"
                  className="absolute inset-y-0 h-[50%] w-full top-[25%]"
                  style={{
                    left: dir === 1 ? "0%" : "auto",
                    right: dir === -1 ? "0%" : "auto",
                    transform: dir === -1 ? "scaleX(-1)" : undefined,
                  }}
                  aria-hidden="true"
                >
                  <path
                    d="M114 0 L114 1000 L86 1000 C48 820 40 654 40 500 C40 346 48 180 86 0 Z"
                    fill="#fbf7ef"
                  />
                </svg>
                <svg
                  viewBox="0 0 34 34"
                  xmlns="http://www.w3.org/2000/svg"
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-[34px] h-[34px]"
                  style={{ right: dir === 1 ? "2.10rem" : "auto", left: dir === -1 ? "2.10rem" : "auto" }}
                >
                  <g transform="translate(11.4, 10.4)">
                    <path d="M10.94,9.73c0-.06,0-.26-.08-.3s-.23-.29-.37-.42a.6.6,0,0,1-.12-.29c0-.08-.14-.08-.19-.14a4.1,4.1,0,0,1-.26-.41A32.4,32.4,0,0,0,7.16,5.34c-.07,0-.18,0-.22,0C7,5,6.66,5,6.44,4.77,6,4.44,5.66,4,5.27,3.65c0,0-.14,0-.19,0-.21-.13-.32-.38-.6-.37a1.62,1.62,0,0,0-.92-.71c.06-.21-.13-.19-.21-.26s-.1-.15-.18-.2a13.54,13.54,0,0,0-1.11-.84c0-.1,0-.19-.07-.21-.23.16-.44.31-.54.17l-.33.24c0-.19-.18-.08-.37.09.13.24.37.44.17.89,0,.08.08,0,.11.09A1.57,1.57,0,0,0,1.37,3.9c.34.05.43.33.66.56.26-.1.24.15.32.26s.25.12.35.21.13.28.35.23c0,.11,0,.06.05.17a.36.36,0,0,1,.19,0c.35.25.61.67,1,.78,0,.07,0,.11,0,.17s.27.2.38.27.07.16.14.23.25.13.35.21c.37.33.78.73,1,1s.55.49.79.76.42.34.59.54.14.26.23.37.44.2.48.52a1.17,1.17,0,0,1,.2.06A13.37,13.37,0,0,1,10,12c.05.07.09-.14.11-.07.21.12.25.35.41.49s.05-.06.08,0,.12.16.25.15.18-.16.22-.08.12,0,.14.15c.24-.15.26,0,.38.09s.24,0,.33.1.13.26.27.27.06-.1.16-.17a.85.85,0,0,0-.07-.64c-.1-.1,0-.37-.23-.47s.12,0,0-.1-.07,0-.1,0c.17-.17-.06-.4-.17-.36s0,.05,0,.09-.22-.27-.21-.43c.1,0,0,.19.15.17a1.13,1.13,0,0,0-.24-.48c-.11.1.09.16,0,.31-.09-.11-.17-.33-.23-.38s.17-.08.11-.16C11.31,10.09,11.06,10,10.94,9.73Zm.33.62c.07.07-.14-.11,0,0Zm-.4-.55c.11-.08,0,.07.05.07C10.83,10,10.87,9.82,10.87,9.8ZM11,10l-.07-.12S11.11,9.93,11,10Zm.89,1.37c.08-.07.07.07.11.09S11.9,11.43,11.86,11.41Z" transform="translate(-0.75 -0.39)" fill="#1d1f23" fillRule="evenodd"></path>
                    <path d="M9.24,2.34c.34,0-.14.11,0,.25s.2-.12.2-.12L9.8,2A6.93,6.93,0,0,1,11.06.53c.08,0,.19.08.27.06s0-.22.2-.19c.45.37-.14.51.16.9-.15.26-.51.52-.29.86-.73.9-.83,2.14-1.81,2.7a6.32,6.32,0,0,1-1.4,1.63,10,10,0,0,1-.75.83c-.05,0-.15,0-.2,0a11.5,11.5,0,0,0-.91,1.06,5.34,5.34,0,0,1-.48.64c-.27.25-.56.68-.91,1.07-.16.2-.44.3-.58.5,0,0,0,.16,0,.2s-.1,0-.14.06,0,.13,0,.16a4.54,4.54,0,0,1-.38.38,3.18,3.18,0,0,1-.4.48,1.37,1.37,0,0,1-.42.25s-.17,0-.24,0-.06.09-.11.11c-.23.08-.61-.06-.7.2a1.23,1.23,0,0,0-.37,0,.78.78,0,0,1-.2-.45c-.15-.15-.32-.15-.38-.28s.37-.24.44-.44-.08-.47.11-.52c0-.09-.1-.23-.09-.31.28-.14.35-.51.59-.76.08-.08.25-.08.33-.17s0-.11,0-.13a2.57,2.57,0,0,1,.33-.32c.15-.14.47-.4.69-.61C3.77,8,4,7.49,4.5,7.13c0-.32.49-.47.63-.79s.57-.46.82-.73C7,4.47,8.06,3.44,9.24,2.34Z" transform="translate(-0.75 -0.39)" fill="#1d1f23" fillRule="evenodd"></path>
                  </g>
                </svg>
              </motion.button>

              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="absolute end-6 top-6 rounded-full border border-white/18 px-4 py-2 text-[0.7rem] tracking-[0.22em] text-white uppercase lg:hidden"
                aria-label={tHeader("closeMenu")}
              >
                {tHeader("closeMenu")}
              </button>

              <nav
                id="site-menu"
                className="absolute left-1/2 top-1/2 w-full max-w-[1600px] -translate-x-1/2 -translate-y-1/2"
              >
                <div className={`w-fit space-y-4 ${dir === 1 ? "ms-auto me-[13vw] lg:me-[16vw] pe-8 lg:pe-0" : "me-auto ms-[13vw] lg:ms-[16vw] ps-8 lg:ps-0"}`}>
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      onMouseEnter={() => setActiveMenuIndex(index)}
                      initial={{ opacity: 0, x: 20 * dir }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 * dir }}
                      transition={{
                        duration: 0.6,
                        delay: 0.2 + index * 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="group flex items-center gap-6 text-[2.4rem] leading-[0.9] font-black tracking-[-0.02em] text-white sm:text-[3rem] md:text-[5.5rem] lg:text-[7.5rem]"
                      >
                        <motion.div
                          animate={{
                            width: index === activeMenuIndex ? 40 : 0,
                            opacity: index === activeMenuIndex ? 1 : 0,
                          }}
                          className="hidden h-2 origin-inline-start rounded-full bg-secondary lg:block"
                        />
                        <span className="transition-transform duration-500 group-hover:translate-x-4 rtl:group-hover:-translate-x-4">
                          {item.label}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-6 text-[0.75rem] font-bold uppercase tracking-[0.3em] text-white/30 md:bottom-12 md:gap-12"
              >
                {['Facebook', 'Instagram', 'Twitter', 'Vimeo', 'LinkedIn'].map((platform) => (
                  <a
                    key={platform}
                    href="#"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {platform}
                  </a>
                ))}
                <LocaleSwitch inverted />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
