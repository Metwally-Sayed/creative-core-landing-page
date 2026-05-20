import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAGE_ID = "92d83d54-3f26-4792-8549-74e1410bb7c8";

const NEW_ITEMS = [
  {
    icon: "palette",
    title: "Brand Identity",
    description:
      "We create brand identities that define how your business looks, feels, and communicates. This includes logo development, color systems, typography, visual direction, and brand guidelines.",
  },
  {
    icon: "shopping_bag",
    title: "Packaging & Print Design",
    description:
      "We design packaging and printed materials that strengthen the brand presence and elevate the customer experience across every detail.",
  },
  {
    icon: "megaphone",
    title: "Social Media Strategy",
    description:
      "We build social media strategies that align with your brand and speak to your audience. From content pillars to campaign ideas, we create a roadmap for consistent and engaging communication.",
  },
  {
    icon: "file_text",
    title: "Content Creation",
    description:
      "We develop visual and written content that helps brands show up professionally and creatively across digital platforms. This can include photoshoots, reels concepts, captions, and campaign messaging.",
  },
  {
    icon: "zap",
    title: "Marketing & Campaign Direction",
    description:
      "We shape creative campaigns that build awareness, support launches, and keep brands relevant. Our goal is to create ideas that connect emotionally and perform strategically.",
  },
  {
    icon: "globe",
    title: "Website & Digital Presence",
    description:
      "We help brands translate their identity into the digital space through website direction, content structure, and user-focused creative presentation.",
  },
  {
    icon: "layers",
    title: "3D & Interior Design",
    description:
      "We design spaces that reflect the brand and elevate the customer experience. From concept development and moodboards to 3D visualizations and interior direction, we help transform ideas into immersive environments that feel cohesive, functional, and visually impactful.",
  },
];

async function main() {
  const { data: row, error: readErr } = await supabase
    .from("page_sections")
    .select("id, content, translations")
    .eq("page_id", PAGE_ID)
    .eq("type", "what_we_do")
    .single();

  if (readErr || !row) {
    console.error("Could not find what_we_do section:", readErr?.message);
    process.exit(1);
  }

  const updatedContent = {
    ...row.content,
    items: NEW_ITEMS,
  };

  const { error: writeErr } = await supabase
    .from("page_sections")
    .update({ content: updatedContent })
    .eq("id", row.id);

  if (writeErr) {
    console.error("Update failed:", writeErr.message);
    process.exit(1);
  }

  console.log(`✓ Updated EN items for section ${row.id}`);
  NEW_ITEMS.forEach((item, i) => console.log(`  ${i + 1}. ${item.title}`));
  console.log("  AR translations left untouched.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
