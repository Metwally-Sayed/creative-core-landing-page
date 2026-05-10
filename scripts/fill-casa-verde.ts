/**
 * Fill missing content for Casa Verde.
 * SAFE — only UPDATEs the main row fields and INSERTs child rows that are empty.
 * Does NOT touch: cover_image_url, hero_image_url, showcase_image_url, gallery, or overview.
 *
 * Usage:
 *   npx tsx scripts/fill-casa-verde.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROJECT_ID = "102e63d6-eabc-432c-a667-11ad505777d9";

async function main() {
  console.log("Filling Casa Verde content…\n");

  // ── 1. Update main row — text fields only ─────────────────────────────────
  const { error: mainErr } = await supabase
    .from("projects")
    .update({
      hero_subtitle: "A natural lifestyle brand rooted in the warmth of home, the quiet of green spaces, and a palette drawn straight from the earth.",
      hero_summary:  "Casa Verde is a brand identity study that translates nature's stillness into a cohesive visual system — a warm cream base, grounded forest greens, and oceanic teal accents that feel organic, never decorative.",
      deliverables:  "Brand identity, color system, typography, packaging, digital assets",
      intro: [
        "Casa Verde started with a feeling: the calm of stepping into a naturally lit room filled with plants, earthy textures, and the scent of something brewing. The name carries that sentiment directly — a green home, a grounded place.",
        "The work became about building a visual language that earns that feeling at every scale. The palette moves from deep forest green to sun-warmed cream, with teal accents that read as water and depth rather than decoration. The result is a brand that feels both alive and settled.",
      ],
      translations: {
        ar: {
          title:         "كاسا فيردي",
          hero_label:    "هوية بصرية",
          hero_title:    "كاسا فيردي",
          hero_subtitle: "علامة تجارية طبيعية مبنية حول دفء البيت وهدوء المساحات الخضراء وألوان مستوحاة من الأرض.",
          hero_summary:  "كاسا فيردي دراسة هوية تجارية تترجم هدوء الطبيعة إلى منظومة بصرية متماسكة — قاعدة كريمية دافئة، وخضرة غابية راسخة، ولهجات فيروزية تبدو عضوية لا زخرفية.",
          tags:          ["علامة تجارية", "هوية", "تصميم بصري"],
          credits:       [],
          metrics:       [],
          overview: [
            { label: "الخدمة",    value: "العلامة التجارية" },
            { label: "التركيز",   value: "الهوية + المنظومة البصرية" },
            { label: "الأسلوب",   value: "طبيعي، دافئ، راسخ" },
            { label: "المخرجات",  value: "نظام هوية بصرية متكامل" },
          ],
          sections: [],
          intro: [
            "بدأت كاسا فيردي بشعور: هدوء الدخول إلى غرفة مضاءة طبيعياً مليئة بالنباتات والملامس الترابية وعبق شيء على النار. الاسم يحمل هذا الإحساس مباشرة — بيت أخضر، مكان راسخ.",
            "تحوّل العمل إلى بناء لغة بصرية تكسب هذا الشعور على كل مقياس. ينتقل اللوح الكروماتي من الأخضر الغابي العميق إلى الكريم المشمس الدافئ، مع لهجات فيروزية تُقرأ كالماء والعمق لا كزينة. النتيجة علامة تجارية تبدو حية وراسخة في آنٍ معاً.",
          ],
        },
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", PROJECT_ID);

  if (mainErr) { console.error("✗ Main row update:", mainErr.message); process.exit(1); }
  console.log("✓ Main row updated (subtitle, summary, deliverables, intro)");

  // ── 2. Story sections ─────────────────────────────────────────────────────
  const { data: existingSecs } = await supabase
    .from("project_sections")
    .select("id")
    .eq("project_id", PROJECT_ID);

  if (existingSecs && existingSecs.length > 0) {
    console.log(`  Sections already exist (${existingSecs.length}) — skipping`);
  } else {
    const sections = [
      {
        eyebrow: "Concept",
        title:   "Grounded from the start",
        body: [
          "Casa Verde needed to feel rooted — not nostalgic, not trend-driven. The concept work focused on building a visual vocabulary that places the brand squarely in the world of nature: deep greens that anchor, warm creams that breathe, and oceanic tones that suggest depth.",
          "Every decision in the concept phase was tested against one question: does this feel like it belongs outside? The silhouettes, the weight of the type, the ratio of color to white space — all calibrated toward the quiet, unhurried feeling the brand lives in.",
        ],
        imageLayout: "left" as const,
        tone:        "light" as const,
        ar: {
          eyebrow: "المفهوم",
          title:   "راسخ من البداية",
          body: [
            "كان على كاسا فيردي أن تبدو متجذرة — لا حنينية ولا مدفوعة بالاتجاهات. ركّزت مرحلة المفهوم على بناء مفردات بصرية تضع العلامة في عالم الطبيعة: خضرة عميقة ترسّخ، وكريم دافئ يتنفس، وأزرق محيطي يوحي بالعمق.",
            "كل قرار في مرحلة المفهوم اختُبر بسؤال واحد: هل يبدو هذا كأنه ينتمي إلى الخارج؟ الأشكال، وثقل الحروف، ونسبة اللون إلى المساحة البيضاء — كلها معايَرة نحو الشعور الهادئ الذي تعيشه العلامة.",
          ],
        },
      },
      {
        eyebrow: "Identity System",
        title:   "A palette that breathes",
        body: [
          "The identity was structured around color as the primary communicator. Rather than leading with a complex mark, Casa Verde's system uses its palette — five distinct tones working in clear roles — as the first thing people feel before they read anything.",
          "Typography follows the same restraint: a serif face for warmth and authority, paired with clean mono details for precision. The result is a system where every component has a clear role and nothing competes.",
        ],
        imageLayout: "right" as const,
        tone:        "light" as const,
        ar: {
          eyebrow: "نظام الهوية",
          title:   "لوح ألوان يتنفس",
          body: [
            "بُني نظام الهوية حول اللون باعتباره المتواصل الأول. بدلاً من البدء بعلامة معقدة، يستخدم نظام كاسا فيردي لوحه الكروماتي — خمسة درجات متميزة في أدوار واضحة — بوصفه أول ما يشعر به الناس قبل قراءة أي شيء.",
            "تتبع الطباعة الانضباط ذاته: خط مصنّف دافئ وموثوق، مقترن بتفاصيل أحادية نظيفة للدقة. النتيجة منظومة لكل عنصر فيها دور واضح ولا يتنافس شيء مع آخر.",
          ],
        },
      },
      {
        eyebrow: "Expression",
        title:   "Applied with intention",
        body: [
          "To close the system, we pushed it into application: packaging surfaces, print formats, and digital contexts where the palette and type had to hold their own under real constraints.",
          "The goal was proof that the system scales — that the same visual logic works on a label, a social post, and a printed piece without requiring reinvention at each step.",
        ],
        imageLayout: "left" as const,
        tone:        "navy" as const,
        ar: {
          eyebrow: "التطبيق",
          title:   "مُطبَّق بقصد",
          body: [
            "لإغلاق المنظومة، دفعناها نحو التطبيق: أسطح تغليف وصيغ طباعية وسياقات رقمية حيث يجب أن يصمد اللوح والحروف في مواجهة قيود حقيقية.",
            "كان الهدف إثبات قابلية المنظومة للتوسع — أن نفس المنطق البصري يعمل على بطاقة وعلى منشور سوشال وعلى مطبوعة دون الحاجة إلى إعادة اختراع في كل خطوة.",
          ],
        },
      },
    ];

    const { error: secErr } = await supabase.from("project_sections").insert(
      sections.map((s, i) => ({
        project_id:   PROJECT_ID,
        eyebrow:      s.eyebrow,
        title:        s.title,
        body:         s.body,
        image_url:    "",
        image_alt:    `Casa Verde ${s.eyebrow.toLowerCase()} image`,
        image_layout: s.imageLayout,
        tone:         s.tone,
        sort_order:   i,
        translations: { ar: { eyebrow: s.ar.eyebrow, title: s.ar.title, body: s.ar.body } },
      }))
    );
    if (secErr) console.error("✗ Sections:", secErr.message);
    else console.log(`✓ ${sections.length} story sections inserted`);
  }

  // ── 3. Impact metrics ──────────────────────────────────────────────────────
  const { data: existingMetrics } = await supabase
    .from("project_metrics")
    .select("id")
    .eq("project_id", PROJECT_ID);

  if (existingMetrics && existingMetrics.length > 0) {
    console.log(`  Metrics already exist (${existingMetrics.length}) — skipping`);
  } else {
    const metrics = [
      { label: "Coherence",   value: "A system where color, form, and texture speak one language.", ar: { label: "التماسك",    value: "منظومة يتحدث فيها اللون والشكل والملمس لغة واحدة." } },
      { label: "Warmth",      value: "A palette that feels lived-in rather than chosen.",            ar: { label: "الدفء",      value: "لوح ألوان يبدو مُعاشاً لا مختاراً." } },
      { label: "Versatility", value: "An identity that scales from packaging to digital without losing itself.", ar: { label: "التنوع", value: "هوية تتوسع من التغليف إلى الرقمي دون أن تفقد نفسها." } },
    ];

    const { error: metErr } = await supabase.from("project_metrics").insert(
      metrics.map((m, i) => ({
        project_id:   PROJECT_ID,
        label:        m.label,
        value:        m.value,
        sort_order:   i,
        translations: { ar: { label: m.ar.label, value: m.ar.value } },
      }))
    );
    if (metErr) console.error("✗ Metrics:", metErr.message);
    else console.log(`✓ ${metrics.length} impact metrics inserted`);
  }

  // ── 4. Credits ─────────────────────────────────────────────────────────────
  const { data: existingCredits } = await supabase
    .from("project_credits")
    .select("id")
    .eq("project_id", PROJECT_ID);

  if (existingCredits && existingCredits.length > 0) {
    console.log(`  Credits already exist (${existingCredits.length}) — skipping`);
  } else {
    const credits = [
      { label: "Services",     value: "Branding, Visual Identity, Color System",   ar: { label: "الخدمات",    value: "هوية بصرية، منظومة لونية" } },
      { label: "Deliverables", value: "Identity toolkit, packaging, digital assets", ar: { label: "المخرجات",  value: "مجموعة أدوات هوية، تغليف، أصول رقمية" } },
      { label: "Studio",       value: "Creative Core",                              ar: { label: "الاستوديو", value: "Creative Core" } },
    ];

    const { error: credErr } = await supabase.from("project_credits").insert(
      credits.map((c, i) => ({
        project_id:   PROJECT_ID,
        label:        c.label,
        value:        c.value,
        sort_order:   i,
        translations: { ar: { label: c.ar.label, value: c.ar.value } },
      }))
    );
    if (credErr) console.error("✗ Credits:", credErr.message);
    else console.log(`✓ ${credits.length} credits inserted`);
  }

  // ── 5. Process phases ──────────────────────────────────────────────────────
  const { data: existingProc } = await supabase
    .from("project_process")
    .select("id")
    .eq("project_id", PROJECT_ID);

  if (existingProc && existingProc.length > 0) {
    console.log(`  Process phases already exist (${existingProc.length}) — skipping`);
  } else {
    const phases = [
      { phase: "01", label: "Discovery",  desc: "Define the brand's world, personality, and positioning before touching visuals.", ar: { label: "الاكتشاف",  desc: "تحديد عالم العلامة وشخصيتها وتمركزها قبل البدء بأي تصميم." } },
      { phase: "02", label: "Concept",    desc: "Explore visual directions rooted in the brand's natural, grounded character.",    ar: { label: "المفهوم",   desc: "استكشاف توجهات بصرية متجذرة في شخصية العلامة الطبيعية والراسخة." } },
      { phase: "03", label: "System",     desc: "Build a coherent visual language: palette, typography, form, and mark.",          ar: { label: "المنظومة",  desc: "بناء لغة بصرية متماسكة: لوح ألوان وطباعة وشكل وعلامة." } },
      { phase: "04", label: "Expression", desc: "Apply the system across touchpoints — packaging, print, and digital assets.",     ar: { label: "التعبير",   desc: "تطبيق المنظومة على نقاط التواصل — تغليف ومطبوعات وأصول رقمية." } },
    ];

    const { error: procErr } = await supabase.from("project_process").insert(
      phases.map((ph, i) => ({
        project_id:   PROJECT_ID,
        phase:        ph.phase,
        label:        ph.label,
        description:  ph.desc,
        sort_order:   i,
        translations: { ar: { label: ph.ar.label, description: ph.ar.desc } },
      }))
    );
    if (procErr) console.error("✗ Process phases:", procErr.message);
    else console.log(`✓ ${phases.length} process phases inserted`);
  }

  console.log("\nDone. Existing images and gallery are untouched.");
}

main().catch((err) => { console.error(err); process.exit(1); });
