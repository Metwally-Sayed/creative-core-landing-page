import ServicesPageView from "@/components/services/ServicesPageView";
import type { getServicesPageData } from "@/lib/cms-services";

type ServicesPageContainerProps = {
  data: Awaited<ReturnType<typeof getServicesPageData>>;
};

export default function ServicesPageContainer({ data }: ServicesPageContainerProps) {
  const { hero, sections, shinyThings, awardColumns, categories } = data;

  return (
    <ServicesPageView
      awardColumns={awardColumns}
      categories={categories}
      hero={hero}
      sections={sections}
      shinyThings={shinyThings}
    />
  );
}
