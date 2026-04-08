import path from "path";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

// Import with unique names to unwrap ESM/CJS interop issues from tsx execute
import MediaMod from "../src/collections/Media.ts";
import ProjectsMod from "../src/collections/Projects.ts";
import UsersMod from "../src/collections/Users.ts";

import AboutPageMod from "../src/globals/AboutPage.ts";
import HomepageMod from "../src/globals/Homepage.ts";
import ProductPageMod from "../src/globals/ProductPage.ts";
import QuoteFormMod from "../src/globals/QuoteForm.ts";
import ServicesPageMod from "../src/globals/ServicesPage.ts";
import SiteSettingsMod from "../src/globals/SiteSettings.ts";
import WorkPageMod from "../src/globals/WorkPage.ts";

// Unwrapping helper for tsx module resolution
const unwrap = (mod: any) => mod?.default || mod;

const Media = unwrap(MediaMod);
const Projects = unwrap(ProjectsMod);
const Users = unwrap(UsersMod);
const AboutPage = unwrap(AboutPageMod);
const Homepage = unwrap(HomepageMod);
const ProductPage = unwrap(ProductPageMod);
const QuoteForm = unwrap(QuoteFormMod);
const ServicesPage = unwrap(ServicesPageMod);
const SiteSettings = unwrap(SiteSettingsMod);
const WorkPage = unwrap(WorkPageMod);

const databaseURL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/hello_monday_payload";

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media, Projects],
  globals: [
    Homepage,
    SiteSettings,
    QuoteForm,
    ServicesPage,
    AboutPage,
    WorkPage,
    ProductPage,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: databaseURL,
    },
    push: false,
  }),
  editor: lexicalEditor({}),
  graphQL: {
    schemaOutputFile: path.resolve(process.cwd(), "src/graphql-schema.graphql"),
  },
  secret: process.env.PAYLOAD_SECRET ?? "hello-monday-payload-dev-secret",
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000",
});
