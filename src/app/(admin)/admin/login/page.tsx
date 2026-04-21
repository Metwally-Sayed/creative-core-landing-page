import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await auth();
  if (session) {
    redirect("/admin");
  }

  const params = await searchParams;
  const from = params.from ?? "/admin";

  return <LoginForm from={from} />;
}
