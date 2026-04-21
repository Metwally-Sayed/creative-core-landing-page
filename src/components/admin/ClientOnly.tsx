"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only after first client-side mount.
 * Use this to wrap components that use @dnd-kit (or any other lib that
 * generates aria IDs which differ between SSR and client), preventing
 * hydration mismatches in Next.js App Router.
 */
export default function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <>{children}</>;
}
