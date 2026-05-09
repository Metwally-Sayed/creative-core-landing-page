import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAGE_ID = "92d83d54-3f26-4792-8549-74e1410bb7c8";

async function main() {
  const { data, error } = await supabase
    .from("page_sections")
    .select("id, type, content, translations")
    .eq("page_id", PAGE_ID)
    .eq("type", "what_we_do");

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  for (const row of data ?? []) {
    console.log("section id:", row.id);
    console.log("EN content:", JSON.stringify(row.content, null, 2));
    console.log("AR translations:", JSON.stringify(row.translations, null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
