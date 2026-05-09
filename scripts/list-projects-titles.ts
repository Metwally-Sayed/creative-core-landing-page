import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title, hero_title, translations")
    .order("sort_order");

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  for (const row of data ?? []) {
    const ar = (row.translations?.ar ?? {}) as Record<string, unknown>;
    console.log(
      JSON.stringify(
        {
          slug: row.slug,
          title: row.title,
          hero_title: row.hero_title,
          ar_title: ar.title ?? null,
          ar_hero_title: ar.hero_title ?? null,
        },
        null,
        0
      )
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
