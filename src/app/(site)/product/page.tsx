import type { Metadata } from "next";
import { getProductPageCMSData } from "@/lib/cms-product";
import ProductShowcasePage from "@/components/product/ProductShowcasePage";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getProductPageCMSData();
  const meta = data.meta;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.ogImage ? {
      images: [meta.ogImage.url],
    } : undefined,
    alternates: meta.canonicalUrl ? {
      canonical: meta.canonicalUrl,
    } : undefined,
  };
}

export default async function ProductPage() {
  const data = await getProductPageCMSData();
  return (
    <div className="min-h-screen overflow-x-clip bg-transparent text-foreground">
      <ProductShowcasePage cmsData={data} />
    </div>
  );
}
