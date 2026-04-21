"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  preview: string;
  deliverables: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FaqItemInput {
  question: string;
  answer: string;
  preview?: string;
  deliverables?: string[];
}

export async function listFaqItems(): Promise<FaqItem[]> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");
  const { data, error } = await supabase
    .from("faq_items")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as FaqItem[];
}

export async function createFaqItem(input: FaqItemInput): Promise<FaqItem> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: maxRow } = await supabase
    .from("faq_items")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("faq_items")
    .insert({ ...input, sort_order })
    .select()
    .single();
  if (error) throw error;
  revalidateTag("faq", "max");
  return data as FaqItem;
}

export async function updateFaqItem(
  id: string,
  patch: Partial<FaqItemInput>
): Promise<FaqItem> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("faq_items")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidateTag("faq", "max");
  return data as FaqItem;
}

export async function deleteFaqItem(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase.from("faq_items").delete().eq("id", id);
  if (error) throw error;
  revalidateTag("faq", "max");
}

export async function reorderFaqItems(orderedIds: string[]): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  await Promise.all(
    orderedIds.map(async (id, index) => {
      const { error } = await supabase
        .from("faq_items")
        .update({ sort_order: index })
        .eq("id", id);
      if (error) throw error;
    })
  );
  revalidateTag("faq", "max");
}
