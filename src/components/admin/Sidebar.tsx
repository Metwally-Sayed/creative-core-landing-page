"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "./admin-nav-items";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]">
      <div className="flex h-14 items-center px-5 font-semibold text-[hsl(var(--admin-text))]">
        Hello Monday
      </div>
      <nav className="flex-1 px-2 py-2">
        <ul className="flex flex-col gap-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                    "border-l-2 border-transparent",
                    "text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-[hsl(var(--admin-text))]",
                    isActive &&
                      "border-l-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-bg))] font-medium text-[hsl(var(--admin-text))]",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
