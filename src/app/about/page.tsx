import type { Metadata } from "next";

import AboutPageContainer from "@/components/about/AboutPageContainer";

export const metadata: Metadata = {
  title: "About | Hello Monday / Dept.",
  description:
    "Who we are, where we work, the studio code of honor, and a themed dummy Mondayteers section.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <AboutPageContainer />
    </div>
  );
}
