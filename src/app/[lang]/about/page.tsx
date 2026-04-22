import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getPage } from "@/lib/page-data";
import SectionRenderer from "@/components/builder/SectionRenderer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About Us | Creative Core",
  description:
    "We are a full-service creative agency that combines creative thinking with practical execution to help brands launch, grow, and stand out.",
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);

  const page = await getPage("about");

  return (
    <div className="relative overflow-hidden text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.68)_0%,hsl(var(--background)/0.82)_22%,hsl(var(--background)/0.94)_54%,hsl(var(--background)/0.98)_100%)] backdrop-blur-[2px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(64rem,100vh)] bg-[radial-gradient(circle_at_top_left,hsl(var(--secondary)/0.18),transparent_38%),radial-gradient(circle_at_top_right,hsl(var(--primary)/0.14),transparent_42%)]"
      />
      <div className="relative">
        {page && page.sections.length > 0 ? (
          <SectionRenderer sections={page.sections} />
        ) : (
          <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
            About page not configured yet. Add it via Admin → Pages.
          </div>
        )}
      </div>
    </div>
  );
}
