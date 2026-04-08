import AboutPageView from "@/components/about/AboutPageView";
import type { getAboutPageData } from "@/lib/cms-about";

type AboutPageContainerProps = {
  data: Awaited<ReturnType<typeof getAboutPageData>>;
};

export default function AboutPageContainer({ data }: AboutPageContainerProps) {
  const {
    hero,
    jumpLinks,
    locations,
    codeOfHonor,
    codeOfHonorItems,
    mondayteersIntro,
    team,
  } = data;

  return (
    <AboutPageView
      codeOfHonor={codeOfHonor}
      codeOfHonorItems={codeOfHonorItems}
      hero={hero}
      jumpLinks={jumpLinks}
      locations={locations}
      mondayteers={mondayteersIntro}
      team={team}
    />
  );
}
