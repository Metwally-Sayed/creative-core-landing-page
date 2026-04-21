import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { adminExists } from "@/lib/admin-users";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  // Already logged in → go to dashboard
  const session = await auth();
  if (session) redirect("/admin");

  // Admin already exists → go to login
  const exists = await adminExists();
  if (exists) redirect("/admin/login");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[hsl(var(--admin-bg))] p-4">
      <SignupForm />
    </main>
  );
}
