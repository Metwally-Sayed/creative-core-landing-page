import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";

export interface FaqItemDb {
  id: string;
  question: string;
  answer: string;
  preview: string;
  deliverables: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const getFaqItems = unstable_cache(
  async (): Promise<FaqItemDb[]> => {
    const { data, error } = await supabase
      .from("faq_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data as FaqItemDb[];
  },
  ["faq"],
  { revalidate: 60, tags: ["faq"] }
);
