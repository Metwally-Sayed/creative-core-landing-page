import ServicesPageView from "@/components/services/ServicesPageView";
import {
  awardColumns,
  serviceSections,
  servicesHero,
  shinyThings,
} from "@/lib/services-catalog";

export default function ServicesPageContainer() {
  return (
    <ServicesPageView
      awardColumns={awardColumns}
      hero={servicesHero}
      sections={serviceSections}
      shinyThings={shinyThings}
    />
  );
}
