import AboutPageView from "@/components/about/AboutPageView";
import {
  aboutHero,
  aboutJumpLinks,
  aboutLocations,
  codeOfHonorIntro,
  codeOfHonorItems,
  mondayteers,
  mondayteersIntro,
} from "@/lib/about-catalog";

export default function AboutPageContainer() {
  return (
    <AboutPageView
      codeOfHonor={codeOfHonorIntro}
      codeOfHonorItems={codeOfHonorItems}
      hero={aboutHero}
      jumpLinks={aboutJumpLinks}
      locations={aboutLocations}
      mondayteers={mondayteersIntro}
      team={mondayteers}
    />
  );
}
