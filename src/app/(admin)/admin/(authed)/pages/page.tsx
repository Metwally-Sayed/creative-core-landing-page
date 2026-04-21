import Link from "next/link";
import { listPages } from "./actions";
import PagesList from "./PagesList";
import ClientOnly from "@/components/admin/ClientOnly";

export default async function AdminPagesPage() {
  const pages = await listPages();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pages</h1>
        <Link
          href="/admin/pages/new"
          className="rounded-md bg-[hsl(var(--admin-accent))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          + New Page
        </Link>
      </div>
      {pages.length === 0 ? (
        <p className="text-sm text-[hsl(var(--admin-text-muted))]">
          No pages yet. Create your first page.
        </p>
      ) : (
        <ClientOnly>
          <PagesList initialPages={pages} />
        </ClientOnly>
      )}
    </>
  );
}
