import Link from "next/link";
import { listProjects } from "./actions";
import ProjectsList from "./ProjectsList";

export default async function AdminProjectsPage() {
  const projects = await listProjects();
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[hsl(var(--admin-text))]">
          Projects
        </h1>
        <Link
          href="/admin/projects/new"
          className="rounded-lg bg-[hsl(var(--admin-accent))] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + New
        </Link>
      </div>
      <ProjectsList initialProjects={projects} />
    </div>
  );
}
