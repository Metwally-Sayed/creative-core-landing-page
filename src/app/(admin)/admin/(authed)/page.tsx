import Link from "next/link";
import Image from "next/image";
import { Plus, Upload, ArrowUpRight, FolderKanban, Image as ImageIcon, HelpCircle, FileText } from "lucide-react";
import { getDashboardStats } from "@/lib/page-data";

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const pendingTasks = [
    {
      value: String(stats.projectsDraft),
      label: "Draft projects",
      note: "Awaiting review",
    },
    {
      value: String(stats.projectsPublished),
      label: "Published",
      note: `of ${stats.projectsTotal} total`,
    },
    {
      value: String(stats.faqTotal),
      label: "FAQ items",
      note: "Questions live",
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      {/* ── Page head ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p
            className="text-[11px] font-semibold uppercase "
            style={{ color: "hsl(var(--admin-text-muted))" }}
          >
            Dashboard
          </p>
          <h1
            className="mt-2 text-[44px] font-semibold leading-[1.0] -0.025em]"
            style={{
              fontFamily: "var(--font-serif)",
              color: "hsl(var(--admin-navy-ink))",
            }}
          >
            {greeting}.{" "}
            <span
              className="italic font-medium"
              style={{ color: "hsl(var(--admin-navy-ink) / 0.32)" }}
            >
              Here&apos;s what&apos;s happening.
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/media"
            className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.78)",
              border: "1px solid hsl(var(--admin-border))",
              color: "hsl(var(--admin-navy-ink))",
            }}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden />
            Upload media
          </Link>
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: "hsl(var(--admin-orange))",
              boxShadow: "0 8px 22px hsl(var(--admin-orange) / 0.28)",
            }}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            New project
          </Link>
        </div>
      </div>

      {/* ── Top row: navy card + stat tiles ── */}
      <div className="grid grid-cols-[1.35fr_1fr] gap-5">
        {/* Navy greeting card */}
        <div
          className="relative overflow-hidden rounded-[28px] p-8"
          style={{
            background:
              "linear-gradient(140deg, hsl(var(--admin-navy-ink)) 0%, hsl(var(--admin-navy)) 100%)",
            boxShadow: "0 24px 70px hsl(var(--admin-navy-ink) / 0.14)",
          }}
        >
          {/* Sparkle */}
          <svg
            className="absolute right-7 top-7 opacity-35"
            width="26"
            height="26"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M8 1v4M8 11v4M1 8h4M11 8h4"
              stroke="hsl(var(--admin-orange))"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* Stats row */}
          <div className="flex gap-8">
            {pendingTasks.map((t) => (
              <div key={t.label} className="flex-1">
                <div
                  className="text-[42px] font-semibold leading-none "
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "hsl(var(--admin-orange))",
                  }}
                >
                  {t.value}
                </div>
                <div
                  className="mt-2.5 text-[11px] font-semibold uppercase 0.22em]"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {t.label}
                </div>
                <div
                  className="mt-1 text-[12px]"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {t.note}
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            className="my-6"
            style={{ height: 1, background: "rgba(255,255,255,0.10)" }}
          />

          {/* Quick actions */}
          <div className="flex gap-3">
            <Link
              href="/admin/projects/new"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                background: "hsl(var(--admin-orange))",
                boxShadow: "0 4px 12px hsl(var(--admin-orange) / 0.3)",
              }}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              New project
            </Link>
            <Link
              href="/admin/media"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-opacity hover:opacity-90"
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
              }}
            >
              <Upload className="h-3.5 w-3.5" aria-hidden />
              Upload media
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-opacity hover:opacity-90"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              View site
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Stat tiles column */}
        <div className="flex flex-col gap-4">
          {/* Media count */}
          <div
            className="flex items-center gap-5 rounded-[22px] p-5"
            style={{
              background: "#fff",
              border: "1px solid hsl(var(--admin-border))",
              boxShadow: "0 14px 40px hsl(var(--admin-navy-ink) / 0.05)",
            }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "hsl(var(--admin-orange) / 0.10)" }}
            >
              <ImageIcon
                className="h-5 w-5"
                style={{ color: "hsl(var(--admin-orange))" }}
                aria-hidden
              />
            </div>
            <div>
              <p
                className="text-[11px] font-semibold uppercase 0.22em]"
                style={{ color: "hsl(var(--admin-text-muted))" }}
              >
                Media assets
              </p>
              <p
                className="mt-0.5 text-[36px] font-semibold leading-none -0.03em]"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "hsl(var(--admin-navy-ink))",
                }}
              >
                {stats.mediaTotal.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Pages count */}
          <div
            className="flex items-center gap-5 rounded-[22px] p-5"
            style={{
              background: "#fff",
              border: "1px solid hsl(var(--admin-border))",
              boxShadow: "0 14px 40px hsl(var(--admin-navy-ink) / 0.05)",
            }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "hsl(var(--admin-navy) / 0.08)" }}
            >
              <FileText
                className="h-5 w-5"
                style={{ color: "hsl(var(--admin-navy))" }}
                aria-hidden
              />
            </div>
            <div>
              <p
                className="text-[11px] font-semibold uppercase 0.22em]"
                style={{ color: "hsl(var(--admin-text-muted))" }}
              >
                Pages
              </p>
              <p
                className="mt-0.5 text-[36px] font-semibold leading-none -0.03em]"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "hsl(var(--admin-navy-ink))",
                }}
              >
                {stats.pagesTotal}
              </p>
            </div>
          </div>

          {/* FAQ count */}
          <div
            className="flex items-center gap-5 rounded-[22px] p-5"
            style={{
              background: "#fff",
              border: "1px solid hsl(var(--admin-border))",
              boxShadow: "0 14px 40px hsl(var(--admin-navy-ink) / 0.05)",
            }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "hsl(222 50% 96%)" }}
            >
              <HelpCircle
                className="h-5 w-5"
                style={{ color: "hsl(var(--admin-navy))" }}
                aria-hidden
              />
            </div>
            <div>
              <p
                className="text-[11px] font-semibold uppercase 0.22em]"
                style={{ color: "hsl(var(--admin-text-muted))" }}
              >
                FAQ items
              </p>
              <p
                className="mt-0.5 text-[36px] font-semibold leading-none -0.03em]"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "hsl(var(--admin-navy-ink))",
                }}
              >
                {stats.faqTotal}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent projects ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p
              className="text-[11px] font-semibold uppercase "
              style={{ color: "hsl(var(--admin-text-muted))" }}
            >
              Recent projects
            </p>
            <h2
              className="mt-1 text-[26px] font-semibold -0.02em]"
              style={{
                fontFamily: "var(--font-serif)",
                color: "hsl(var(--admin-navy-ink))",
              }}
            >
              In flight.{" "}
              <span
                className="italic font-medium"
                style={{ color: "hsl(var(--admin-navy-ink) / 0.35)" }}
              >
                Last updated.
              </span>
            </h2>
          </div>
          <Link
            href="/admin/projects"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-all hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.78)",
              border: "1px solid hsl(var(--admin-border))",
              color: "hsl(var(--admin-navy-ink))",
            }}
          >
            View all
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        {stats.recentProjects.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-[22px] py-16 text-center"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px dashed hsl(var(--admin-border))",
            }}
          >
            <FolderKanban
              className="mb-3 h-10 w-10 opacity-25"
              style={{ color: "hsl(var(--admin-navy-ink))" }}
              aria-hidden
            />
            <p
              className="text-[14px] font-semibold"
              style={{ color: "hsl(var(--admin-navy-ink))" }}
            >
              No projects yet
            </p>
            <p
              className="mt-1 text-[13px]"
              style={{ color: "hsl(var(--admin-text-muted))" }}
            >
              Create your first project to see it here.
            </p>
            <Link
              href="/admin/projects/new"
              className="mt-5 flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white"
              style={{ background: "hsl(var(--admin-orange))" }}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              New project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 xl:grid-cols-6">
            {stats.recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="group relative overflow-hidden rounded-[18px] transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background: "#fff",
                  border: "1px solid hsl(var(--admin-border))",
                }}
              >
                {/* Cover image */}
                <div className="relative overflow-hidden" style={{ paddingBottom: "75%" }}>
                  {project.cover_image_url ? (
                    <Image
                      src={project.cover_image_url}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1280px) 33vw, 16vw"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "hsl(var(--admin-bg))" }}
                    >
                      <FolderKanban
                        className="h-8 w-8 opacity-20"
                        style={{ color: "hsl(var(--admin-navy-ink))" }}
                        aria-hidden
                      />
                    </div>
                  )}
                  {/* Status badge */}
                  <div className="absolute left-2.5 top-2.5">
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                      style={
                        project.published
                          ? {
                              background: "rgba(45,125,79,0.15)",
                              color: "#2D7D4F",
                            }
                          : {
                              background: "rgba(255,255,255,0.92)",
                              color: "hsl(var(--admin-navy-ink))",
                            }
                      }
                    >
                      {project.published ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3.5">
                  <p
                    className="truncate text-[13.5px] font-semibold leading-tight -0.01em]"
                    style={{
                      fontFamily: "var(--font-serif)",
                      color: "hsl(var(--admin-navy-ink))",
                    }}
                  >
                    {project.title}
                  </p>
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: "hsl(var(--admin-text-muted))" }}
                  >
                    {timeAgo(project.updated_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
