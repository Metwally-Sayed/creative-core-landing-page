import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sb = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE = "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media";

const p = (path: string) => ({ url: `${BASE}/${path}`, alt: "" });

// Images per service item (indexed 0–6, matching content.items order)
const SHOWCASE: Array<Array<{ url: string; alt: string }>> = [
  // 0 · Brand Identity  →  burgito
  [
    p("projects/burgito/burgitowebsite-13.webp"),
    p("projects/burgito/burgitowebsite-04.webp"),
    p("projects/burgito/burgitowebsite-11.webp"),
  ],
  // 1 · Packaging & Print Design  →  mazaq
  [
    p("projects/mazaq/mazaqwebsite-05.webp"),
    p("projects/mazaq/mazaqwebsite-09.webp"),
    p("projects/mazaq/mazaqwebsite-11.webp"),
  ],
  // 2 · Social Media Strategy  →  wahed-makhlout
  [
    p("projects/wahed-makhlout/TEAwebsite-01.webp"),
    p("projects/wahed-makhlout/TEAwebsite-05.webp"),
    p("projects/wahed-makhlout/TEAwebsite-07.webp"),
  ],
  // 3 · Content Creation  →  come-true
  [
    p("projects/come-true/cometruewebsite-01.webp"),
    p("projects/come-true/cometruewebsite-05.webp"),
    p("projects/come-true/cometruewebsite-09.webp"),
  ],
  // 4 · Marketing & Campaign Direction  →  qpasta
  [
    p("projects/qpasta/Qwebsite-01.webp"),
    p("projects/qpasta/Qwebsite-04.webp"),
    p("projects/qpasta/Qwebsite-09.webp"),
  ],
  // 5 · Website & Digital Presence  →  neamah
  [
    p("projects/neamah/Nwebsite-01.webp"),
    p("projects/neamah/Nwebsite-04.webp"),
    p("projects/neamah/Nwebsite-07.webp"),
  ],
  // 6 · 3D & Interior Design  →  lima (full slider)
  [
    p("projects/lima/Untitled-1-03.webp"),
    p("projects/lima/Untitled-1-04.webp"),
    p("projects/lima/Untitled-1-05.webp"),
    p("projects/lima/Untitled-1-06.webp"),
    p("projects/lima/Untitled-1-07.webp"),
    p("projects/lima/Untitled-1-08.webp"),
    p("projects/lima/Untitled-1-09.webp"),
    p("projects/lima/Untitled-1-10.webp"),
    p("projects/lima/Untitled-1-11.webp"),
  ],
];

const PAGE_ID = "92d83d54-3f26-4792-8549-74e1410bb7c8";

async function main() {
  const { data: row, error } = await sb
    .from("page_sections")
    .select("id, content")
    .eq("page_id", PAGE_ID)
    .eq("type", "what_we_do")
    .single();

  if (error || !row) {
    console.error("Section not found:", error?.message);
    process.exit(1);
  }

  const items = (row.content.items as Array<Record<string, unknown>>) ?? [];

  if (items.length !== SHOWCASE.length) {
    console.error(`Expected ${SHOWCASE.length} items, found ${items.length}`);
    process.exit(1);
  }

  const updatedItems = items.map((item, i) => ({ ...item, images: SHOWCASE[i] }));

  const { error: writeErr } = await sb
    .from("page_sections")
    .update({ content: { ...row.content, items: updatedItems } })
    .eq("id", row.id);

  if (writeErr) {
    console.error("Update failed:", writeErr.message);
    process.exit(1);
  }

  console.log(`✓ Section ${row.id} updated`);
  SHOWCASE.forEach((imgs, i) =>
    console.log(`  ${i}. ${(items[i].title as string).padEnd(35)} → ${imgs.length} image${imgs.length !== 1 ? "s" : ""}`)
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
