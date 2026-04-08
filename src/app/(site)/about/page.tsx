import type { Metadata } from "next";
import { getAboutPageData } from "@/lib/cms-about";
import AboutPageContainer from "@/components/about/AboutPageContainer";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAboutPageData();
  const { meta } = data;

  return {
    title: meta?.title,
    description: meta?.description,
    openGraph: meta?.ogImage ? {
      images: [meta.ogImage.url],
    } : undefined,
    alternates: meta?.canonicalUrl ? {
      canonical: meta.canonicalUrl,
    } : undefined,
  };
}

export default async function AboutPage() {
  const data = await getAboutPageData();

  return (
    <div className="min-h-screen overflow-x-clip bg-transparent text-foreground">
      <AboutPageContainer data={data} />
    </div>
  );
}
