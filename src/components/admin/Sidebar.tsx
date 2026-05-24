"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_SECTIONS } from "./admin-nav-items";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/page-data";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/(admin)/admin/actions";

export default function Sidebar({ settings }: { settings?: SiteSettings }) {
  const pathname = usePathname();

  const siteName = settings?.site_name ?? "Creative Core";
  const initials = siteName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className="hidden md:flex w-64 shrink-0 flex-col"
      style={{
        borderRight: "1px solid hsl(var(--admin-border))",
        background: "rgba(255,255,255,0.45)",
        backdropFilter: "blur(10px)",
        padding: "22px 16px 16px",
      }}
    >
      {/* Brand mark */}
      <div
        className="flex items-center gap-3 mb-4 pb-4"
        style={{ borderBottom: "1px solid hsl(var(--admin-border))" }}
      >
        <div
          className="flex shrink-0 items-center justify-center rounded-[9px]"
          style={{
            width: 32,
            height: 32,
            background: "hsl(var(--admin-navy-ink))",
            boxShadow: "0 4px 12px hsl(var(--admin-navy-ink) / 0.25)",
          }}
          aria-hidden
        >
          {/* 4-point sparkle */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1.5v4M8 10.5v4M1.5 8h4M10.5 8h4"
              stroke="hsl(var(--admin-orange))"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span
            className="font-semibold text-[15px] tracking-tight"
            style={{
              fontFamily: "var(--font-serif)",
              color: "hsl(var(--admin-navy-ink))",
            }}
          >
            {siteName}
          </span>
          <span
            className="text-[10px] font-semibold uppercase 0.22em] mt-0.5"
            style={{ color: "hsl(var(--admin-text-muted))" }}
          >
            Studio · Admin
          </span>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto">
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-2">
            <div
              className="px-3 pb-1.5 pt-3 text-[10px] font-semibold uppercase 0.22em]"
              style={{ color: "hsl(var(--admin-text-muted))" }}
            >
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200",
                    isActive
                      ? "text-white"
                      : "hover:bg-[hsl(var(--admin-hover))]",
                  )}
                  style={
                    isActive
                      ? {
                          background: "hsl(var(--admin-navy-ink))",
                          boxShadow: "0 4px 16px hsl(var(--admin-navy-ink) / 0.14)",
                          color: "#fff",
                        }
                      : { color: "hsl(222 30% 40%)" }
                  }
                >
                  <Icon
                    className="h-[17px] w-[17px] shrink-0"
                    style={{
                      color: isActive
                        ? "hsl(var(--admin-orange))"
                        : "hsl(var(--admin-text-muted))",
                    }}
                    aria-hidden
                  />
                  <span>{item.label}</span>
                  {item.count != null && (
                    <span
                      className="ml-auto text-[11px] font-semibold rounded-full px-2 py-0.5"
                      style={{
                        background: isActive
                          ? "rgba(255,255,255,0.12)"
                          : "hsl(var(--admin-navy-ink) / 0.06)",
                        color: isActive
                          ? "rgba(255,255,255,0.75)"
                          : "hsl(var(--admin-text-muted))",
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div
        className="mt-auto flex items-center gap-2.5 pt-3"
        style={{ borderTop: "1px solid hsl(var(--admin-border))" }}
      >
        <div
          className="flex shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
          style={{
            width: 34,
            height: 34,
            background: "linear-gradient(135deg, hsl(var(--admin-orange)), hsl(23 75% 50%))",
          }}
        >
          {initials}
        </div>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span
            className="text-[12.5px] font-semibold truncate"
            style={{ color: "hsl(var(--admin-navy-ink))" }}
          >
            {siteName}
          </span>
          <span
            className="text-[11px] truncate mt-0.5"
            style={{ color: "hsl(var(--admin-text-muted))" }}
          >
            Owner
          </span>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex items-center justify-center rounded-full transition-colors hover:bg-[hsl(var(--admin-hover))]"
            style={{
              width: 30,
              height: 30,
              color: "hsl(var(--admin-text-muted))",
            }}
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
          </button>
        </form>
      </div>
    </aside>
  );
}
