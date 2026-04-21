"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import type {
  PageSummaryDb,
  PageFullDb,
  PageInput,
  PageFullInput,
} from "@/lib/page-data";

export async function listPages(): Promise<PageSummaryDb[]> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("pages")
    .select("id, slug, title, published, sort_order")
    .order("sort_order");
  if (error) throw error;
  return data as PageSummaryDb[];
}

export async function getPageAdmin(id: string): Promise<PageFullDb> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: row, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !row) throw new Error("Page not found");

  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_id", id)
    .order("sort_order");

  return { ...row, sections: sections ?? [] } as PageFullDb;
}

export async function createPage(input: PageInput): Promise<string> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("pages")
    .insert({ title: input.title, slug: input.slug })
    .select("id")
    .single();
  if (error) throw error;

  revalidateTag("pages", "max");
  return data.id;
}

export async function updatePage(
  id: string,
  input: PageFullInput
): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error: pageErr } = await supabase
    .from("pages")
    .update({
      title: input.title,
      slug: input.slug,
      meta_title: input.meta_title,
      meta_description: input.meta_description,
      og_image_url: input.og_image_url,
      published: input.published,
      translations: input.translations ?? {},
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (pageErr) throw pageErr;

  const { error: delErr } = await supabase
    .from("page_sections")
    .delete()
    .eq("page_id", id);
  if (delErr) throw delErr;

  if (input.sections.length > 0) {
    const rows = input.sections.map((s, i) => ({
      page_id: id,
      type: s.type,
      content: s.content,
      translations: s.translations ?? {},
      sort_order: i,
    }));
    const { error: insErr } = await supabase
      .from("page_sections")
      .insert(rows);
    if (insErr) throw insErr;
  }

  revalidateTag("pages", "max");
}

export async function deletePage(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) throw error;

  revalidateTag("pages", "max");
}

export async function togglePublished(
  id: string,
  published: boolean
): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase
    .from("pages")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  revalidateTag("pages", "max");
}

export async function reorderPages(ids: string[]): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  await Promise.all(
    ids.map((id, i) =>
      supabase.from("pages").update({ sort_order: i }).eq("id", id)
    )
  );
  revalidateTag("pages", "max");
}

export async function createPageAndRedirect(input: PageInput): Promise<never> {
  const id = await createPage(input);
  redirect(`/admin/pages/${id}`);
}
