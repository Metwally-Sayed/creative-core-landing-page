import type { Metadata } from "next";

import ServicesPageContainer from "@/components/services/ServicesPageContainer";

export const metadata: Metadata = {
  title: "Services | Hello Monday / Dept.",
  description:
    "What we do: products, experiences, branding, and the shiny things that follow.",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <ServicesPageContainer />
    </div>
  );
}
