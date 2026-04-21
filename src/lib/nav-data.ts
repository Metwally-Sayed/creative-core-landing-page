import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";

export interface NavLink {
  id: string;
  label_en: string;
  label_ar: string;
  href: string;
  sort_order: number;
  enabled: boolean;
}

/** Public cached fetch — only enabled links, ordered by sort_order. */
export const getNavLinks = unstable_cache(
  async (): Promise<NavLink[]> => {
    const { data, error } = await supabase
      .from("nav_links")
      .select("*")
      .eq("enabled", true)
      .order("sort_order");
    if (error) throw error;
    return data as NavLink[];
  },
  ["nav_links"],
  { revalidate: 60, tags: ["nav_links"] }
);

/** Admin fetch — all links including disabled. */
export async function getNavLinksAdmin(): Promise<NavLink[]> {
  const { data, error } = await supabase
    .from("nav_links")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data as NavLink[];
}
