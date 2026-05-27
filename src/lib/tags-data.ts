import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";

export interface TagDb {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  sort_order: number;
}

export const getTags = unstable_cache(
  async (): Promise<TagDb[]> => {
    const { data, error } = await supabase
      .from("tags")
      .select("id, slug, title_en, title_ar, sort_order")
      .order("sort_order");
    // Return empty array if table doesn't exist yet (migration not yet applied)
    if (error) return [];
    return data as TagDb[];
  },
  ["tags"],
  { tags: ["tags"], revalidate: 3600 }
);
