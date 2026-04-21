import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const pages = [
  {
    slug: "home",
    title: "Home",
    published: true,
    sort_order: 0,
    sections: [
      {
        type: "hero",
        sort_order: 0,
        content: {
          headline: "Ideas That\nOrbit Your",
          highlight: "Core.",
          body: "Brand strategy, identity, content, and 3D visuals that convert.",
          cta_label: "See Our Work",
          cta_url: "/work",
        },
      },
      {
        type: "projects_grid",
        sort_order: 1,
        content: { eyebrow: "Selected Work", heading: "Projects" },
      },
      {
        type: "product_feature",
        sort_order: 2,
        content: {},
      },
      {
        type: "faq",
        sort_order: 3,
        content: { eyebrow: "Questions", heading: "FAQ" },
      },
    ],
  },
  {
    slug: "about",
    title: "About",
    published: true,
    sort_order: 1,
    sections: [
      {
        type: "hero",
        sort_order: 0,
        content: {
          headline: "We are Hello Monday",
          highlight: "",
          body: "A creative studio building brands, experiences, and digital products that move.",
          cta_label: "",
          cta_url: "",
        },
      },
    ],
  },
  {
    slug: "work",
    title: "Work",
    published: true,
    sort_order: 2,
    sections: [
      {
        type: "projects_grid",
        sort_order: 0,
        content: { eyebrow: "Selected Work", heading: "Our Projects" },
      },
    ],
  },
  {
    slug: "services",
    title: "Services",
    published: true,
    sort_order: 3,
    sections: [
      {
        type: "hero",
        sort_order: 0,
        content: {
          headline: "What We Do",
          highlight: "",
          body: "Brand strategy, identity systems, digital experiences, and creative direction.",
          cta_label: "Start a project",
          cta_url: "#contact",
        },
      },
    ],
  },
  {
    slug: "products",
    title: "Products",
    published: true,
    sort_order: 4,
    sections: [
      {
        type: "product_feature",
        sort_order: 0,
        content: {},
      },
    ],
  },
];

async function main() {
  console.log("Seeding pages…");

  for (const page of pages) {
    const { sections, ...pageData } = page;

    const { data: row, error: pageErr } = await supabase
      .from("pages")
      .upsert(pageData, { onConflict: "slug" })
      .select("id")
      .single();

    if (pageErr || !row) {
      console.error(`Failed to upsert page '${page.slug}':`, pageErr);
      continue;
    }

    await supabase.from("page_sections").delete().eq("page_id", row.id);

    if (sections.length > 0) {
      const { error: secErr } = await supabase.from("page_sections").insert(
        sections.map((s) => ({ ...s, page_id: row.id }))
      );
      if (secErr) {
        console.error(`Failed to insert sections for '${page.slug}':`, secErr);
        continue;
      }
    }

    console.log(`  ✓ ${page.slug}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
