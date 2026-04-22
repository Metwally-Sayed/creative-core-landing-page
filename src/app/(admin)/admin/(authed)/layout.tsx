import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";
import { getSettings } from "@/lib/page-data";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const settings = await getSettings();

  return (
    <>
      <div
        data-admin
        className="flex min-h-screen bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]"
      >
        <Sidebar settings={settings} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar email={session.user.email} />
          <main className="flex-1 overflow-auto p-6 md:p-8">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
      {/*
        Dedicated portal root for admin modals (MediaPickerModal etc.).
        Sits at the body level, OUTSIDE the admin flex layout, so it is never
        affected by Radix scroll-lock transforms or overflow constraints.
        data-admin ensures all --admin-* CSS variables are available inside it.
      */}
      <div id="admin-modal-root" data-admin aria-hidden="true" />
    </>
  );
}
