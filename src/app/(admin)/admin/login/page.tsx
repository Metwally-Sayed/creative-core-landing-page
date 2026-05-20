import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSettings } from "@/lib/page-data";
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

  const [params, settings] = await Promise.all([
    searchParams,
    getSettings(),
  ]);

  const from = params.from ?? "/admin";

  return (
    <LoginForm
      from={from}
      logoUrl={settings.logo_url || undefined}
      siteName={settings.site_name || "Creative Core"}
    />
  );
}
