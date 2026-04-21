import type { Metadata } from "next";

import WorkPageContainer from "@/components/work/WorkPageContainer";

export const metadata: Metadata = {
  title: "Work | Hello Monday / Dept.",
  description:
    "An editorial grid of selected Hello Monday projects, built from the local dummy project catalog.",
};

export default function WorkPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <WorkPageContainer />
    </div>
  );
}
