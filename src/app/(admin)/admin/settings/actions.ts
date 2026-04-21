"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
import type { SiteSettings } from "@/lib/page-data";
import { DEFAULT_SETTINGS } from "@/lib/page-data";

export async function getSettingsAdmin(): Promise<SiteSettings> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error || !data) return DEFAULT_SETTINGS;
  return data as SiteSettings;
}

export async function updateSettings(
  input: Omit<SiteSettings, "id">
): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase
    .from("site_settings")
    .update(input)
    .eq("id", 1);
  if (error) throw error;

  revalidateTag("settings");
}
