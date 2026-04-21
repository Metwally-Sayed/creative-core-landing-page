/** Server-only: never import from Client Components. */

import { supabase } from "./supabase";

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

/** Returns the single admin user, or null if none has been created yet. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as AdminUser;
}

/** Returns true if an admin account already exists. */
export async function adminExists(): Promise<boolean> {
  const { count } = await supabase
    .from("admin_users")
    .select("id", { count: "exact", head: true });

  return (count ?? 0) > 0;
}

/** Creates the first (and only) admin user. Throws if one already exists. */
export async function createAdminUser(
  email: string,
  passwordHash: string,
): Promise<void> {
  const { error } = await supabase
    .from("admin_users")
    .insert({ email, password_hash: passwordHash });

  if (error) {
    throw new Error(error.message);
  }
}
