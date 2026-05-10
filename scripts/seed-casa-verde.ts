/**
 * Seed the Casa Verde project (images left blank — add via admin).
 *
 * Usage:
 *   npx tsx scripts/seed-casa-verde.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log("Seeding Casa Verde…");

  // ── Check slug doesn't already exist ──────────────────────────────────────
  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", "casa-verde")
    .maybeSingle();

  if (existing) {
    console.log("Project 'casa-verde' already exists — skipping.");
    return;
  }

  // ── Insert main project row ────────────────────────────────────────────────
  const { data: row, error: rowErr } = await supabase
    .from("projects")
    .insert({
      slug:                        "casa-verde",
      title:                       "Casa Verde",
      tags:                        ["Branding", "Identity", "Visual Design"],
      aspect_ratio:                "portrait",
      cover_image_url:             "",
      published:                   false,
      sort_order:                  300,
      service_type:                "Branding",
      work_filters:                ["Branding"],
      featured_aspect_ratio:       "portrait",
      inherit_theme_from_palette:  true,
      theme_preference_configured: true,
      theme_palette: {
        accent:     { hex: "#315732", name: "Greens" },
        secondary:  { hex: "#267d8f", name: "Waves" },
        background: { hex: "#fff6e7", name: "Coconut" },
        foreground: { hex: "#0b3a58", name: "Indian Ocean" },
        supporting: [
          { hex: "#9ecdc5", name: "Crystal Reef" },
        ],
      },
      hero_label:       "Brand Identity",
      hero_title:       "CASA VERDE",
      hero_subtitle:    "",
      hero_summary:     "",
      hero_image_url:   "",
      client:           "Casa Verde",
      project_type:     "Branding",
      deliverables:     "",
      launch_label:     "Explore the project",
      launch_url:       "",
      intro:            [],
      showcase_image_url: "",
      showcase_alt:     "Casa Verde showcase",
      showcase_label:   "Primary showcase",
      feature_eyebrow:  "",
      feature_title:    "",
      feature_body:     "",
      translations:     {
        ar: {
          title:        "كاسا فيردي",
          hero_label:   "هوية بصرية",
          hero_title:   "كاسا فيردي",
          hero_subtitle: "",
          hero_summary:  "",
          tags:         ["علامة تجارية", "هوية", "تصميم بصري"],
        },
      },
    })
    .select("id")
    .single();

  if (rowErr || !row) {
    console.error("✗ Failed to insert project:", rowErr?.message);
    process.exit(1);
  }

  const projectId: string = row.id;
  console.log(`  Project row inserted (${projectId})`);

  // ── Overview facts ─────────────────────────────────────────────────────────
  const overview = [
    { label: "Service",  value: "Branding" },
    { label: "Focus",    value: "Identity + visual system" },
    { label: "Tone",     value: "Natural, warm, grounded" },
    { label: "Output",   value: "Brand identity system" },
  ];

  const overviewAr = [
    { label: "الخدمة",  value: "العلامة التجارية" },
    { label: "التركيز", value: "الهوية + المنظومة البصرية" },
    { label: "الأسلوب", value: "طبيعي، دافئ، راسخ" },
    { label: "المخرجات", value: "نظام هوية بصرية متكامل" },
  ];

  const { error: ovErr } = await supabase.from("project_overview").insert(
    overview.map((o, i) => ({
      project_id:   projectId,
      label:        o.label,
      value:        o.value,
      sort_order:   i,
      translations: overviewAr[i]
        ? { ar: { label: overviewAr[i].label, value: overviewAr[i].value } }
        : {},
    }))
  );
  if (ovErr) console.error("  ✗ Overview:", ovErr.message);
  else console.log(`  ${overview.length} overview facts inserted ✓`);

  // ── Process phases ─────────────────────────────────────────────────────────
  const phases = [
    { phase: "01", label: "Discovery",  desc: "Understand the brand's world, audience, and positioning before touching visuals." },
    { phase: "02", label: "Concept",    desc: "Explore visual directions rooted in the brand's natural, grounded personality." },
    { phase: "03", label: "System",     desc: "Build a coherent visual language: typography, color, form, and mark." },
    { phase: "04", label: "Expression", desc: "Apply the system across touchpoints — packaging, signage, and digital assets." },
  ];

  const phasesAr = [
    { phase: "01", label: "الاكتشاف",   desc: "فهم عالم العلامة التجارية وجمهورها وتمركزها قبل البدء بأي تصميم." },
    { phase: "02", label: "المفهوم",    desc: "استكشاف توجهات بصرية تنبثق من شخصية العلامة الطبيعية والراسخة." },
    { phase: "03", label: "المنظومة",   desc: "بناء لغة بصرية متماسكة: الطباعة، الألوان، الشكل، والعلامة." },
    { phase: "04", label: "التعبير",    desc: "تطبيق المنظومة على نقاط التواصل — التغليف، اللافتات، والأصول الرقمية." },
  ];

  const { error: procErr } = await supabase.from("project_process").insert(
    phases.map((ph, i) => ({
      project_id:   projectId,
      phase:        ph.phase,
      label:        ph.label,
      description:  ph.desc,
      sort_order:   i,
      translations: phasesAr[i]
        ? { ar: { label: phasesAr[i].label, description: phasesAr[i].desc } }
        : {},
    }))
  );
  if (procErr) console.error("  ✗ Process phases:", procErr.message);
  else console.log(`  ${phases.length} process phases inserted ✓`);

  console.log(`\n✓ Casa Verde seeded (id: ${projectId})`);
  console.log("  → Go to /admin/projects to add images and publish the project.");
}

main().catch((err) => { console.error(err); process.exit(1); });
