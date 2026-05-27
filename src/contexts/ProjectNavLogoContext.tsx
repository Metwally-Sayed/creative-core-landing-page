"use client";

/**
 * ProjectNavLogoContext
 *
 * Provides a lightweight client-side override for the site logo shown in the
 * shared Header on project detail pages. When a project has a `nav_logo_url`
 * set in its translations field, the ProjectDetailView mounts a bridge
 * component that calls `setNavLogoUrl` on mount (and clears it on unmount),
 * so the Header picks up the correct per-project logo without a page reload.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ProjectNavLogoContextValue {
  navLogoUrl: string | null;
  setNavLogoUrl: (url: string | null) => void;
}

const ProjectNavLogoContext = createContext<ProjectNavLogoContextValue>({
  navLogoUrl: null,
  setNavLogoUrl: () => {},
});

export function ProjectNavLogoProvider({ children }: { children: ReactNode }) {
  const [navLogoUrl, setNavLogoUrlState] = useState<string | null>(null);

  const setNavLogoUrl = useCallback((url: string | null) => {
    setNavLogoUrlState(url || null);
  }, []);

  return (
    <ProjectNavLogoContext.Provider value={{ navLogoUrl, setNavLogoUrl }}>
      {children}
    </ProjectNavLogoContext.Provider>
  );
}

export function useProjectNavLogo() {
  return useContext(ProjectNavLogoContext);
}
