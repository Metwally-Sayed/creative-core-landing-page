// ─── Types ────────────────────────────────────────────────────────────────────

export type Bilingual = { en: string; ar: string };

export type ServiceCard = {
  title: Bilingual;
  subtitle: Bilingual;
  imageUrl: string;
  slug: string;
};

export type ServiceSection = {
  id: string;
  eyebrow: Bilingual;
  title: Bilingual;
  body: Bilingual;
  linkLabel: Bilingual;
  cards: [ServiceCard, ServiceCard];
};

export type AwardStat = {
  label: Bilingual;
  value: string;
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

export const servicesHero: {
  title: Bilingual;
  body: Bilingual;
  list: Bilingual[];
} = {
  title: { en: "Our Services", ar: "خدماتنا" },
  body: {
    en: "We offer creative solutions designed to help brands grow with clarity, consistency, and impact.",
    ar: "نقدّم حلولاً إبداعية مصمَّمة لمساعدة العلامات التجارية على النمو بوضوح واتساق وتأثير.",
  },
  list: [
    { en: "Brand Identity",                 ar: "هوية العلامة التجارية"           },
    { en: "Packaging & Print Design",       ar: "تصميم التغليف والطباعة"          },
    { en: "Social Media Strategy",          ar: "استراتيجية وسائل التواصل"        },
    { en: "Content Creation",               ar: "إنتاج المحتوى"                   },
    { en: "Marketing & Campaign Direction", ar: "التسويق وإدارة الحملات"          },
    { en: "Website & Digital Presence",     ar: "الويب والحضور الرقمي"            },
    { en: "3D & Interior Design",           ar: "التصميم ثلاثي الأبعاد والداخلي" },
  ],
};

// ─── Sections ─────────────────────────────────────────────────────────────────

export const serviceSections: ServiceSection[] = [
  {
    id: "identity",
    eyebrow:   { en: "We Build",  ar: "نبني"   },
    title:     { en: "Identity & Packaging",  ar: "الهوية والتغليف"         },
    body: {
      en: "We craft brand identities and packaging systems that stay consistent across every touchpoint. From logos and typography to bold box designs and retail presence — every detail is intentional.",
      ar: "نصنع هويات بصرية وأنظمة تغليف متناسقة عبر كل نقطة تواصل. من الشعارات والطباعة إلى تصاميم العبوات الجريئة والحضور في نقاط البيع — كل تفصيلة مقصودة.",
    },
    linkLabel: { en: "View Identity Work",    ar: "اطّلع على أعمال الهوية"   },
    cards: [
      {
        title:    { en: "A bold identity that speaks before words do.", ar: "هوية جريئة تتحدث قبل الكلمات." },
        subtitle: { en: "Brand Identity",   ar: "هوية العلامة التجارية" },
        imageUrl: "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/burgito/burgitowebsite-13.webp",
        slug: "burgito",
      },
      {
        title:    { en: "Packaging that earns its place on the shelf.", ar: "تغليف يستحق مكانه على الرف." },
        subtitle: { en: "Packaging & Print", ar: "التغليف والطباعة"        },
        imageUrl: "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/mazaq/mazaqwebsite-02.webp",
        slug: "mazaq",
      },
    ],
  },
  {
    id: "content",
    eyebrow:   { en: "We Create", ar: "نصنع"   },
    title:     { en: "Content & Campaigns",    ar: "المحتوى والحملات"        },
    body: {
      en: "We tell brand stories across every channel — social media strategy, campaign direction, and content that connects emotionally and drives real results. Visual, verbal, and always on-brand.",
      ar: "نحكي قصص العلامات التجارية عبر كل قناة — استراتيجية وسائل التواصل الاجتماعي وإدارة الحملات ومحتوى يتواصل عاطفياً ويحقق نتائج حقيقية. بصرياً ولفظياً، ودائماً بروح العلامة.",
    },
    linkLabel: { en: "View Campaign Work",     ar: "اطّلع على أعمال الحملات" },
    cards: [
      {
        title:    { en: "A campaign rooted in culture and craving.",      ar: "حملة متجذّرة في الثقافة والشوق."       },
        subtitle: { en: "Campaign Direction",  ar: "إدارة الحملة"          },
        imageUrl: "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/wahed-makhlout/TEAwebsite-01.webp",
        slug: "wahed-makhlout",
      },
      {
        title:    { en: "Content that feels personal, not promotional.",  ar: "محتوى يبدو شخصياً لا ترويجياً."       },
        subtitle: { en: "Social Content",      ar: "محتوى التواصل الاجتماعي" },
        imageUrl: "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/come-true/cometruewebsite-07.webp",
        slug: "come-true",
      },
    ],
  },
  {
    id: "digital",
    eyebrow:   { en: "We Design", ar: "نصمم"   },
    title:     { en: "Digital & Strategy",     ar: "الرقمي والاستراتيجية"   },
    body: {
      en: "We help brands define who they are online — from brand strategy and positioning to websites and digital experiences that elevate presence, communicate clearly, and perform.",
      ar: "نساعد العلامات التجارية على تحديد هويتها الرقمية — من الاستراتيجية والتموضع إلى المواقع والتجارب الرقمية التي ترفع الحضور وتتواصل بوضوح وتؤدي.",
    },
    linkLabel: { en: "View Digital Work",      ar: "اطّلع على الأعمال الرقمية" },
    cards: [
      {
        title:    { en: "A digital system built around appetite.",         ar: "نظام رقمي مبني حول الشهية."             },
        subtitle: { en: "Brand Strategy",      ar: "استراتيجية العلامة"    },
        imageUrl: "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/qpasta/Qwebsite-01.webp",
        slug: "qpasta",
      },
      {
        title:    { en: "Retail branding that commands attention in-store.", ar: "علامة تجارية للتجزئة تستأثر بالانتباه." },
        subtitle: { en: "Digital Presence",    ar: "الحضور الرقمي"         },
        imageUrl: "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/neamah/Nwebsite-01.webp",
        slug: "neamah",
      },
    ],
  },
];

// ─── Credentials ──────────────────────────────────────────────────────────────

export const credentialsSection = {
  eyebrow: { en: "Our Track Record", ar: "سجلنا" },
  title:   { en: "Built to Perform", ar: "مبني للأداء" },
  body: {
    en: "Every project we take on is an opportunity to raise the bar. Here are some of the numbers behind the work.",
    ar: "كل مشروع نتولاه هو فرصة لرفع المستوى. إليك بعض الأرقام خلف الأعمال.",
  },
};

export const awardColumns: [AwardStat[], AwardStat[]] = [
  [
    { label: { en: "Happy Clients",       ar: "عميل سعيد"   }, value: "120+" },
    { label: { en: "Projects Delivered",  ar: "مشروع منجز"  }, value: "200+" },
  ],
  [
    { label: { en: "Years of Experience", ar: "سنة خبرة"    }, value: "8+"   },
    { label: { en: "Industries Served",   ar: "قطاع خدمناه" }, value: "25+"  },
  ],
];
