"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { adminExists, createAdminUser } from "@/lib/admin-users";
import { redirect } from "next/navigation";

const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupState = {
  error: string | null;
  fieldErrors?: Record<string, string>;
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  // Block if admin already exists
  const exists = await adminExists();
  if (exists) {
    return { error: "An admin account already exists. Please log in." };
  }

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      fieldErrors[key] = issue.message;
    }
    return { error: null, fieldErrors };
  }

  const { email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await createAdminUser(email, passwordHash);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create account";
    return { error: msg };
  }

  redirect("/admin/login");
}
