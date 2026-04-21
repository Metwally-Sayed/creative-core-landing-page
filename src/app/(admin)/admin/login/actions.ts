"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error: string | null };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const from = formData.get("from");

  const redirectTo =
    typeof from === "string" && from.startsWith("/admin") && from !== "/admin/login"
      ? from
      : "/admin";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}
