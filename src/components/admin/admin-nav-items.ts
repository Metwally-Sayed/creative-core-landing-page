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
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Locations", href: "/admin/locations", icon: MapPin },
  { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Navigation", href: "/admin/nav", icon: Menu },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
