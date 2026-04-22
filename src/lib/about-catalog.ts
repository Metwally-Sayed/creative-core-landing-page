export type Bilingual = { en: string; ar: string };

// Legacy types kept for AboutCodeOfHonor.tsx compilation
export type CodeOfHonorArtKey =
  | "be-nice" | "powers-for-good" | "try-the-truth" | "enjoy-the-ride"
  | "speak-up-and-listen" | "solve-the-problem" | "help-each-other" | "team-up";
export type CodeOfHonorItem = {
  id: string;
  index: string;
  title: string;
  body: string;
  art: CodeOfHonorArtKey;
};

export type ProcessStep = {
  num: string;
  title: Bilingual;
  body: Bilingual;
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

export const aboutHero: { title: Bilingual; body: Bilingual } = {
  title: { en: "Who we are", ar: "من نحن" },
  body: {
    en: "We believe every successful brand starts with a strong core: a clear vision, a distinct personality, and a system that works across every touchpoint. That is where we come in. We combine creative thinking with practical execution to help businesses launch, grow, rebrand, and stand out in competitive markets.",
    ar: "نؤمن بأن كل علامة تجارية ناجحة تبدأ بجوهر قوي: رؤية واضحة، وشخصية مميزة، ونظام يعمل عبر كل نقطة تواصل. هنا يأتي دورنا. نجمع بين التفكير الإبداعي والتنفيذ العملي لمساعدة الشركات على الإطلاق والنمو وإعادة التسمية والتميز في الأسواق التنافسية.",
  },
};

// ─── Who Are We ───────────────────────────────────────────────────────────────

export const whoAreWe: {
  eyebrow: Bilingual;
  title: Bilingual;
  body: Bilingual;
} = {
  eyebrow: { en: "Our Story", ar: "قصتنا" },
  title: { en: "Who Are We?", ar: "من نحن؟" },
  body: {
    en: "Creative Core is a full-service creative agency founded on the belief that great design is more than aesthetics — it is strategy made visible. We partner with brands across industries to build identities, campaigns, and digital experiences that are rooted in purpose and built to last. From startups finding their voice to established businesses ready to evolve, we bring clarity to complexity and craft to every detail.",
    ar: "Creative Core وكالة إبداعية متكاملة أُسِّست على الإيمان بأن التصميم الجيد يتجاوز الجماليات — إنه استراتيجية مرئية. نشارك العلامات التجارية في مختلف القطاعات لبناء هويات وحملات وتجارب رقمية متجذّرة في الهدف ومبنية لتدوم. من الشركات الناشئة التي تبحث عن صوتها إلى الشركات الراسخة المستعدة للتطور، نجلب الوضوح للتعقيد والحرفية لكل تفصيلة.",
  },
};

// ─── Why Us ───────────────────────────────────────────────────────────────────

export const whyUs: {
  eyebrow: Bilingual;
  title: Bilingual;
  body: Bilingual;
} = {
  eyebrow: { en: "Why Creative Core", ar: "لماذا Creative Core" },
  title: { en: "Why Us?", ar: "لماذا نحن؟" },
  body: {
    en: "We do not believe in one-size-fits-all branding. Every business has a different story, different audience, and different goals — and your creative work should reflect that. We take the time to understand your brand from the inside out before we ever pick up a pencil. The result is work that feels distinctly yours: intentional, consistent, and built to perform.",
    ar: "لا نؤمن بنموذج واحد يناسب الجميع في العلامة التجارية. لكل شركة قصة مختلفة وجمهور مختلف وأهداف مختلفة — ويجب أن يعكس عملك الإبداعي ذلك. نأخذ الوقت الكافي لفهم علامتك التجارية من الداخل إلى الخارج قبل أن نرفع القلم. النتيجة عمل يبدو مميزاً بطابعك: مقصود ومتسق ومبني للأداء.",
  },
};

// ─── Mission ──────────────────────────────────────────────────────────────────

export const missionSection: {
  eyebrow: Bilingual;
  quote: Bilingual;
} = {
  eyebrow: { en: "Our Mission", ar: "مهمتنا" },
  quote: {
    en: "We exist to give every brand a core worth orbiting.",
    ar: "نحن هنا لنمنح كل علامة تجارية جوهراً يستحق أن تدور حوله.",
  },
};

// ─── Process ──────────────────────────────────────────────────────────────────

export const processSection: {
  eyebrow: Bilingual;
  title: Bilingual;
  body: Bilingual;
  steps: ProcessStep[];
} = {
  eyebrow: { en: "See the Work", ar: "شاهد الأعمال" },
  title: { en: "Our Process", ar: "طريقة عملنا" },
  body: {
    en: "Every great outcome starts with a clear process. Here is how we turn ambition into execution.",
    ar: "كل نتيجة رائعة تبدأ بمنهج واضح. هكذا نحوّل الطموح إلى تنفيذ.",
  },
  steps: [
    {
      num: "01",
      title: { en: "Discover", ar: "الاكتشاف" },
      body: {
        en: "We immerse ourselves in your world — your market, competitors, audience, and goals — to uncover what makes your brand worth noticing.",
        ar: "نغمر أنفسنا في عالمك — سوقك ومنافسيك وجمهورك وأهدافك — لاكتشاف ما يجعل علامتك التجارية تستحق الانتباه.",
      },
    },
    {
      num: "02",
      title: { en: "Strategy", ar: "الاستراتيجية" },
      body: {
        en: "We build the strategic foundation: positioning, voice, and a creative direction that gives every decision a north star.",
        ar: "نبني الأساس الاستراتيجي: التموضع والصوت والتوجه الإبداعي الذي يمنح كل قرار نجماً شمالياً.",
      },
    },
    {
      num: "03",
      title: { en: "Design", ar: "التصميم" },
      body: {
        en: "Strategy becomes form. We craft the visual and verbal systems that carry your brand consistently across every medium.",
        ar: "تتحوّل الاستراتيجية إلى شكل. نصنع الأنظمة البصرية واللفظية التي تحمل علامتك التجارية باتساق عبر كل وسيلة.",
      },
    },
    {
      num: "04",
      title: { en: "Launch", ar: "الإطلاق" },
      body: {
        en: "We deliver production-ready assets, guide implementation, and make sure the work lands the way it was designed to.",
        ar: "نسلّم الأصول الجاهزة للإنتاج ونوجّه التنفيذ ونتأكد من أن العمل ينطلق كما صُمِّم له.",
      },
    },
  ],
};
