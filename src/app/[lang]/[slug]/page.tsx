import { notFound } from "next/navigation";
import { getPage, getPages } from "@/lib/page-data";
import { getProjects } from "@/lib/project-data";
import { getFaqItems } from "@/lib/faq-data";
import SectionRenderer from "@/components/builder/SectionRenderer";
import type { Metadata } from "next";

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const pages = await getPages();
  return pages
    .filter((p) => p.published && p.slug !== "home")
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page || !page.published) return {};
  return {
    title: page.meta_title || page.title,
    description: page.meta_description || undefined,
    openGraph: page.og_image_url?.startsWith("http")
      ? { images: [page.og_image_url] }
      : undefined,
  };
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page || !page.published) notFound();

  const needsProjects = page.sections.some((s) => s.type === "projects_grid");
  const needsFaq = page.sections.some((s) => s.type === "faq");

  const [projects, faqItems] = await Promise.all([
    needsProjects ? getProjects() : Promise.resolve([]),
    needsFaq ? getFaqItems() : Promise.resolve([]),
  ]);

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <SectionRenderer
        sections={page.sections}
        projects={projects}
        faqItems={faqItems}
      />
    </div>
  );
}
