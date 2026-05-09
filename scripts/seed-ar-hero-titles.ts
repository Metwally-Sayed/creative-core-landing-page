import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SEED: Array<{ slug: string; arHeroTitle: string }> = [
  { slug: "burgito", arHeroTitle: "بورغيتو" },
  { slug: "mazaq", arHeroTitle: "مذاق" },
  { slug: "emboss-burger", arHeroTitle: "إمبوس برغر" },
  { slug: "qpasta", arHeroTitle: "كيو باستا" },
  { slug: "wahed-makhlout", arHeroTitle: "واحد مخلوط" },
  { slug: "neamah", arHeroTitle: "نعمة" },
  { slug: "come-true", arHeroTitle: "كوم ترو" },
];

async function main() {
  let updated = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const { slug, arHeroTitle } of SEED) {
    const { data: row, error: readErr } = await supabase
      .from("projects")
      .select("id, translations")
      .eq("slug", slug)
      .single();

    if (readErr || !row) {
      failures.push(`${slug}: read failed — ${readErr?.message ?? "no row"}`);
      continue;
    }

    const existing = (row.translations ?? {}) as Record<string, unknown>;
    const ar = (existing.ar ?? {}) as Record<string, unknown>;

    if (ar.hero_title === arHeroTitle) {
      console.log(`  · ${slug} already set to "${arHeroTitle}" — skipping`);
      skipped++;
      continue;
    }

    const nextTranslations = {
      ...existing,
      ar: { ...ar, hero_title: arHeroTitle },
    };

    const { error: writeErr } = await supabase
      .from("projects")
      .update({ translations: nextTranslations })
      .eq("id", row.id);

    if (writeErr) {
      failures.push(`${slug}: write failed — ${writeErr.message}`);
      continue;
    }

    console.log(`  ✓ ${slug} → "${arHeroTitle}"`);
    updated++;
  }

  console.log(`\n${updated} updated, ${skipped} skipped, ${failures.length} failed`);
  if (failures.length) {
    failures.forEach((f) => console.error("  ✗ " + f));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
