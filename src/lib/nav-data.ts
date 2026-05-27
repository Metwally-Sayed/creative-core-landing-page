import { cache } from "react";
import { supabase } from "@/lib/supabase";

export interface NavLink {
  id: string;
  label_en: string;
  label_ar: string;
  href: string;
  sort_order: number;
  enabled: boolean;
}

/** Public fetch — only enabled links, ordered by sort_order. Per-request dedup. */
export const getNavLinks = cache(async (): Promise<NavLink[]> => {
  const { data, error } = await supabase
    .from("nav_links")
    .select("*")
    .eq("enabled", true)
    .order("sort_order");
  if (error) throw error;
  return data as NavLink[];
});

/** Admin fetch — all links including disabled. */
export async function getNavLinksAdmin(): Promise<NavLink[]> {
  const { data, error } = await supabase
    .from("nav_links")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data as NavLink[];
}
