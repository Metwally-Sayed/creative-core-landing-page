import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import path from "path";

import { Media } from path.resolve(process.cwd(), "./src/collections/Media");
import { Users } from path.resolve(process.cwd(), "./src/collections/Users");
import { Projects } from path.resolve(process.cwd(), "./src/collections/Projects");
import { QuoteAttachments } from path.resolve(process.cwd(), "./src/collections/QuoteAttachments");
import { QuoteSubmissions } from path.resolve(process.cwd(), "./src/collections/QuoteSubmissions");

import { Homepage } from path.resolve(process.cwd(), "./src/globals/Homepage");
import { SiteSettings } from path.resolve(process.cwd(), "./src/globals/SiteSettings");
import { QuoteForm } from path.resolve(process.cwd(), "./src/globals/QuoteForm");
import { ServicesPage } from path.resolve(process.cwd(), "./src/globals/ServicesPage");
import { AboutPage } from path.resolve(process.cwd(), "./src/globals/AboutPage");
import { WorkPage } from path.resolve(process.cwd(), "./src/globals/WorkPage");
import { ProductPage } from path.resolve(process.cwd(), "./src/globals/ProductPage");

const databaseURL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/hello_monday_payload";

const config = buildConfig({
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
  secret: process.env.PAYLOAD_SECRET ?? "hello-monday-payload-dev-secret",
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000",
});

async function pushSchema() {
  console.log("Connecting to database...");
  
  const adapter = config.db;
  
  console.log("Pushing schema...");
  await adapter.push();
  console.log("Schema pushed successfully!");
  
  process.exit(0);
}

pushSchema().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
