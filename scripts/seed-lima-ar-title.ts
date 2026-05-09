import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: row, error: readErr } = await supabase
    .from("projects")
    .select("id, slug, translations")
    .eq("slug", "lima")
    .single();

  if (readErr || !row) {
    console.error("Could not find project with slug='lima':", readErr?.message);
    process.exit(1);
  }

  const existing = (row.translations ?? {}) as Record<string, unknown>;
  const ar = (existing.ar ?? {}) as Record<string, unknown>;

  const nextTranslations = {
    ...existing,
    ar: {
      ...ar,
      title: "ليما",
      hero_title: "ليما",
    },
  };

  const { error: writeErr } = await supabase
    .from("projects")
    .update({ translations: nextTranslations })
    .eq("id", row.id);

  if (writeErr) {
    console.error("Failed to update lima translations:", writeErr.message);
    process.exit(1);
  }

  console.log("✓ lima translations.ar.{title,hero_title} = 'ليما'");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
