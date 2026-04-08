import AboutPage from "../src/globals/AboutPage";
import ServicesPage from "../src/globals/ServicesPage";
import WorkPage from "../src/globals/WorkPage";
import ProductPage from "../src/globals/ProductPage";
import Homepage from "../src/globals/Homepage";
import SiteSettings from "../src/globals/SiteSettings";
import QuoteForm from "../src/globals/QuoteForm";

import Media from "../src/collections/Media";
import Projects from "../src/collections/Projects";
import Users from "../src/collections/Users";

const configs = [
  { name: "AboutPage", val: AboutPage },
  { name: "ServicesPage", val: ServicesPage },
  { name: "WorkPage", val: WorkPage },
  { name: "ProductPage", val: ProductPage },
  { name: "Homepage", val: Homepage },
  { name: "SiteSettings", val: SiteSettings },
  { name: "QuoteForm", val: QuoteForm },
  { name: "Media", val: Media },
  { name: "Projects", val: Projects },
  { name: "Users", val: Users },
];

configs.forEach(({ name, val }) => {
  console.log(`Checking ${name}:`);
  if (!val) {
    console.error(`  ERROR: ${name} is UNDEFINED`);
  } else if (!val.fields) {
    console.error(`  ERROR: ${name} has no fields array. Content: ${JSON.stringify(val).substring(0, 100)}...`);
  } else {
    console.log(`  OK: fields count = ${val.fields.length}`);
  }
});
