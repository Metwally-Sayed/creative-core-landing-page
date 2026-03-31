"use client";

import { useEffect, ReactNode, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

export default function LenisProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Disable browser scroll restoration to prevent flicker/jumping
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
    }

    // Crucially: Resize lenis when content height changes (e.g. after Preloader)
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      resizeObserver.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Handle route change scroll reset
  useEffect(() => {
    if (lenisRef.current) {
      // Small timeout to ensure Next.js has finished swapping content
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        lenisRef.current?.scrollTo(0, { immediate: true });
      });
    }
  }, [pathname]);

  return <>{children}</>;
}
