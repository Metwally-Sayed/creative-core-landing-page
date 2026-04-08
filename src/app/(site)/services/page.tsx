import type { Metadata } from "next";
import { getServicesPageData } from "@/lib/cms-services";
import ServicesPageContainer from "@/components/services/ServicesPageContainer";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getServicesPageData();
  const { meta } = data;

  return {
    title: meta?.title || "Services | Hello Monday / Dept.",
    description: meta?.description || "What we do: products, experiences, branding, and the shiny things that follow.",
    openGraph: meta?.ogImage ? {
      images: [meta.ogImage.url],
    } : undefined,
    alternates: meta?.canonicalUrl ? {
      canonical: meta.canonicalUrl,
    } : undefined,
  };
}

export default async function ServicesPage() {
  const data = await getServicesPageData();

  return (
    <div className="min-h-screen overflow-x-clip bg-transparent text-foreground">
      <ServicesPageContainer data={data} />
    </div>
  );
}
