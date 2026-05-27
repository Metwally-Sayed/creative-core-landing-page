"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
import type { TagDb } from "@/lib/tags-data";

export interface TagInput {
  slug: string;
  title_en: string;
  title_ar: string;
}

export async function listTags(): Promise<TagDb[]> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");
  const { data, error } = await supabase
    .from("tags")
    .select("id, slug, title_en, title_ar, sort_order")
    .order("sort_order");
  if (error) return [];
  return data as TagDb[];
}

export async function createTag(input: TagInput): Promise<TagDb> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: maxRow } = await supabase
    .from("tags")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("tags")
    .insert({ ...input, sort_order })
    .select()
    .single();
  if (error) throw error;
  revalidateTag("tags", "max");
  return data as TagDb;
}

export async function updateTag(id: string, input: TagInput): Promise<TagDb> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("tags")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidateTag("tags", "max");
  return data as TagDb;
}

export async function deleteTag(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw error;
  revalidateTag("tags", "max");
}

export async function reorderTags(orderedIds: string[]): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  await Promise.all(
    orderedIds.map(async (id, index) => {
      const { error } = await supabase
        .from("tags")
        .update({ sort_order: index })
        .eq("id", id);
      if (error) throw error;
    })
  );
  revalidateTag("tags", "max");
}
