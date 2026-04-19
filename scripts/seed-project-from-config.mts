import path from "path";
import { fileURLToPath } from "url";

import nextEnv from "@next/env";

import { resolveProjectSeedConfig } from "./project-seeds.ts";
import { seedProjectFromConfig } from "./lib/seed-project.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const { loadEnvConfig } = nextEnv;

loadEnvConfig(appRoot);

async function run() {
  const keyOrSlug = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!keyOrSlug) {
    throw new Error("Missing project key/slug argument. Example: npm run payload:seed:project -- burgito");
  }

  const config = resolveProjectSeedConfig(keyOrSlug);
  if (!config) {
    throw new Error(`No seed config found for '${keyOrSlug}'.`);
  }

  const result = await seedProjectFromConfig(config);
  console.log(`Upserted project '${result.slug}' (${result.id}).`);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

