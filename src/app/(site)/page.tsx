import { Suspense } from "react";
import type { Metadata } from "next";
import { getHomepageData } from "@/lib/cms-homepage";
import HomepageBlockRenderer from "@/components/homepage/HomepageBlockRenderer";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const homepage = await getHomepageData();
  
  return {
    title: homepage?.metaTitle || "Homepage",
    description: homepage?.metaDescription || "Homepage content managed in CMS.",
    openGraph: homepage?.ogImage ? {
      images: [homepage.ogImage.url],
    } : undefined,
    alternates: homepage?.canonicalUrl ? {
      canonical: homepage.canonicalUrl,
    } : undefined,
  };
}

export default async function Home() {
  const homepage = await getHomepageData();

  return (
    <div className="min-h-screen overflow-x-clip bg-transparent text-foreground">
      <main>
        <Suspense fallback={null}>
          <HomepageBlockRenderer blocks={homepage.blocks} />
        </Suspense>
      </main>
    </div>
  );
}
