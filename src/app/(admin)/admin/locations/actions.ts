"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";

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

export interface LocationInput {
  name: string;
  country: string;
  address_lines: string[];
  email: string;
  map_url: string;
}

export async function listLocations(): Promise<Location[]> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as Location[];
}

export async function createLocation(input: LocationInput): Promise<Location> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: maxRow } = await supabase
    .from("locations")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("locations")
    .insert({ ...input, sort_order })
    .select()
    .single();
  if (error) throw error;
  revalidateTag("locations", "max");
  return data as Location;
}

export async function updateLocation(
  id: string,
  patch: Partial<LocationInput>
): Promise<Location> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("locations")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidateTag("locations", "max");
  return data as Location;
}

export async function deleteLocation(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) throw error;
  revalidateTag("locations", "max");
}

export async function reorderLocations(orderedIds: string[]): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("locations").update({ sort_order: index }).eq("id", id)
    )
  );
  revalidateTag("locations", "max");
}
