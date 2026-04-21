// src/app/(admin)/admin/projects/actions.ts
"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
import type {
  ProjectSummaryDb,
  ProjectFullDb,
  ProjectSectionDb,
  ProjectGalleryDb,
  ProjectFactDb,
  ProjectProcessDb,
  ProjectInput,
  ProjectFullInput,
} from "@/lib/project-data";

const SUMMARY_COLS =
  "id, slug, title, tags, aspect_ratio, cover_image_url, published, sort_order, service_type, work_filters, featured_aspect_ratio, inherit_theme_from_palette, theme_palette, translations";

export async function listProjects(): Promise<ProjectSummaryDb[]> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("projects")
    .select(SUMMARY_COLS)
    .order("sort_order");
  if (error) throw error;
  return data as ProjectSummaryDb[];
}

export async function getProject(id: string): Promise<ProjectFullDb> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: row, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !row) throw new Error("Project not found");

  const [sections, gallery, metrics, credits, overview, process, related] =
    await Promise.all([
      supabase
        .from("project_sections")
        .select("*")
        .eq("project_id", id)
        .order("sort_order")
        .then((r) => (r.data ?? []) as ProjectSectionDb[]),
      supabase
        .from("project_gallery")
        .select("*")
        .eq("project_id", id)
        .order("sort_order")
        .then((r) => (r.data ?? []) as ProjectGalleryDb[]),
      supabase
        .from("project_metrics")
        .select("*")
        .eq("project_id", id)
        .order("sort_order")
        .then((r) => (r.data ?? []) as ProjectFactDb[]),
      supabase
        .from("project_credits")
        .select("*")
        .eq("project_id", id)
        .order("sort_order")
        .then((r) => (r.data ?? []) as ProjectFactDb[]),
      supabase
        .from("project_overview")
        .select("*")
        .eq("project_id", id)
        .order("sort_order")
        .then((r) => (r.data ?? []) as ProjectFactDb[]),
      supabase
        .from("project_process")
        .select("*")
        .eq("project_id", id)
        .order("sort_order")
        .then((r) => (r.data ?? []) as ProjectProcessDb[]),
      supabase
        .from("project_related")
        .select("related_project_id")
        .eq("project_id", id)
        .order("sort_order")
        .then((r) =>
          (r.data ?? []).map(
            (x: { related_project_id: string }) => x.related_project_id
          )
        ),
    ]);

  return {
    ...row,
    sections,
    gallery,
    metrics,
    credits,
    overview,
    process,
    related_ids: related,
  } as ProjectFullDb;
}

export async function createProject(
  input: ProjectInput
): Promise<ProjectSummaryDb> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: maxRow } = await supabase
    .from("projects")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...input, sort_order })
    .select(SUMMARY_COLS)
    .single();
  if (error) throw error;
  revalidateTag("projects", "max");
  return data as ProjectSummaryDb;
}

export async function updateProject(
  id: string,
  input: ProjectFullInput
): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error: mainErr } = await supabase
    .from("projects")
    .update({
      title: input.title,
      slug: input.slug,
      tags: input.tags,
      aspect_ratio: input.aspect_ratio,
      cover_image_url: input.cover_image_url,
      published: input.published,
      service_type: input.service_type,
      work_filters: input.work_filters,
      featured_aspect_ratio: input.featured_aspect_ratio,
      inherit_theme_from_palette: input.inherit_theme_from_palette,
      theme_palette: input.theme_palette,
      hero_label: input.hero_label,
      hero_title: input.hero_title,
      hero_subtitle: input.hero_subtitle,
      hero_summary: input.hero_summary,
      hero_image_url: input.hero_image_url,
      client: input.client,
      project_type: input.project_type,
      deliverables: input.deliverables,
      launch_label: input.launch_label,
      launch_url: input.launch_url,
      intro: input.intro,
      showcase_image_url: input.showcase_image_url,
      showcase_alt: input.showcase_alt,
      showcase_label: input.showcase_label,
      feature_eyebrow: input.feature_eyebrow,
      feature_title: input.feature_title,
      feature_body: input.feature_body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (mainErr) throw mainErr;

  await Promise.all([
    (async () => {
      const { error } = await supabase
        .from("project_sections")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
      if (input.sections.length) {
        const { error: e } = await supabase.from("project_sections").insert(
          input.sections.map((s, i) => ({ ...s, project_id: id, sort_order: i }))
        );
        if (e) throw e;
      }
    })(),
    (async () => {
      const { error } = await supabase
        .from("project_gallery")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
      if (input.gallery.length) {
        const { error: e } = await supabase.from("project_gallery").insert(
          input.gallery.map((g, i) => ({ ...g, project_id: id, sort_order: i }))
        );
        if (e) throw e;
      }
    })(),
    (async () => {
      const { error } = await supabase
        .from("project_metrics")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
      if (input.metrics.length) {
        const { error: e } = await supabase.from("project_metrics").insert(
          input.metrics.map((m, i) => ({ ...m, project_id: id, sort_order: i }))
        );
        if (e) throw e;
      }
    })(),
    (async () => {
      const { error } = await supabase
        .from("project_credits")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
      if (input.credits.length) {
        const { error: e } = await supabase.from("project_credits").insert(
          input.credits.map((c, i) => ({ ...c, project_id: id, sort_order: i }))
        );
        if (e) throw e;
      }
    })(),
    (async () => {
      const { error } = await supabase
        .from("project_overview")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
      if (input.overview.length) {
        const { error: e } = await supabase.from("project_overview").insert(
          input.overview.map((o, i) => ({ ...o, project_id: id, sort_order: i }))
        );
        if (e) throw e;
      }
    })(),
    (async () => {
      const { error } = await supabase
        .from("project_process")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
      if (input.process.length) {
        const { error: e } = await supabase.from("project_process").insert(
          input.process.map((ph, i) => ({ ...ph, project_id: id, sort_order: i }))
        );
        if (e) throw e;
      }
    })(),
    (async () => {
      const { error } = await supabase
        .from("project_related")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
      if (input.related_ids.length) {
        const { error: e } = await supabase.from("project_related").insert(
          input.related_ids.map((rid, i) => ({
            project_id: id,
            related_project_id: rid,
            sort_order: i,
          }))
        );
        if (e) throw e;
      }
    })(),
  ]);

  revalidateTag("projects", "max");
}

export async function deleteProject(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
  revalidateTag("projects", "max");
}

export async function reorderProjects(orderedIds: string[]): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  await Promise.all(
    orderedIds.map(async (id, index) => {
      const { error } = await supabase
        .from("projects")
        .update({ sort_order: index })
        .eq("id", id);
      if (error) throw error;
    })
  );
  revalidateTag("projects", "max");
}

export async function togglePublished(
  id: string,
  published: boolean
): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase
    .from("projects")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidateTag("projects", "max");
}
