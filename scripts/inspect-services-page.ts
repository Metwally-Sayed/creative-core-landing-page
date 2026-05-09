import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: page } = await supabase
    .from("pages")
    .select("id, slug, title")
    .eq("slug", "services")
    .single();

  if (!page) {
    console.error("services page not found");
    process.exit(1);
  }

  console.log("page:", page);

  const { data: sections } = await supabase
    .from("page_sections")
    .select("id, type, sort_order, content, translations")
    .eq("page_id", page.id)
    .order("sort_order");

  for (const s of sections ?? []) {
    console.log("─".repeat(72));
    console.log(`section ${s.sort_order} · ${s.type} · ${s.id}`);
    console.log("EN content:", JSON.stringify(s.content, null, 2));
    console.log("AR translations:", JSON.stringify(s.translations, null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
