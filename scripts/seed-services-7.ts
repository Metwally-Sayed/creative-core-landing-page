import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map existing section IDs (in sort order) → the 7 services from the home
// what_we_do block. Each entry rewrites eyebrow/title/body/section_id/
// link_label in both EN and AR. Cards (image + slug) are preserved; their
// subtitles are retuned to match the new service framing.

type CardOverride = { en: string; ar: string };

type SeedEntry = {
  sectionId: string;
  newSectionAnchor: string;
  en: { eyebrow: string; title: string; body: string; link_label: string };
  ar: { eyebrow: string; title: string; body: string; link_label: string };
  cardSubtitle: CardOverride; // applied to all cards in this section
  clearCards?: boolean;
};

const SEED: SeedEntry[] = [
  // 1. Branding (was Brand Identity)
  {
    sectionId: "8fa5e26d-8e62-428a-9464-e108ad6f1bc6",
    newSectionAnchor: "branding",
    en: {
      eyebrow: "We Build",
      title: "Branding",
      body:
        "We define your place in the market and build an identity that speaks for you — not like anyone else. Logo, color, typography, tone of voice, and brand guidelines that scale across every touchpoint.",
      link_label: "View Branding Work",
    },
    ar: {
      eyebrow: "نبني",
      title: "البراندينج",
      body:
        "نحدد مكانك في السوق ونبني هوية تعبّر عنك… مو تشبه غيرك. شعار، ألوان، طباعة، نبرة صوت، وإرشادات للعلامة تتوسع في كل نقطة تواصل.",
      link_label: "اطّلع على أعمال البراندينج",
    },
    cardSubtitle: { en: "Branding", ar: "البراندينج" },
  },

  // 2. Product Photography (was Packaging & Print Design)
  {
    sectionId: "57407d89-22bc-46c6-bb0a-2aca3a6c401f",
    newSectionAnchor: "product-photography",
    en: {
      eyebrow: "We Capture",
      title: "Product Photography",
      body:
        "We shoot your products in a way that catches the eye — and sells. Studio sessions, lifestyle, packaging shots, and campaign visuals built to perform online and on shelf.",
      link_label: "View Photography Work",
    },
    ar: {
      eyebrow: "نلتقط",
      title: "تصوير المنتجات",
      body:
        "نصوّر منتجاتك بطريقة تخليها تلفت… وتنباع. جلسات استوديو، لايف ستايل، تصوير تغليف، ومرئيات حملات مبنية لتؤدي على الإنترنت وعلى الرف.",
      link_label: "اطّلع على أعمال التصوير",
    },
    cardSubtitle: { en: "Product Photography", ar: "تصوير المنتجات" },
  },

  // 3. Digital Marketing (was Social Media Strategy — had no cards)
  {
    sectionId: "75fc8be5-ce77-491f-b0b5-b36cdf4fa3e1",
    newSectionAnchor: "digital-marketing",
    en: {
      eyebrow: "We Plan",
      title: "Digital Marketing",
      body:
        "We plan it right and make every step serve a clear goal. Strategy, paid campaigns, content pillars, and performance-driven creative across every platform that matters.",
      link_label: "View Marketing Work",
    },
    ar: {
      eyebrow: "نخطط",
      title: "التسويق الإلكتروني",
      body:
        "نخطط لك صح ونخلي كل خطوة تخدم هدف واضح. استراتيجية، حملات مدفوعة، محاور محتوى، وإبداع مبني على الأداء عبر كل منصة تهم.",
      link_label: "اطّلع على أعمال التسويق",
    },
    cardSubtitle: { en: "Digital Marketing", ar: "التسويق الإلكتروني" },
  },

  // 4. Content Creation (was Content Creation — kept)
  {
    sectionId: "8eb45fd9-8958-48b8-a625-d54552041a24",
    newSectionAnchor: "content-creation",
    en: {
      eyebrow: "We Create",
      title: "Content Creation",
      body:
        "Content that feels like you and makes people remember you. Photography concepts, reels, captions, and campaign messaging built to live across platforms.",
      link_label: "View Content Work",
    },
    ar: {
      eyebrow: "نصنع",
      title: "صناعة المحتوى",
      body:
        "محتوى يشبهك ويخلي الناس تتذكرك. مفاهيم تصوير، ريلز، تعليقات، ورسائل حملات مبنية لتعيش عبر المنصات.",
      link_label: "اطّلع على أعمال المحتوى",
    },
    cardSubtitle: { en: "Content Creation", ar: "صناعة المحتوى" },
  },

  // 5. Motion Graphics & Editing (was Marketing & Campaign Direction)
  {
    sectionId: "180cfc8d-5d69-474d-bd57-58680b3b4bb2",
    newSectionAnchor: "motion-graphics",
    en: {
      eyebrow: "We Animate",
      title: "Motion Graphics & Editing",
      body:
        "We turn ideas into videos — fast, clear, attention-grabbing. Motion design, edits, ads, and brand films that move the story forward.",
      link_label: "View Motion Work",
    },
    ar: {
      eyebrow: "نحرّك",
      title: "موشن جرافيك والمونتاج",
      body:
        "نحوّل الأفكار لفيديوهات سريعة، واضحة، وتشد الانتباه. تصميم حركي، مونتاج، إعلانات، وأفلام للعلامة تدفع القصة للأمام.",
      link_label: "اطّلع على أعمال الموشن",
    },
    cardSubtitle: { en: "Motion & Film", ar: "موشن وفيلم" },
  },

  // 6. Website Development & App Systems (was Website & Digital Presence)
  {
    sectionId: "547aa6c6-fe4e-4191-bf6c-49fb87be95d4",
    newSectionAnchor: "websites-apps",
    en: {
      eyebrow: "We Build",
      title: "Websites & App Systems",
      body:
        "We build websites and apps that reflect your brand and make the experience smoother and clearer. Design, development, content systems, and performance built to scale.",
      link_label: "View Web Work",
    },
    ar: {
      eyebrow: "نبني",
      title: "إنشاء مواقع وتطبيقات",
      body:
        "نبني مواقع وتطبيقات تعكس براندك وتخلي التجربة أسهل وأوضح. تصميم، تطوير، أنظمة محتوى، وأداء مبني للنمو.",
      link_label: "اطّلع على الأعمال الرقمية",
    },
    cardSubtitle: { en: "Websites & Apps", ar: "مواقع وتطبيقات" },
  },

  // 7. 3D, Visuals & Interior Design (was 3D & Interior Design — kept)
  {
    sectionId: "76268b12-1db8-46f8-a63f-a812e265cecf",
    newSectionAnchor: "3d-interior",
    en: {
      eyebrow: "We Design",
      title: "3D, Visuals & Interior Design",
      body:
        "Designs and visual spaces that give your brand or home a presence felt before it's explained. 3D visualizations, moodboards, and interior direction that translate identity into space.",
      link_label: "View 3D Work",
    },
    ar: {
      eyebrow: "نصمم",
      title: "التصميم الداخلي وثلاثي الأبعاد",
      body:
        "تصميمات ومساحات بصرية تعطي البراند أو بيتك حضور يُحس قبل ينشرح. تصورات ثلاثية الأبعاد، لوحات مزاج، وتوجيه تصميم داخلي يترجم الهوية إلى مكان.",
      link_label: "اطّلع على أعمال التصميم ثلاثي الأبعاد",
    },
    cardSubtitle: { en: "3D & Interior", ar: "ثلاثي الأبعاد والداخلي" },
  },
];

