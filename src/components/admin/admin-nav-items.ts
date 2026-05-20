import {
  LayoutDashboard,
  Image,
  MapPin,
  HelpCircle,
  FolderKanban,
  FileText,
  Settings,
  Menu,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  count?: number;
};

export type AdminNavSection = {
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Projects", href: "/admin/projects", icon: FolderKanban },
      { label: "Pages", href: "/admin/pages", icon: FileText },
      { label: "Media", href: "/admin/media", icon: Image },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
      { label: "Locations", href: "/admin/locations", icon: MapPin },
      { label: "Navigation", href: "/admin/nav", icon: Menu },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

// Flat list kept for any code that still uses it
export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_SECTIONS.flatMap(
  (s) => s.items,
);
