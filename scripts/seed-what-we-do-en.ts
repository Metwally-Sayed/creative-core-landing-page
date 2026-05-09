import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAGE_ID = "92d83d54-3f26-4792-8549-74e1410bb7c8";

// ─── New EN content ──────────────────────────────────────────────────────────
// 7 services mirroring the AR set the user wrote, with newly chosen icons.

const EN_CONTENT = {
  eyebrow: "WHAT WE DO?",
  title: "Strategy, design, and storytelling.",
  body: "We don't just deliver separate services — we work on your brand as a complete system, from idea to execution, clear and consistent.",
  items: [
    {
      icon: "palette",
      title: "Branding",
      description: "We define your place in the market and build an identity that speaks for you — not like anyone else.",
    },
    {
      icon: "megaphone",
      title: "Digital Marketing",
      description: "We plan it right, and make every step serve a clear goal.",
    },
    {
      icon: "file_text",
      title: "Content Creation",
      description: "Content that feels like you, and makes people remember you.",
    },
    {
      icon: "camera",
      title: "Product Photography",
      description: "We shoot your products in a way that catches the eye — and sells.",
    },
    {
      icon: "layers",
      title: "3D, Visuals & Interior Design",
      description: "Designs and visual spaces that give your brand or home a presence felt before it's explained.",
    },
    {
      icon: "video",
      title: "Motion Graphics & Editing",
      description: "We turn ideas into videos — fast, clear, attention-grabbing.",
    },
    {
      icon: "code",
      title: "Website Development & App Systems",
      description: "We build websites and apps that reflect your brand and make the experience smoother and clearer.",
    },
  ],
};

// AR titles + descriptions stay as the user wrote them; only icons change to
// match the new EN icon set 1:1.
const AR_ICONS = ["palette", "megaphone", "file_text", "camera", "layers", "video", "code"];

async function main() {
  const { data: row, error: readErr } = await supabase
    .from("page_sections")
    .select("id, content, translations")
    .eq("page_id", PAGE_ID)
    .eq("type", "what_we_do")
    .single();

  if (readErr || !row) {
    console.error("Failed to find what_we_do section:", readErr?.message);
    process.exit(1);
  }

  const arBlock = (row.translations?.ar ?? {}) as Record<string, unknown>;
  const arItems = (arBlock.items ?? []) as Array<Record<string, unknown>>;

  if (arItems.length !== AR_ICONS.length) {
    console.error(
      `Expected ${AR_ICONS.length} AR items, found ${arItems.length}. Aborting to avoid losing AR content.`
    );
    process.exit(1);
  }

  const nextArItems = arItems.map((item, i) => ({ ...item, icon: AR_ICONS[i] }));

  const nextTranslations = {
    ...row.translations,
    ar: {
      ...arBlock,
      items: nextArItems,
    },
  };

  const { error: writeErr } = await supabase
    .from("page_sections")
    .update({
      content: EN_CONTENT,
      translations: nextTranslations,
    })
    .eq("id", row.id);

  if (writeErr) {
    console.error("Update failed:", writeErr.message);
    process.exit(1);
  }

  console.log(`✓ Updated what_we_do section ${row.id}`);
  console.log(`  · EN replaced (${EN_CONTENT.items.length} items)`);
  console.log(`  · AR icons re-assigned (${AR_ICONS.length} items)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