type Card = {
  slug?: string;
  title?: string;
  subtitle?: string;
  image_url?: string;
};

function rewriteCards(cards: Card[] | undefined, subtitle: string): Card[] {
  if (!Array.isArray(cards)) return [];
  return cards.map((c) => ({ ...c, subtitle }));
}

async function main() {
  let updated = 0;
  for (const entry of SEED) {
    const { data: row, error: readErr } = await supabase
      .from("page_sections")
      .select("id, content, translations")
      .eq("id", entry.sectionId)
      .single();

    if (readErr || !row) {
      console.error(`✗ ${entry.sectionId}: read failed`, readErr?.message);
      continue;
    }

    const enContent = (row.content ?? {}) as Record<string, unknown>;
    const enCards = enContent.cards as Card[] | undefined;
    const arBlock = ((row.translations?.ar ?? {}) as Record<string, unknown>);
    const arCards = arBlock.cards as Card[] | undefined;

    const nextEn = {
      ...enContent,
      eyebrow: entry.en.eyebrow,
      title: entry.en.title,
      body: entry.en.body,
      link_label: entry.en.link_label,
      section_id: entry.newSectionAnchor,
      cards: rewriteCards(enCards, entry.cardSubtitle.en),
    };
    const nextAr = {
      ...arBlock,
      eyebrow: entry.ar.eyebrow,
      title: entry.ar.title,
      body: entry.ar.body,
      link_label: entry.ar.link_label,
      cards: rewriteCards(arCards, entry.cardSubtitle.ar),
    };

    const { error: writeErr } = await supabase
      .from("page_sections")
      .update({
        content: nextEn,
        translations: { ...row.translations, ar: nextAr },
      })
      .eq("id", row.id);

    if (writeErr) {
      console.error(`✗ ${entry.en.title}: write failed`, writeErr.message);
      continue;
    }
    console.log(`✓ ${entry.en.title} / ${entry.ar.title}`);
    updated++;
  }

  console.log(`\n${updated}/${SEED.length} updated`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
