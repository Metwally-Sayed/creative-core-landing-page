"use client";

import { usePathname } from "next/navigation";
import UserMenu from "./UserMenu";
import { ADMIN_NAV_ITEMS } from "./admin-nav-items";
import { Search, Bell, ExternalLink } from "lucide-react";
import Link from "next/link";

type Props = { email: string };

function useBreadcrumbs() {
  const pathname = usePathname();

  // Find the matching nav item to get its label
  const sorted = [...ADMIN_NAV_ITEMS].sort(
    (a, b) => b.href.length - a.href.length,
  );
  const match = sorted.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href),
  );

  // Map nav items to their section label
  const sectionMap: Record<string, string> = {
    "/admin": "Workspace",
    "/admin/projects": "Workspace",
    "/admin/pages": "Workspace",
    "/admin/media": "Workspace",
    "/admin/faq": "Content",
    "/admin/locations": "Content",
    "/admin/nav": "Content",
    "/admin/settings": "System",
  };

  const section = match ? (sectionMap[match.href] ?? "Workspace") : "Workspace";
  const screen = match?.label ?? "Dashboard";

  return [section, screen];
}

export default function TopBar({ email }: Props) {
  const [section, screen] = useBreadcrumbs();

  return (
    <header
      className="flex h-[70px] shrink-0 items-center gap-6 px-9"
      style={{
        borderBottom: "1px solid hsl(var(--admin-border))",
        background: "rgba(255,255,255,0.45)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[13px]" aria-label="Breadcrumb">
        <span style={{ color: "hsl(var(--admin-text-muted))" }}>{section}</span>
        <span style={{ color: "hsl(var(--admin-text-muted))", opacity: 0.5 }}>/</span>
        <span
          className="font-semibold"
          style={{ color: "hsl(var(--admin-navy-ink))" }}
        >
          {screen}
        </span>
      </nav>

      {/* Search pill */}
      <div
        className="ml-auto flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px]"
        style={{
          border: "1px solid hsl(var(--admin-border))",
          background: "rgba(255,255,255,0.6)",
          width: 280,
          color: "hsl(var(--admin-text-muted))",
        }}
      >
        <Search className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="flex-1">Search…</span>
        <kbd
          className="rounded px-1.5 py-0.5 font-mono text-[11px]"
          style={{
            border: "1px solid hsl(var(--admin-border))",
            background: "rgba(255,255,255,0.4)",
            color: "hsl(var(--admin-text-muted))",
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Notifications */}
      <button
        className="relative flex items-center justify-center rounded-full transition-colors hover:bg-[hsl(var(--admin-hover))]"
        style={{
          width: 38,
          height: 38,
          border: "1px solid hsl(var(--admin-border))",
          background: "rgba(255,255,255,0.6)",
          color: "hsl(var(--admin-navy-ink))",
        }}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" aria-hidden />
        {/* unread dot */}
        <span
          className="absolute rounded-full"
          style={{
            width: 7,
            height: 7,
            top: 7,
            right: 9,
            background: "hsl(var(--admin-orange))",
            boxShadow: "0 0 0 2px #fff",
          }}
          aria-hidden
        />
      </button>

      {/* View site */}
      <Link
        href="/"
        target="_blank"
        className="flex items-center justify-center rounded-full transition-colors hover:bg-[hsl(var(--admin-hover))]"
        style={{
          width: 38,
          height: 38,
          border: "1px solid hsl(var(--admin-border))",
          background: "rgba(255,255,255,0.6)",
          color: "hsl(var(--admin-navy-ink))",
        }}
        aria-label="View site"
      >
        <ExternalLink className="h-4 w-4" aria-hidden />
      </Link>

      <UserMenu email={email} />
    </header>
  );
}
