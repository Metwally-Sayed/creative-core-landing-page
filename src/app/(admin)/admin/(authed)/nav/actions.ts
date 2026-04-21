"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
export interface NavLinkInput {
  label_en: string;
  label_ar: string;
  href: string;
}

export async function listNavLinks(): Promise<NavLink[]> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");
  const { data, error } = await supabase
    .from("nav_links")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data as NavLink[];
}

export async function createNavLink(input: NavLinkInput): Promise<NavLink> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: maxRow } = await supabase
    .from("nav_links")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("nav_links")
    .insert({ ...input, sort_order, enabled: true })
    .select()
    .single();
  if (error) throw error;
  revalidateTag("nav_links", "max");
  return data as NavLink;
}

export async function updateNavLink(
  id: string,
  patch: Partial<NavLinkInput & { enabled: boolean }>
): Promise<NavLink> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("nav_links")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidateTag("nav_links", "max");
  return data as NavLink;
}

export async function deleteNavLink(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase.from("nav_links").delete().eq("id", id);
  if (error) throw error;
  revalidateTag("nav_links", "max");
}

export async function reorderNavLinks(orderedIds: string[]): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("nav_links").update({ sort_order: index }).eq("id", id)
    )
  );
  revalidateTag("nav_links", "max");
}
