import path from "path";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

import { Media } from "./collections/Media";
import { Users } from "./collections/Users";
import { Projects } from "./collections/Projects";
import { QuoteAttachments } from "./collections/QuoteAttachments";
import { QuoteSubmissions } from "./collections/QuoteSubmissions";

import { Homepage } from "./globals/Homepage";
import { SiteSettings } from "./globals/SiteSettings";
import { QuoteForm } from "./globals/QuoteForm";
import { ServicesPage } from "./globals/ServicesPage";
import { AboutPage } from "./globals/AboutPage";
import { WorkPage } from "./globals/WorkPage";
import { ProductPage } from "./globals/ProductPage";

const databaseURL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/hello_monday_payload";

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media, Projects, QuoteAttachments, QuoteSubmissions],
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
    push: true,
  }),
  editor: lexicalEditor({}),
  graphQL: {
    schemaOutputFile: path.resolve(process.cwd(), "src/graphql-schema.graphql"),
  },
  secret: process.env.PAYLOAD_SECRET ?? "hello-monday-payload-dev-secret",
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000",
  typescript: {
    outputFile: path.resolve(process.cwd(), "src/payload-types.ts"),
  },
});
