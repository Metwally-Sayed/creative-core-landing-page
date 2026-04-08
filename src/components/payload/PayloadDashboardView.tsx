import Link from "next/link";
import type { AdminViewServerProps, CollectionSlug } from "payload";
import {
  ArrowRight,
  FileImage,
  FolderKanban,
  Globe,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

type DashboardSummary = {
  createHref: string;
  description: string;
  docs: Array<Record<string, unknown>>;
  href: string;
  slug: CollectionSlug;
  title: string;
  totalDocs: number;
};

type DashboardViewProps = AdminViewServerProps & {
  payload?: AdminViewServerProps["initPageResult"]["req"]["payload"];
  user?: AdminViewServerProps["initPageResult"]["req"]["user"];
  visibleEntities?: {
    collections?: CollectionSlug[];
  };
};

const collectionMeta: Record<
  "media" | "projects" | "users",
  {
    description: string;
    title: string;
  }
> = {
  media: {
    description: "Hero images, gallery assets, and supporting visuals for the site.",
    title: "Media Library",
  },
  projects: {
    description: "Case studies, launches, and flagship work featured across the website.",
    title: "Projects",
  },
  users: {
    description: "Editors and admins who shape the site and maintain publishing flow.",
    title: "Team",
  },
};

const collectionIcons = {
  media: FileImage,
  projects: FolderKanban,
  users: Users,
} as const;

function buildAdminHref(adminRoute: string, path: string): string {
  return `${adminRoute}${path.startsWith("/") ? path : `/${path}`}`;
}

function formatDate(date?: string | null): string {
  if (!date) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getDocumentLabel(slug: CollectionSlug, doc: Record<string, unknown>): string {
  if (slug === "projects") {
    return String(doc.title || doc.slug || "Untitled project");
  }

  if (slug === "media") {
    return String(doc.alt || doc.filename || "Untitled asset");
  }

  return String(doc.name || doc.email || "Untitled user");
}

function getDocumentMeta(slug: CollectionSlug, doc: Record<string, unknown>): string {
  if (slug === "projects") {
    return String(doc.summary || doc.slug || "Ready to feature on the site");
  }

  if (slug === "media") {
    return String(doc.filename || "Stored in the media library");
  }

  return String(doc.email || doc.role || "CMS account");
}

async function getCollectionSummary(
  props: DashboardViewProps,
  slug: keyof typeof collectionMeta,
): Promise<DashboardSummary | null> {
  const visibleCollections =
    props.visibleEntities?.collections ?? props.initPageResult.visibleEntities?.collections ?? [];

  if (!visibleCollections.includes(slug)) {
    return null;
  }

  const adminRoute = props.initPageResult.req.payload.config.routes.admin;
  const payload = props.payload ?? props.initPageResult.req.payload;
  const req = props.initPageResult.req;

  try {
    const [{ totalDocs }, { docs }] = await Promise.all([
      payload.count({
        collection: slug,
        req,
      }),
      payload.find({
        collection: slug,
        depth: 0,
        limit: 4,
        req,
        sort: "-updatedAt",
      }),
    ]);

    return {
      createHref: buildAdminHref(adminRoute, `/collections/${slug}/create`),
      description: collectionMeta[slug].description,
      docs,
      href: buildAdminHref(adminRoute, `/collections/${slug}`),
      slug,
      title: collectionMeta[slug].title,
      totalDocs,
    };
  } catch {
    return {
      createHref: buildAdminHref(adminRoute, `/collections/${slug}/create`),
      description: collectionMeta[slug].description,
      docs: [],
      href: buildAdminHref(adminRoute, `/collections/${slug}`),
      slug,
      title: collectionMeta[slug].title,
      totalDocs: 0,
    };
  }
}

export default async function PayloadDashboardView(props: DashboardViewProps) {
  const adminRoute = props.initPageResult.req.payload.config.routes.admin;
  const user = props.user ?? props.initPageResult.req.user;

  const summaries = (
    await Promise.all([
      getCollectionSummary(props, "projects"),
      getCollectionSummary(props, "media"),
      getCollectionSummary(props, "users"),
    ])
  ).filter((summary): summary is DashboardSummary => Boolean(summary));

  const totalDocs = summaries.reduce((sum, summary) => sum + summary.totalDocs, 0);

  const recentEntries = summaries
    .flatMap((summary) =>
      summary.docs.map((doc) => ({
        collectionTitle: summary.title,
        href: summary.href,
        label: getDocumentLabel(summary.slug, doc),
        meta: getDocumentMeta(summary.slug, doc),
        slug: summary.slug,
        updatedAt: typeof doc.updatedAt === "string" ? doc.updatedAt : null,
      })),
    )
    .sort((a, b) => {
      const left = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const right = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;

      return right - left;
    })
    .slice(0, 5);

  const leadEntry = recentEntries[0];

  return (
    <div className="dashboard-shell space-y-6 pb-10">
      <section className="site-card-solid relative overflow-hidden p-7 md:p-9 xl:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(157,172,255,0.22),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(255,181,123,0.22),_transparent_34%)]" />
        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.7fr)]">
          <div className="space-y-5">
            <div className="eyebrow">Hello Monday CMS</div>
            <div className="max-w-3xl space-y-3">
              <h1 className="text-[clamp(2.3rem,4vw,4.6rem)] leading-[0.95] text-[hsl(var(--primary))]">
                Editorial command center for the site.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[hsl(var(--foreground))]/78 md:text-lg">
                Create projects, upload media, and manage your publishing flow from a dashboard
                that uses the same visual system as the public website.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="btn-primary gap-2"
                href={buildAdminHref(adminRoute, "/collections/projects/create")}
              >
                <Plus className="h-4 w-4" />
                Create Project
              </Link>
              <Link
                className="btn-outline gap-2"
                href={buildAdminHref(adminRoute, "/collections/media/create")}
              >
                <FileImage className="h-4 w-4" />
                Upload Media
              </Link>
              <Link className="btn-outline gap-2" href="/">
                <Globe className="h-4 w-4" />
                View Website
              </Link>
            </div>
          </div>

          <div className="site-card flex h-full flex-col justify-between gap-5 border-white/70 bg-white/82 p-5 md:p-6">
            <div className="space-y-2">
              <div className="eyebrow">Latest Pulse</div>
              <h2 className="text-3xl leading-[1.02] text-[hsl(var(--primary))]">
                {leadEntry ? leadEntry.label : "Fresh dashboard, ready for content."}
              </h2>
              <p className="text-sm leading-6 text-[hsl(var(--foreground))]/75">
                {leadEntry
                  ? `${leadEntry.collectionTitle} was last updated on ${formatDate(leadEntry.updatedAt)}.`
                  : "Start by adding your first project or media asset to populate recent activity."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[hsl(var(--border))]/55 bg-white/85 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                  Total Content
                </div>
                <div className="mt-2 text-3xl font-semibold text-[hsl(var(--primary))]">
                  {totalDocs}
                </div>
              </div>
              <div className="rounded-xl border border-[hsl(var(--border))]/55 bg-white/85 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                  Collections
                </div>
                <div className="mt-2 text-3xl font-semibold text-[hsl(var(--primary))]">
                  {summaries.length}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[hsl(var(--border))]/55 bg-[hsl(var(--primary))] px-4 py-4 text-white shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                <Sparkles className="h-4 w-4" />
                Welcome
              </div>
              <p className="mt-2 text-sm leading-6 text-white/82">
                {`Signed in as ${String(user?.email || "your team account")}. Keep the public site polished while managing everything from one place.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 px-2 md:px-3 xl:grid-cols-4 md:grid-cols-2">
        <div className="site-card-solid p-5">
          <div className="eyebrow">Projects</div>
          <div className="mt-3 text-4xl font-semibold text-[hsl(var(--primary))]">
            {summaries.find((summary) => summary.slug === "projects")?.totalDocs ?? 0}
          </div>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--foreground))]/72">
            Portfolio entries and case studies ready to publish.
          </p>
        </div>

        <div className="site-card-solid p-5">
          <div className="eyebrow">Media</div>
          <div className="mt-3 text-4xl font-semibold text-[hsl(var(--primary))]">
            {summaries.find((summary) => summary.slug === "media")?.totalDocs ?? 0}
          </div>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--foreground))]/72">
            Visual assets available for hero sections and story pages.
          </p>
        </div>

        <div className="site-card-solid p-5">
          <div className="eyebrow">Team</div>
          <div className="mt-3 text-4xl font-semibold text-[hsl(var(--primary))]">
            {summaries.find((summary) => summary.slug === "users")?.totalDocs ?? 0}
          </div>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--foreground))]/72">
            Editors and admins collaborating inside the CMS.
          </p>
        </div>

        <div className="site-card-solid p-5">
          <div className="eyebrow">Activity</div>
          <div className="mt-3 text-4xl font-semibold text-[hsl(var(--primary))]">
            {recentEntries.length}
          </div>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--foreground))]/72">
            Recently touched items surfaced for quick follow-up.
          </p>
        </div>
      </section>

      <section className="grid gap-5 px-2 md:px-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="site-card-solid p-6 md:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Collections</div>
              <h2 className="mt-2 text-4xl leading-[1.02] text-[hsl(var(--primary))]">
                Workspaces for every content stream.
              </h2>
            </div>
            <Link
              className="hidden text-sm font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--secondary))] md:inline-flex"
              href={buildAdminHref(adminRoute, "/collections/projects")}
            >
              Open all
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {summaries.map((summary) => {
              const Icon = collectionIcons[summary.slug as keyof typeof collectionIcons];

              return (
                <article
                  key={summary.slug}
                  className="rounded-xl border border-[hsl(var(--border))]/55 bg-white/86 p-5 shadow-[var(--shadow-soft)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white shadow-[var(--shadow-soft)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-md bg-[hsl(var(--secondary))]/14 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
                      {summary.totalDocs} items
                    </span>
                  </div>

                  <h3 className="mt-5 text-[1.9rem] leading-[1.02] text-[hsl(var(--primary))]">
                    {summary.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[hsl(var(--foreground))]/74">
                    {summary.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link className="btn-primary gap-2 !px-4 !py-2.5 text-xs" href={summary.createHref}>
                      <Plus className="h-3.5 w-3.5" />
                      New
                    </Link>
                    <Link className="btn-outline gap-2 !px-4 !py-2.5 text-xs" href={summary.href}>
                      Manage
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <section className="site-card-navy p-6 md:p-7">
            <div className="eyebrow text-[hsl(var(--secondary))]">Quick Actions</div>
            <h2 className="mt-2 text-4xl leading-[1.02] text-white">
              Move faster without digging through menus.
            </h2>
            <div className="mt-6 space-y-3">
              <Link
                className="flex items-center justify-between rounded-lg border border-white/15 bg-white/8 px-4 py-3 text-sm text-white/88 transition-colors hover:bg-white/14"
                href={buildAdminHref(adminRoute, "/collections/projects/create")}
              >
                <span>Create a new featured project</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="flex items-center justify-between rounded-lg border border-white/15 bg-white/8 px-4 py-3 text-sm text-white/88 transition-colors hover:bg-white/14"
                href={buildAdminHref(adminRoute, "/collections/media/create")}
              >
                <span>Upload a hero asset</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="flex items-center justify-between rounded-lg border border-white/15 bg-white/8 px-4 py-3 text-sm text-white/88 transition-colors hover:bg-white/14"
                href={buildAdminHref(adminRoute, "/collections/users")}
              >
                <span>Review editor access</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="site-card-solid p-6 md:p-7">
            <div className="eyebrow">Recent Activity</div>
            <h2 className="mt-2 text-3xl leading-[1.04] text-[hsl(var(--primary))]">
              What changed recently.
            </h2>

            <div className="mt-5 space-y-3">
              {recentEntries.length ? (
                recentEntries.map((entry) => (
                  <Link
                    key={`${entry.slug}-${entry.label}-${entry.updatedAt ?? "now"}`}
                    className="block rounded-xl border border-[hsl(var(--border))]/55 bg-white/82 px-4 py-4 no-underline transition-transform hover:-translate-y-0.5"
                    href={entry.href}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[hsl(var(--primary))]">
                          {entry.label}
                        </div>
                        <div className="mt-1 text-sm leading-6 text-[hsl(var(--foreground))]/70">
                          {entry.meta}
                        </div>
                      </div>
                      <span className="rounded-md bg-[hsl(var(--secondary))]/14 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
                        {entry.collectionTitle}
                      </span>
                    </div>
                    <div className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                      Updated {formatDate(entry.updatedAt)}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[hsl(var(--border))]/70 bg-white/72 px-4 py-6 text-sm leading-6 text-[hsl(var(--foreground))]/70">
                  No recent activity yet. Create your first project or upload your first media item to
                  get this feed moving.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
