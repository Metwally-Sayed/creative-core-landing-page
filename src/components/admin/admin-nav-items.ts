import { LayoutDashboard, Image, FolderKanban, FileText, Settings, type LucideIcon } from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
