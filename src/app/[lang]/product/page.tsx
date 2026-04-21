import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import ProductShowcasePage from "@/components/product/ProductShowcasePage";

export const metadata: Metadata = {
  title: "Product | Hello Monday / Dept.",
  description:
    "A dark editorial product page with motion-led storytelling, collaboration previews, and product contact details.",
};

type ProductPageProps = {
  params: Promise<{ lang: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { lang } = await params;
  setRequestLocale(lang);
  return <ProductShowcasePage />;
}
