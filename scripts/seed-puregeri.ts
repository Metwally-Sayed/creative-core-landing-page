/**
 * Seed the Puregeri project (images left blank — add via admin).
 *
 * Usage:
 *   npx tsx scripts/seed-puregeri.ts
 *
 * After running:
 *   1. Go to /admin/projects
 *   2. Click "Puregeri" to edit
 *   3. Upload the burger/packaging images via the media picker
 *   4. Fill in cover_image_url, hero_image_url, showcase_image_url, and gallery
 *   5. Toggle "Published"
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
  console.log("Seeding Puregeri…");

  // ── Check slug doesn't already exist ──────────────────────────────────────
  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", "puregeri")
    .maybeSingle();

  if (existing) {
    console.log("Project 'puregeri' already exists — skipping insert.");
    console.log(`  → Existing project id: ${existing.id}`);
    console.log("  → Delete it from the admin first if you want a fresh seed.");
    return;
  }

  // ── Insert main project row ────────────────────────────────────────────────
  const { data: row, error: rowErr } = await supabase
    .from("projects")
    .insert({
      slug:                        "puregeri",
      title:                       "Puregeri",
      tags:                        ["Branding", "Identity", "Packaging", "Visual Design"],
      aspect_ratio:                "landscape",
      cover_image_url:             "",
      published:                   false,
      sort_order:                  100,
      service_type:                "Branding",
      work_filters:                ["Branding"],
      featured_aspect_ratio:       "landscape",
      inherit_theme_from_palette:  true,
      theme_preference_configured: true,
      // Palette derived from the Puregeri brand: deep navy anchor, soft tiffany accent,
      // warm beige support, and white for cleanliness.
      theme_palette: {
        accent:     { hex: "#1B2A6B", name: "Deep Navy" },
        secondary:  { hex: "#A3D4D4", name: "Tiffany Blue" },
        background: { hex: "#FFFFFF", name: "Pure White" },
        foreground: { hex: "#1B2A6B", name: "Deep Navy" },
        supporting: [
          { hex: "#F5D8C2", name: "Soft Beige" },
          { hex: "#A3D4D4", name: "Tiffany Blue" },
        ],
      },
      hero_label:       "Brand Identity",
      hero_title:       "PUREGERI",
      hero_subtitle:    "Fresh bite. Pure taste.",
      hero_summary:     "A youthful, modern burger brand built around freshness, simplicity, and playful character.",
      hero_image_url:   "",
      client:           "Puregeri",
      project_type:     "Branding & Packaging",
      deliverables:     "Logo, color system, typography, packaging suite, wrapping paper, bags, apparel, loyalty cards, campaign visuals",
      launch_label:     "Explore the project",
      launch_url:       "",
      intro: [
        "Puregeri was created around the ideas of freshness, simplicity, and a playful modern attitude. The brand presents burgers in a way that feels clean, youthful, and easy to connect with.",
        "Rather than following the heavy visual language common in burger brands, its identity supports the idea of a fresh bite, pure taste, and an experience that is straightforward, memorable, and fun.",
      ],
      showcase_image_url: "",
      showcase_alt:     "Puregeri brand showcase",
      showcase_label:   "Primary showcase",
      feature_eyebrow:  "Visual Identity",
      feature_title:    "Bold, playful, highly recognizable",
      feature_body:     "Built around a strong typographic logo, burger-inspired forms, and flexible graphic patterns that bring energy to the brand. The identity performs clearly across burger boxes, wrapping paper, bags, and campaign visuals — giving Puregeri a youthful, organized, and easy-to-remember personality that stands out in a crowded food market.",
      translations: {
        ar: {
          title:         "بيورجري",
          tags:          ["علامة تجارية", "هوية", "تغليف", "تصميم بصري"],
          hero_label:    "هوية بصرية",
          hero_title:    "بيورجري",
          hero_subtitle: "قضمة منعشة. طعم نقي.",
          hero_summary:  "براند برجر شبابي عصري قائم على الانتعاش والبساطة والطابع المرح.",
          launch_label:  "استكشف المشروع",
          client:        "بيورجري",
          project_type:  "هوية وتغليف",
          deliverables:  "شعار، نظام ألوان، طباعة، نظام تغليف، أوراق تغليف، أكياس، ملابس، كروت ولاء، مواد إعلانية",
          intro: [
            "تم تطوير هوية بيورجري حول مفاهيم الانتعاش، والبساطة، والروح الشبابية المرحة. يقدّم البراند البرجر بأسلوب نظيف، واضح، وسهل الارتباط به.",
            "وبدلًا من اتباع الأسلوب البصري الثقيل المعتاد في كثير من براندات البرجر، صُممت هوية بيورجري لتكون أخف، أوضح، وأكثر عصرية، لتدعم فكرة fresh bite, pure taste كتجربة مباشرة، ممتعة، وسهلة التذكر.",
          ],
          feature_eyebrow: "الهوية البصرية",
          feature_title:   "جريئة، مرحة، سهلة التميّز",
          feature_body:    "بُنيت حول شعار قوي وأشكال مستوحاة من البرجر، وأنماط مرنة تضيف طاقة واضحة للبراند. وقد صُممت لتظهر بقوة على علب البرجر، وأوراق التغليف، والأكياس، والمواد الإعلانية، لتمنح بيورجري شخصية شبابية، منظمة، وسهلة الحفظ في سوق مزدحم.",
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
  console.log(`  Project row inserted (${projectId}) ✓`);

  // ── Overview facts ─────────────────────────────────────────────────────────
  const overview = [
    { label: "Service",  value: "Branding & Identity" },
    { label: "Focus",    value: "Identity + Packaging System" },
    { label: "Tone",     value: "Bold, playful, modern" },
    { label: "Output",   value: "Brand identity & packaging" },
    { label: "Industry", value: "Food & Beverage" },
  ];

  const overviewAr = [
    { label: "الخدمة",   value: "علامة تجارية وهوية" },
    { label: "التركيز",  value: "هوية + نظام تغليف" },
    { label: "الأسلوب",  value: "جريء، مرح، عصري" },
    { label: "المخرجات", value: "هوية وعناصر تغليف" },
    { label: "القطاع",   value: "أغذية ومشروبات" },
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
    { phase: "01", label: "Discovery",  desc: "Study the burger category, gaps in the market, and the playful tone Puregeri's audience expects." },
    { phase: "02", label: "Concept",    desc: "Land on the brand idea — fresh bite, pure taste — and the lighter, more youthful visual direction." },
    { phase: "03", label: "System",     desc: "Build the core system: typographic logo, color palette, burger-inspired marks, and graphic patterns." },
    { phase: "04", label: "Expression", desc: "Apply the system across packaging, wrapping paper, bags, apparel, signage, and campaign visuals." },
  ];

  const phasesAr = [
    { phase: "01", label: "الاكتشاف",   desc: "دراسة سوق البرجر، والفجوات الموجودة فيه، والطابع المرح الذي يتوقعه جمهور بيورجري." },
    { phase: "02", label: "المفهوم",    desc: "تحديد فكرة البراند — fresh bite, pure taste — والاتجاه البصري الأخف والأكثر شبابية." },
    { phase: "03", label: "المنظومة",   desc: "بناء المنظومة الأساسية: الشعار، نظام الألوان، الأشكال المستوحاة من البرجر، والأنماط الجرافيكية." },
    { phase: "04", label: "التعبير",    desc: "تطبيق المنظومة على التغليف، أوراق التغليف، الأكياس، الملابس، اللافتات، والمواد الإعلانية." },
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

  // ── Content sections (Concept / Color System / Visual Identity) ────────────
  const sections = [
    {
      eyebrow: "Concept",
      title:   "Fresh bite, pure taste",
      body: [
        "Puregeri was created around the ideas of freshness, simplicity, and a playful modern attitude. The brand presents burgers in a way that feels clean, youthful, and easy to connect with.",
        "Rather than following the heavy visual language common in burger brands, its identity supports the idea of a fresh bite, pure taste, and an experience that is straightforward, memorable, and fun.",
      ],
      image_url:    "",
      image_alt:    "Puregeri concept and brand idea",
      image_layout: "right" as const,
      tone:         "light" as const,
      translations: {
        ar: {
          eyebrow: "الفكرة",
          title:   "قضمة منعشة. طعم نقي.",
          body: [
            "تم تطوير هوية بيورجري حول مفاهيم الانتعاش، والبساطة، والروح الشبابية المرحة. يقدّم البراند البرجر بأسلوب نظيف، واضح، وسهل الارتباط به.",
            "وبدلًا من اتباع الأسلوب البصري الثقيل المعتاد في كثير من براندات البرجر، صُممت هوية بيورجري لتكون أخف، أوضح، وأكثر عصرية. وهكذا دعمت الهوية فكرة fresh bite, pure taste كتجربة مباشرة، ممتعة، وسهلة التذكر.",
          ],
        },
      },
    },
    {
      eyebrow: "Color System",
      title:   "Bold structure meets refreshing softness",
      body: [
        "Puregeri's palette combines bold structure with a refreshing softness. Dark blue provides strength, clarity, and a distinctive visual anchor, while beige adds warmth and softness.",
        "White reinforces cleanliness and simplicity, and Tiffany blue introduces a youthful and fresh accent. Together, these colors create a modern and balanced system that feels crisp, bright, and highly adaptable across packaging and brand touchpoints.",
      ],
      image_url:    "",
      image_alt:    "Puregeri color palette in use",
      image_layout: "left" as const,
      tone:         "navy" as const,
      translations: {
        ar: {
          eyebrow: "نظام الألوان",
          title:   "قوة بصرية بلمسة منعشة",
          body: [
            "يجمع نظام الألوان في بيورجري بين القوة البصرية والانتعاش. يمنح الأزرق الداكن الهوية ثباتًا ووضوحًا وحضورًا مميزًا، بينما يضيف البيج دفئًا ونعومة.",
            "ويعزّز الأبيض الإحساس بالنظافة والبساطة، في حين يقدّم التيفاني لمسة شبابية ومنعشة. ومعًا، تشكّل هذه الألوان نظامًا حديثًا ومتوازنًا يبدو نظيفًا، مريحًا بصريًا، ومرنًا عبر مختلف التطبيقات.",
          ],
        },
      },
    },
    {
      eyebrow: "Visual Identity",
      title:   "Built to stand out in a crowded food market",
      body: [
        "The visual identity of Puregeri is bold, playful, and highly recognizable. It is built around a strong typographic logo, burger-inspired forms, and flexible graphic patterns that bring energy to the brand.",
        "The identity was designed to perform clearly across burger boxes, wrapping paper, bags, and campaign visuals, giving the brand a youthful, organized, and easy-to-remember personality.",
      ],
      image_url:    "",
      image_alt:    "Puregeri logo, packaging, and apparel",
      image_layout: "right" as const,
      tone:         "light" as const,
      translations: {
        ar: {
          eyebrow: "الهوية البصرية",
          title:   "صُممت لتتميز في سوق مزدحم",
          body: [
            "تعتمد الهوية البصرية لـ بيورجري على الجرأة، والمرح، وسهولة التميّز. وقد بُنيت حول شعار قوي، وأشكال مستوحاة من البرجر، وأنماط مرنة تضيف طاقة واضحة للبراند.",
            "وتم تصميم الهوية لتظهر بقوة على علب البرجر، وأوراق التغليف، والأكياس، والمواد الإعلانية، لتمنح بيورجري شخصية شبابية، منظمة، وسهلة الحفظ في سوق مزدحم.",
          ],
        },
      },
    },
  ];

  const { error: secErr } = await supabase.from("project_sections").insert(
    sections.map((s, i) => ({
      project_id:   projectId,
      eyebrow:      s.eyebrow,
      title:        s.title,
      body:         s.body,
      image_url:    s.image_url,
      image_alt:    s.image_alt,
      image_layout: s.image_layout,
      tone:         s.tone,
      sort_order:   i,
      translations: s.translations,
    }))
  );
  if (secErr) console.error("  ✗ Sections:", secErr.message);
  else console.log(`  ${sections.length} content sections inserted ✓`);

  console.log(`\n✓ Puregeri seeded (id: ${projectId})`);
  console.log("  → Next steps:");
  console.log("    1. Open /admin/projects and click 'Puregeri'");
  console.log("    2. Upload images via the media picker:");
  console.log("       • cover_image_url (the project card cover)");
  console.log("       • hero_image_url");
  console.log("       • showcase_image_url");
  console.log("       • image_url on each of the 3 content sections");
  console.log("       • Add gallery images");
  console.log("    3. Toggle 'Published' and save");
}

main().catch((err) => { console.error(err); process.exit(1); });
