import type { Metadata } from "next";

import ProductShowcasePage from "@/components/product/ProductShowcasePage";

export const metadata: Metadata = {
  title: "Product | Hello Monday / Dept.",
  description:
    "A dark editorial product page with motion-led storytelling, collaboration previews, and product contact details.",
};

export default function ProductPage() {
  return <ProductShowcasePage />;
}
