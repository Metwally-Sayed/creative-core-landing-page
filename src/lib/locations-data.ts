import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";

export interface Location {
  id: string;
  name: string;
  country: string;
  address_lines: string[];
  email: string;
  map_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const getLocations = unstable_cache(
  async (): Promise<Location[]> => {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data as Location[];
  },
  ["locations"],
  { revalidate: 60, tags: ["locations"] }
);
