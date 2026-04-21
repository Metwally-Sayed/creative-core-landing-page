/**
 * Seed 8 real brand projects from tmp/seed-projects.en-ar.snapshot.txt
 *
 * - Deletes all existing projects (cascade handles children) then re-seeds
 * - Uploads all local images to Supabase Storage (projects/{slug}/{filename})
 * - Inserts into projects + all child tables including project_process
 * - EN copy is primary; AR translations stored in translations.ar jsonb
 *
 * Usage:
 *   npx tsx scripts/seed-from-snapshot.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs/promises";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "media";

// ─── EN copy for the 6 projects missing it in the snapshot ───────────────────

interface SectionCopy {
  eyebrow: string;
  title: string;
  body: string[];
  imageLayout: "left" | "right";
  tone: "light" | "navy";
}

interface FactRow { label: string; value: string }

interface ProcessPhase { phase: string; label: string; desc: string }

interface EnCopy {
  heroLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSummary: string;
  introMeta: { type: string; client: string; deliverables: string; launchLabel: string };
  overview: FactRow[];
  intro: string[];
  process?: ProcessPhase[];
  sections: SectionCopy[];
  impactMetrics: FactRow[];
  credits: FactRow[];
}

const EN_COPY: Record<string, EnCopy> = {
  "emboss-burger": {
    heroLabel: "Brand Identity",
    heroTitle: "EMBOSS BURGER",
    heroSubtitle: "A burger brand built to feel stamped, memorable, and visually loud across packaging and campaigns.",
    heroSummary: "EMBOSS BURGER turns the idea of a \"mark\" into a full identity system—sticker-style badges, bold typography, and street-led visuals across packaging, menus, and launch assets.",
    introMeta: {
      type: "Branding",
      client: "EMBOSS BURGER",
      deliverables: "Brand identity, packaging, mascot system, campaign visuals, menu design, social assets",
      launchLabel: "Explore the system",
    },
    overview: [
      { label: "Service", value: "Branding" },
      { label: "Scope", value: "Identity, packaging, menu language, campaign rollouts" },
      { label: "Strategy", value: "A compact mark-driven system with sticker-like repeatables" },
      { label: "Tone", value: "Street-led, tactile, high-contrast" },
    ],
    intro: [
      "EMBOSS BURGER is built around the idea of leaving a mark. The identity treats embossing—not as an effect, but as a point of view: bold stamps, tactile cues, and repeatable badges that make every surface feel authored.",
      "Visually, the system balances block typography with a handwritten counterpoint, creating tension between loud and personal. Deep green anchors recognition, pink adds pop and contrast, and the sticker/stamp language scales cleanly from packaging details to campaign imagery.",
    ],
    sections: [
      {
        eyebrow: "Concept",
        title: "Make the brand feel like it's been marked",
        body: [
          "The concept work centers on tactility: stamp-style graphics, bold marks, and packaging cues that feel like they've been pressed into the brand's surfaces.",
          "Instead of one precious lockup, the system favors repeatable components that can travel across wrappers, bags, posters, and menus without losing intensity.",
        ],
        imageLayout: "left",
        tone: "light",
      },
      {
        eyebrow: "Identity System",
        title: "Badges, menu language, and sticker assets",
        body: [
          "The identity system is built as a toolkit: mascot/badge marks, supporting stickers, and typographic rules that keep layouts tight and recognizable.",
          "This lets the brand stay consistent across menu touchpoints while still leaving room for campaign energy and playful variation.",
        ],
        imageLayout: "right",
        tone: "light",
      },
      {
        eyebrow: "Launch Expression",
        title: "Packaging-first, campaign-ready",
        body: [
          "Launch assets prove the system under real constraints—cropping, repetition, and quick-format adaptation—without losing the embossed 'mark' idea.",
          "The result is a brand language that works in-store, in-hand, and on-feed, with a clear green-and-pink signature.",
        ],
        imageLayout: "left",
        tone: "navy",
      },
    ],
    impactMetrics: [
      { label: "Recall", value: "Stronger visual recall through a compact sticker-and-logo system built around the 'mark' concept." },
      { label: "Consistency", value: "A unified identity across menu, packaging, merchandise, and campaign touchpoints." },
      { label: "Flexibility", value: "A brand language that adapts cleanly to storefront presence and social content formats." },
    ],
    credits: [
      { label: "Services", value: "Branding, Visual Identity, Packaging Direction, Art Direction" },
    ],
  },

  "qpasta": {
    heroLabel: "Brand Identity",
    heroTitle: "QPASTA",
    heroSubtitle: "A pasta-and-pizza brand that feels cinematic, recognizable, and modern across dine‑in and takeaway touchpoints.",
    heroSummary: "QPASTA blends Italian comfort-food cues with a sharper, contemporary bilingual identity—packaging, campaign assets, and a playful character system that carries from coffee to takeaway.",
    introMeta: {
      type: "Branding",
      client: "QPASTA",
      deliverables: "Brand identity, packaging, campaign visuals, character system, coffee and takeaway applications",
      launchLabel: "Explore the identity",
    },
    overview: [
      { label: "Service", value: "Branding" },
      { label: "Scope", value: "Identity, packaging, character, campaign-ready assets" },
      { label: "Strategy", value: "Bilingual mark + cinematic Italian references + modern grid" },
      { label: "Palette", value: "Olive + tomato with soft neutrals and editorial monochrome" },
    ],
    intro: [
      "QPASTA is a comfort-food brand with a sharper editorial edge. The identity blends Italian-cinema references and classic menu cues with a contemporary bilingual mark—designed to feel as confident on packaging as it does on an in-store wall or a social post.",
      "Olive green anchors the system, tomato red provides the punch, and soft neutrals keep the typography and photography readable. A playful pizza character and campaign slogans add warmth, while monochrome editorial imagery gives the brand a distinctive, cinematic rhythm across touchpoints.",
    ],
    sections: [
      {
        eyebrow: "Concept",
        title: "Italian references, edited for a modern brand",
        body: [
          "The concept phase aimed for instantly readable Italian cues—cinema, menu typography, and classic composition—without drifting into pastiche.",
          "By keeping the system grid-led and typographically disciplined, the brand can move between monochrome editorial moments and vivid food photography without feeling split.",
        ],
        imageLayout: "left",
        tone: "light",
      },
      {
        eyebrow: "Identity System",
        title: "Logo behavior, character, and campaign assets",
        body: [
          "The identity toolkit pairs the bilingual mark with a playful character layer for warmth and recall—staying flexible for pizza, pasta, and coffee moments.",
          "Slogans and modular graphic elements support campaign builds, while a consistent typographic rhythm keeps every layout recognizably QPASTA.",
        ],
        imageLayout: "right",
        tone: "light",
      },
      {
        eyebrow: "Brand In Use",
        title: "Promotions, loyalty, and takeaway presence",
        body: [
          "Applications focus on the real brand moments: packaging in-hand, in-store collateral, and promotional mechanics that need to stay legible at speed.",
          "The system holds across touchpoints—menus, loyalty, takeaway, and social—connecting product photography with editorial storytelling.",
        ],
        imageLayout: "left",
        tone: "navy",
      },
    ],
    impactMetrics: [
      { label: "Recall", value: "Stronger recall through a distinct bilingual mark and playful character system." },
      { label: "Flexibility", value: "A flexible identity that spans pizza, pasta, coffee, and promotional touchpoints without losing coherence." },
      { label: "Storytelling", value: "A clearer brand world connecting vivid product photography with editorial, cinematic framing." },
    ],
    credits: [
      { label: "Services", value: "Branding, Visual Identity, Packaging Direction, Art Direction" },
    ],
  },

  "come-true": {
    heroLabel: "Brand Identity",
    heroTitle: "COME TRUE",
    heroSubtitle: "A café brand built to feel light, memorable, and emotionally positive across takeaway and in‑store moments.",
    heroSummary: "COME TRUE turns coffee and pastry into an uplifting daily ritual—anchored by cobalt blue, warm neutrals, and a simple bird icon across packaging, merchandise, café applications, and campaign visuals.",
    introMeta: {
      type: "Branding",
      client: "COME TRUE",
      deliverables: "Brand identity, packaging, merchandise, café applications, campaign visuals",
      launchLabel: "Explore the identity",
    },
    overview: [
      { label: "Service", value: "Branding" },
      { label: "Scope", value: "Identity, packaging, merchandise, café touchpoints, campaigns" },
      { label: "Strategy", value: "Ownable symbol + color clarity + optimistic language" },
      { label: "Palette", value: "Cobalt blue with warm neutral beige" },
    ],
    intro: [
      "COME TRUE is built around optimism you can hold: coffee and pastry as a small daily reset. The identity treats the brand message as a motion cue—light, forward, and clear—so every surface feels like a gentle push toward better days.",
      "A simplified bird icon becomes the anchor: easy to recognize, easy to repeat, and flexible across packaging and campaign moments. Cobalt blue provides instant recall, beige keeps the system warm and approachable, and open-sky imagery supports a clean, uplifting tone across product photography and lifestyle scenes.",
    ],
    sections: [
      {
        eyebrow: "Concept",
        title: "Dreams, distilled into everyday ritual",
        body: [
          "The concept phase centered on a simple idea: dreams taking shape in the everyday. The bird motif and open-sky language give the brand a clear emotional direction without becoming sentimental.",
          "By keeping the system minimal and repeatable, the identity stays strong across packaging, signage, and campaign imagery.",
        ],
        imageLayout: "left",
        tone: "light",
      },
      {
        eyebrow: "Identity System",
        title: "Packaging behavior and symbol clarity",
        body: [
          "The identity system prioritizes recognition: a consistent cobalt signature, a simple icon, and packaging layouts that stay readable at speed.",
          "From cups to pastry boxes, the components remix cleanly while keeping the brand message and visual rhythm intact.",
        ],
        imageLayout: "right",
        tone: "light",
      },
      {
        eyebrow: "Brand In Use",
        title: "Carryout, campaigns, and merch presence",
        body: [
          "Applications prove the brand in the places it lives: carryout moments, café environments, and campaign-ready visuals.",
          "Merchandise and retail extensions keep the same optimistic tone—strong in product photography and equally confident in lifestyle imagery.",
        ],
        imageLayout: "left",
        tone: "navy",
      },
    ],
    impactMetrics: [
      { label: "Recall", value: "Clearer recall through a simple, ownable symbol and bold cobalt color system." },
      { label: "Consistency", value: "Consistent expression across cups, pastry boxes, merchandise, and digital campaign assets." },
      { label: "Flexibility", value: "A flexible identity that feels equally strong in product photography and lifestyle imagery." },
    ],
    credits: [
      { label: "Services", value: "Branding, Visual Identity, Packaging Direction, Art Direction" },
    ],
  },

  "wahed-makhlout": {
    heroLabel: "Brand Identity",
    heroTitle: "WAHED MAKHLOUT",
    heroSubtitle: "A tea brand shaped to feel rooted, warm, and instantly recognizable across takeaway and retail touchpoints.",
    heroSummary: "WAHED MAKHLOUT builds a tea identity around warmth, ritual, and a single memorable blend—pairing expressive Arabic typography with a color-led system across packaging, cups, and campaign visuals.",
    introMeta: {
      type: "Branding",
      client: "WAHED MAKHLOUT",
      deliverables: "Brand identity, packaging, cup design, merchandise, campaign visuals",
      launchLabel: "Explore the identity",
    },
    overview: [
      { label: "Service", value: "Branding" },
      { label: "Scope", value: "Identity, packaging, cups, takeaway presentation, campaigns" },
      { label: "Strategy", value: "One blend promise + color-led recognition + Arabic typographic voice" },
      { label: "Palette", value: "Deep tea red with leaf green and botanical light tones" },
    ],
    intro: [
      "WAHED MAKHLOUT is designed around one clear promise: a single blend you remember. The identity leans into ritual—cup in hand, takeaway in motion, packaging on the counter—building recognition through repeatable cues rather than over-designed complexity.",
      "A compact Arabic wordmark anchors the system, while the palette does the heavy lifting: rich hibiscus-inspired red for appetite and warmth, leaf green for grounded contrast, and soft botanical light tones to keep the surfaces breathable. The brand language extends naturally into characters and illustrations tied to tea culture without becoming ornamental.",
    ],
    sections: [
      {
        eyebrow: "Concept",
        title: "One blend, unmistakable presence",
        body: [
          "The concept stage focused on making the brand feel immediate and ownable: a single-blend thesis supported by a bold, color-led identity.",
          "Expressive Arabic typography and simple graphic cues create a recognizable signature that stays consistent across packaging and campaigns.",
        ],
        imageLayout: "left",
        tone: "light",
      },
      {
        eyebrow: "Identity System",
        title: "Typography, carriers, and the hero pack",
        body: [
          "The identity system sets rules for how the mark, typography, and illustration elements behave across cups, carriers, and packaging.",
          "The goal is clarity at speed—assets that read instantly in takeaway motion while staying rich enough for retail presence.",
        ],
        imageLayout: "right",
        tone: "light",
      },
      {
        eyebrow: "Brand In Use",
        title: "Everyday touchpoints, consistent ritual",
        body: [
          "Brand-in-use applications prioritize the everyday: cups, carry trays, and packaging moments where repetition builds familiarity.",
          "The system extends cleanly into merchandise and lifestyle imagery while keeping a warm, rooted tone.",
        ],
        imageLayout: "left",
        tone: "navy",
      },
    ],
    impactMetrics: [
      { label: "Recall", value: "Stronger recall through a compact Arabic wordmark and a color-led identity system." },
      { label: "Consistency", value: "A consistent brand presence across cups, packaging, and wearable applications." },
      { label: "Flexibility", value: "A flexible visual language that supports both product communication and lifestyle imagery." },
    ],
    credits: [
      { label: "Services", value: "Branding, Visual Identity, Packaging Direction, Art Direction" },
    ],
  },

  "lima": {
    heroLabel: "Brand Identity",
    heroTitle: "lima",
    heroSubtitle: "A refined abaya brand designed to feel modern, composed, and premium across retail and digital touchpoints.",
    heroSummary: "lima builds a fashion identity around restraint and polish—rich burgundy tone, soft blush contrast, and an editorial system that carries from packaging to garment presentation and social rollouts.",
    introMeta: {
      type: "Branding",
      client: "lima",
      deliverables: "Brand identity, packaging, stationery, garment presentation, social assets",
      launchLabel: "Explore the identity",
    },
    overview: [
      { label: "Service", value: "Branding" },
      { label: "Scope", value: "Identity, packaging, stationery, social campaign assets" },
      { label: "Strategy", value: "Fashion-first restraint with tonal contrast and editorial composition" },
      { label: "Palette", value: "Burgundy + blush with elegant neutrals" },
    ],
    intro: [
      "lima is a fashion brand built around restraint. The identity emphasizes clean composition, controlled typography, and a tonal palette that feels confident without being loud—supporting an abaya world where silhouette and material do the storytelling.",
      "Deep burgundy creates weight and presence, soft blush introduces warmth, and off-white neutrals keep the system breathable. The result is a refined print language that scales across labels, packaging, and social formats while maintaining an editorial, composed tone.",
    ],
    sections: [
      {
        eyebrow: "Concept",
        title: "Fashion-first restraint",
        body: [
          "The concept phase framed lima through composition and tone: controlled layouts, shadow-led imagery, and burgundy as a signature of depth and confidence.",
          "By keeping the typography minimal and the palette disciplined, the brand stays modern and premium across retail and digital contexts.",
        ],
        imageLayout: "left",
        tone: "light",
      },
      {
        eyebrow: "Identity System",
        title: "Logo application and restrained print language",
        body: [
          "The identity system focuses on repeatable applications—labels, packaging, and stationery—where restraint reads as quality.",
          "Supporting print elements are quiet by design, letting the garments and editorial styling carry the visual lead.",
        ],
        imageLayout: "right",
        tone: "light",
      },
      {
        eyebrow: "Brand In Use",
        title: "Packaging, tags, and social rollout",
        body: [
          "Brand-in-use applications prioritize cohesive presentation: bags, tags, cards, and packaging moments designed to feel composed in-hand and on-camera.",
          "The system translates cleanly to social assets, maintaining the same premium tone through typography, color, and spacing discipline.",
        ],
        imageLayout: "left",
        tone: "navy",
      },
    ],
    impactMetrics: [
      { label: "Recognition", value: "Stronger recognition through a disciplined, fashion-led identity system." },
      { label: "Consistency", value: "Consistent expression across packaging, tags, stationery, and social touchpoints." },
      { label: "Premium Feel", value: "A premium brand presence supported by controlled typography and tonal contrast." },
    ],
    credits: [
      { label: "Services", value: "Branding, Visual Identity, Packaging Direction, Art Direction" },
    ],
  },

  "neamah": {
    heroLabel: "Brand Identity",
    heroTitle: "Neamah",
    heroSubtitle: "A heritage bakery identity shaped to feel celebratory, culturally rooted, and premium across gifting and retail touchpoints.",
    heroSummary: "Neamah reframes a heritage sweets and bakery brand as a warm, giftable visual world—floral illustration, soft-tone packaging, and gold-led details across categories, seasons, and retail presentation.",
    introMeta: {
      type: "Branding",
      client: "Neamah",
      deliverables: "Brand identity, packaging, illustration system, retail applications, campaign visuals",
      launchLabel: "Explore the system",
    },
    overview: [
      { label: "Service", value: "Branding" },
      { label: "Scope", value: "Identity, packaging system, illustration direction, retail presence" },
      { label: "Strategy", value: "Heritage storytelling + giftable premium packaging language" },
      { label: "Tone", value: "Warm, celebratory, hospitality-led" },
    ],
    intro: [
      "Neamah's identity work focuses on the emotional value of traditional sweets: memory, hospitality, and celebration. The system is designed to feel giftable and premium without losing the warmth that makes the category feel personal.",
      "Rich red and green create the core signature, while pastel variants and floral ornament let the packaging flex across product types and seasons. Gold detailing and structured layouts keep the world refined, and a character-led family story adds a human layer without relying on dated nostalgia.",
    ],
    sections: [
      {
        eyebrow: "Concept",
        title: "Memory, generosity, and the value of sweets",
        body: [
          "The concept phase framed Neamah as more than product—it's a gesture. The system is designed for gifting moments where packaging carries meaning before the box is opened.",
          "Warm color roles and refined structure turn heritage cues into an identity that feels current, premium, and emotionally resonant.",
        ],
        imageLayout: "left",
        tone: "light",
      },
      {
        eyebrow: "Identity System",
        title: "Floral motifs and a flexible packaging language",
        body: [
          "Floral illustration and soft-tone variants build a recognizable signature that can adapt across categories while staying cohesive.",
          "The packaging language balances ornament with structure: consistent typography, clear hierarchy, and gold detailing for premium finish.",
        ],
        imageLayout: "right",
        tone: "light",
      },
      {
        eyebrow: "Brand In Use",
        title: "Premium gifting and retail presence",
        body: [
          "Applications focus on how the brand shows up in the world—on shelves, in seasonal moments, and in off-site gifting contexts.",
          "The system supports everyday offerings and special releases with the same core voice, keeping the world cohesive and elevated.",
        ],
        imageLayout: "left",
        tone: "navy",
      },
    ],
    impactMetrics: [
      { label: "Recall", value: "Stronger recall through a distinctive heritage-led illustration system and color signature." },
      { label: "Consistency", value: "Consistent expression across gifting, bakery, and retail packaging formats." },
      { label: "Flexibility", value: "A premium identity that flexes across everyday and seasonal offerings without losing coherence." },
    ],
    credits: [
      { label: "Services", value: "Branding, Visual Identity, Packaging Direction, Art Direction" },
    ],
  },
};

// ─── Image upload ─────────────────────────────────────────────────────────────

async function uploadImage(slug: string, filePath: string): Promise<string> {
  const filename = path.basename(filePath);
  const storagePath = `projects/${slug}/${filename}`;

  try {
    const fileBuffer = await fs.readFile(filePath);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, { contentType: "image/webp", upsert: true });
    if (error && !error.message.toLowerCase().includes("already exists")) {
      console.warn(`  Upload warning for ${filename}: ${error.message}`);
    }
  } catch (e) {
    console.warn(`  Could not read ${filePath}: ${(e as Error).message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// ─── AR translations builder ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildProjectArTranslations(ar: Record<string, any>): Record<string, unknown> {
  const t: Record<string, unknown> = {
    title: ar.title,
    tags: ar.tags,
  };
  if (ar.copy) {
    Object.assign(t, {
      hero_label:    ar.copy.heroLabel,
      hero_title:    ar.copy.heroTitle,
      hero_subtitle: ar.copy.heroSubtitle,
      hero_summary:  ar.copy.heroSummary,
      project_type:  ar.copy.introMeta?.type,
      client:        ar.copy.introMeta?.client,
      deliverables:  ar.copy.introMeta?.deliverables,
      launch_label:  ar.copy.introMeta?.launchLabel,
      intro:         ar.copy.intro,
    });
  }
  return t;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const snapshotPath = path.resolve(process.cwd(), "tmp/seed-projects.en-ar.snapshot.txt");
  const raw = await fs.readFile(snapshotPath, "utf-8");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const snapshot: { projects: any[] } = JSON.parse(raw);

  // Delete all existing projects (cascade removes all children)
  console.log("Deleting existing projects…");
  const { error: delErr } = await supabase.from("projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) {
    console.error("Failed to delete projects:", delErr.message);
    process.exit(1);
  }
  console.log("Existing projects deleted ✓\n");

  for (const p of snapshot.projects) {
    const slug: string = p.slug;
    console.log(`→ Seeding: ${slug}`);

    // Resolve EN copy (from snapshot or fallback map)
    const copy: EnCopy = p.copy ?? EN_COPY[p.key];
    if (!copy) {
      console.error(`  ✗ No EN copy found for ${slug}`);
      continue;
    }

    // Resolve AR locale data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ar: Record<string, any> | null = p.locales?.ar ?? null;

    // ── Upload images ────────────────────────────────────────────────────────
    console.log("  Uploading images…");

    const coverImageUrl = await uploadImage(slug, p.media.cardImage.filePath);
    const showcaseImageUrl = await uploadImage(slug, p.media.primaryShowcase.filePath);

    const sectionImageUrls: string[] = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      p.media.storySections.map((s: any) => uploadImage(slug, s.filePath))
    );

    const galleryItems: Array<{ filePath: string; alt: string }> = p.media.gallery;
    const uploadedPaths = new Map<string, string>();
    for (const g of galleryItems) {
      if (!uploadedPaths.has(g.filePath)) {
        uploadedPaths.set(g.filePath, await uploadImage(slug, g.filePath));
      }
    }
    const galleryImageUrls = galleryItems.map((g) => uploadedPaths.get(g.filePath)!);

    console.log("  Images uploaded ✓");

    // ── Build translations jsonb ─────────────────────────────────────────────
    const translations: Record<string, unknown> = ar
      ? { ar: buildProjectArTranslations(ar) }
      : {};

    // ── Theme palette ────────────────────────────────────────────────────────
    const themePalette = p.themePalette ?? {};

    // ── Insert main project row ──────────────────────────────────────────────
    const { data: row, error: rowErr } = await supabase
      .from("projects")
      .insert({
        slug,
        title:                      p.title,
        tags:                       p.tags,
        aspect_ratio:               p.cardAspectRatio,
        cover_image_url:            coverImageUrl,
        published:                  true,
        sort_order:                 p.sortOrder,
        service_type:               p.serviceType ?? "",
        work_filters:               p.workFilters ?? [],
        featured_aspect_ratio:      p.featuredAspectRatio ?? p.cardAspectRatio,
        inherit_theme_from_palette: p.inheritThemeFromPalette ?? false,
        theme_palette:              themePalette,
        hero_label:                 copy.heroLabel,
        hero_title:                 copy.heroTitle,
        hero_subtitle:              copy.heroSubtitle,
        hero_summary:               copy.heroSummary,
        hero_image_url:             showcaseImageUrl,
        client:                     copy.introMeta.client,
        project_type:               copy.introMeta.type,
        deliverables:               copy.introMeta.deliverables,
        launch_label:               copy.introMeta.launchLabel,
        launch_url:                 "",
        intro:                      copy.intro,
        showcase_image_url:         showcaseImageUrl,
        showcase_alt:               p.media.primaryShowcase.alt,
        showcase_label:             "Primary showcase",
        feature_eyebrow:            "",
        feature_title:              "",
        feature_body:               "",
        translations,
      })
      .select("id")
      .single();

    if (rowErr || !row) {
      console.error(`  ✗ Failed to insert project: ${rowErr?.message}`);
      continue;
    }

    const projectId: string = row.id;
    console.log(`  Project row inserted (${projectId})`);

    // ── Insert story sections ────────────────────────────────────────────────
    if (copy.sections.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const arSections: any[] = ar?.copy?.sections ?? [];

      const { error: secErr } = await supabase.from("project_sections").insert(
        copy.sections.map((s, i) => ({
          project_id:   projectId,
          eyebrow:      s.eyebrow,
          title:        s.title,
          body:         s.body,
          image_url:    sectionImageUrls[i] ?? "",
          image_alt:    p.media.storySections[i]?.alt ?? "",
          image_layout: s.imageLayout,
          tone:         s.tone,
          sort_order:   i,
          translations: arSections[i]
            ? { ar: { eyebrow: arSections[i].eyebrow, title: arSections[i].title, body: arSections[i].body } }
            : {},
        }))
      );
      if (secErr) console.error(`  ✗ Sections: ${secErr.message}`);
      else console.log(`  ${copy.sections.length} sections inserted ✓`);
    }

    // ── Insert gallery ───────────────────────────────────────────────────────
    if (galleryItems.length) {
      const { error: galErr } = await supabase.from("project_gallery").insert(
        galleryItems.map((g, i) => ({
          project_id:  projectId,
          image_url:   galleryImageUrls[i],
          image_alt:   g.alt,
          image_label: `Frame ${String(i + 1).padStart(2, "0")}`,
          sort_order:  i,
        }))
      );
      if (galErr) console.error(`  ✗ Gallery: ${galErr.message}`);
      else console.log(`  ${galleryItems.length} gallery images inserted ✓`);
    }

    // ── Insert impact metrics ────────────────────────────────────────────────
    if (copy.impactMetrics.length) {
      const arMetrics: FactRow[] = ar?.copy?.impactMetrics ?? [];
      const { error: metErr } = await supabase.from("project_metrics").insert(
        copy.impactMetrics.map((m, i) => ({
          project_id:   projectId,
          label:        m.label,
          value:        m.value,
          sort_order:   i,
          translations: arMetrics[i]
            ? { ar: { label: arMetrics[i].label, value: arMetrics[i].value } }
            : {},
        }))
      );
      if (metErr) console.error(`  ✗ Metrics: ${metErr.message}`);
      else console.log(`  ${copy.impactMetrics.length} metrics inserted ✓`);
    }

    // ── Insert credits ───────────────────────────────────────────────────────
    if (copy.credits.length) {
      const arCredits: FactRow[] = ar?.copy?.credits ?? [];
      const { error: credErr } = await supabase.from("project_credits").insert(
        copy.credits.map((c, i) => ({
          project_id:   projectId,
          label:        c.label,
          value:        c.value,
          sort_order:   i,
          translations: arCredits[i]
            ? { ar: { label: arCredits[i].label, value: arCredits[i].value } }
            : {},
        }))
      );
      if (credErr) console.error(`  ✗ Credits: ${credErr.message}`);
      else console.log(`  ${copy.credits.length} credits inserted ✓`);
    }

    // ── Insert overview facts ────────────────────────────────────────────────
    if (copy.overview.length) {
      const arOverview: FactRow[] = ar?.copy?.overview ?? [];
      const { error: ovErr } = await supabase.from("project_overview").insert(
        copy.overview.map((o, i) => ({
          project_id:   projectId,
          label:        o.label,
          value:        o.value,
          sort_order:   i,
          translations: arOverview[i]
            ? { ar: { label: arOverview[i].label, value: arOverview[i].value } }
            : {},
        }))
      );
      if (ovErr) console.error(`  ✗ Overview: ${ovErr.message}`);
      else console.log(`  ${copy.overview.length} overview facts inserted ✓`);
    }

    // ── Insert process phases ────────────────────────────────────────────────
    const processPhases: ProcessPhase[] = copy.process ?? [];
    if (processPhases.length) {
      const arProcess: Array<{ phase: string; label: string; desc: string }> =
        ar?.copy?.process ?? [];
      const { error: procErr } = await supabase.from("project_process").insert(
        processPhases.map((ph, i) => ({
          project_id:   projectId,
          phase:        ph.phase,
          label:        ph.label,
          description:  ph.desc,
          sort_order:   i,
          translations: arProcess[i]
            ? { ar: { label: arProcess[i].label, description: arProcess[i].desc } }
            : {},
        }))
      );
      if (procErr) console.error(`  ✗ Process phases: ${procErr.message}`);
      else console.log(`  ${processPhases.length} process phases inserted ✓`);
    }

    console.log(`✓ ${slug} seeded`);
  }

  console.log("\nSeed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
