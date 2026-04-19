import ServicesPageView from "@/components/services/ServicesPageView";
import type { getServicesPageData } from "@/lib/cms-services";
import type { ServiceSection, AwardStat } from "@/lib/services-catalog";

type ServicesPageContainerProps = {
  data: Awaited<ReturnType<typeof getServicesPageData>>;
};

export default function ServicesPageContainer({ data }: ServicesPageContainerProps) {
  const { hero, sections, shinyThings, awardColumns, categories } = data;

  return (
    <ServicesPageView
      awardColumns={awardColumns as AwardStat[][]}
      categories={categories}
      hero={hero}
      sections={sections as ServiceSection[]}
      shinyThings={shinyThings}
    />
  );
}
