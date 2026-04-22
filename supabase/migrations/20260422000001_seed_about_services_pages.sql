-- Seed the About and Services pages with page_sections so they appear
-- in the standard Admin → Pages editor (PageEditor / SectionEditor).
-- Uses upsert on slug so re-running is safe.

-- ── About page ────────────────────────────────────────────────────────────────

INSERT INTO pages (slug, title, meta_title, meta_description, og_image_url, published, sort_order, translations)
VALUES (
  'about',
  'About Us',
  'About Us | Hello Monday',
  'We are a full-service creative agency that combines creative thinking with practical execution to help brands launch, grow, and stand out.',
  '',
  true,
  20,
  '{}'::jsonb
)
ON CONFLICT (slug) DO UPDATE
  SET title        = EXCLUDED.title,
      meta_title   = EXCLUDED.meta_title,
      published    = EXCLUDED.published;

-- Delete old sections so we can re-seed cleanly
DELETE FROM page_sections WHERE page_id = (SELECT id FROM pages WHERE slug = 'about');

INSERT INTO page_sections (page_id, type, sort_order, content, translations)
SELECT
  p.id,
  v.type,
  v.sort_order,
  v.content,
  v.translations
FROM pages p,
(VALUES
  (
    'about_hero'::text, 1,
    '{"title": "We make brands worth remembering.", "body": "We are a full-service creative agency that combines creative thinking with practical execution to help brands launch, grow, and stand out."}'::jsonb,
    '{"ar": {"title": "نصنع علامات تجارية تستحق التذكُّر.", "body": "نحن وكالة إبداعية متكاملة تجمع بين التفكير الإبداعي والتنفيذ العملي لمساعدة العلامات التجارية على الانطلاق والنمو والتميّز."}}'::jsonb
  ),
  (
    'about_content'::text, 2,
    '{"section_id": "who-are-we", "eyebrow": "Who We Are", "title": "A team that gives a damn.", "body": "We are a team of designers, strategists, and storytellers who believe that great work starts with genuine curiosity. We dig into every brief, question every assumption, and push every idea until it earns its place."}'::jsonb,
    '{"ar": {"eyebrow": "من نحن", "title": "فريق يهتم حقاً.", "body": "نحن فريق من المصممين والاستراتيجيين وصنّاع القصص الذين يؤمنون بأن العمل الرائع يبدأ بفضول حقيقي. نتعمق في كل موجز، ونشكّك في كل افتراض، وندفع كل فكرة حتى تثبت جدارتها."}}'::jsonb
  ),
  (
    'about_content'::text, 3,
    '{"section_id": "why-us", "eyebrow": "Why Us", "title": "We don''t just deliver. We care.", "body": "Choosing an agency is a bet. We make sure it pays off. Every project we take on gets the same level of focus — whether it''s a startup''s first identity or a mature brand''s next chapter. We stay until it''s right."}'::jsonb,
    '{"ar": {"eyebrow": "لماذا نحن", "title": "لا نسلّم فحسب، بل نهتم.", "body": "اختيار وكالة هو رهان. نحرص على أن يؤتي ثماره. كل مشروع نتولاه يحظى بنفس مستوى التركيز — سواء كانت هوية شركة ناشئة أو الفصل التالي لعلامة ناضجة. نبقى حتى يكون الأمر صحيحاً."}}'::jsonb
  ),
  (
    'about_mission'::text, 4,
    '{"eyebrow": "Our Mission", "quote": "To make brands that earn attention, build trust, and outlast the trend."}'::jsonb,
    '{"ar": {"eyebrow": "مهمتنا", "quote": "صنع علامات تجارية تكسب الانتباه وتبني الثقة وتتجاوز الموضة."}}'::jsonb
  ),
  (
    'about_process'::text, 5,
    '{
      "eyebrow": "How We Work",
      "title": "A process built for real results.",
      "body": "We follow a structured but flexible process that keeps everyone aligned and every decision intentional.",
      "steps": [
        {"num": "01", "title": "Discover", "body": "We start by listening. Deep dives into your brand, market, audience, and ambition set the foundation for everything that follows."},
        {"num": "02", "title": "Define", "body": "We distill insights into a clear creative direction. Strategy, positioning, and a defined scope of work before a single pixel is drawn."},
        {"num": "03", "title": "Design", "body": "This is where ideas become tangible. We design with intention — every choice tied back to the brief, every detail considered."},
        {"num": "04", "title": "Deliver", "body": "We hand over work that is production-ready, documented, and built to last. And we stay available after launch."}
      ]
    }'::jsonb,
    '{
      "ar": {
        "eyebrow": "كيف نعمل",
        "title": "عملية مبنية لنتائج حقيقية.",
        "body": "نتبع عملية منظمة ومرنة تبقي الجميع متوافقين وكل قرار مقصوداً.",
        "steps": [
          {"num": "01", "title": "الاستكشاف", "body": "نبدأ بالاستماع. الغوص العميق في علامتك التجارية وسوقك وجمهورك وطموحك يضع الأساس لكل ما يأتي بعد ذلك."},
          {"num": "02", "title": "التحديد", "body": "نستخلص الرؤى في توجه إبداعي واضح. الاستراتيجية والتموضع ونطاق عمل محدد قبل رسم أي بكسل."},
          {"num": "03", "title": "التصميم", "body": "هنا تتحول الأفكار إلى شيء ملموس. نصمم بقصد — كل اختيار مرتبط بالموجز، كل تفصيلة مدروسة."},
          {"num": "04", "title": "التسليم", "body": "نسلّم عملاً جاهزاً للإنتاج، موثقاً، ومبنياً ليدوم. ونبقى متاحين بعد الإطلاق."}
        ]
      }
    }'::jsonb
  )
) AS v(type, sort_order, content, translations)
WHERE p.slug = 'about';


-- ── Services page ─────────────────────────────────────────────────────────────

INSERT INTO pages (slug, title, meta_title, meta_description, og_image_url, published, sort_order, translations)
VALUES (
  'services',
  'Services',
  'Services | Hello Monday',
  'Brand identity, packaging, content, campaigns, and digital presence — creative solutions built to grow your brand.',
  '',
  true,
  30,
  '{}'::jsonb
)
ON CONFLICT (slug) DO UPDATE
  SET title        = EXCLUDED.title,
      meta_title   = EXCLUDED.meta_title,
      published    = EXCLUDED.published;

DELETE FROM page_sections WHERE page_id = (SELECT id FROM pages WHERE slug = 'services');

INSERT INTO page_sections (page_id, type, sort_order, content, translations)
SELECT
  p.id,
  v.type,
  v.sort_order,
  v.content,
  v.translations
FROM pages p,
(VALUES
  (
    'services_hero'::text, 1,
    '{"title": "Our Services", "body": "We offer creative solutions designed to help brands grow with clarity, consistency, and impact."}'::jsonb,
    '{"ar": {"title": "خدماتنا", "body": "نقدّم حلولاً إبداعية مصمَّمة لمساعدة العلامات التجارية على النمو بوضوح واتساق وتأثير."}}'::jsonb
  ),
  (
    'services_section'::text, 2,
    '{
      "section_id": "identity",
      "eyebrow": "We Build",
      "title": "Identity & Packaging",
      "body": "We craft brand identities and packaging systems that stay consistent across every touchpoint. From logos and typography to bold box designs and retail presence — every detail is intentional.",
      "link_label": "View Identity Work",
      "cards": [
        {"title": "A bold identity that speaks before words do.", "subtitle": "Brand Identity", "image_url": "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/burgito/burgitowebsite-13.webp", "slug": "burgito"},
        {"title": "Packaging that earns its place on the shelf.", "subtitle": "Packaging & Print", "image_url": "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/mazaq/mazaqwebsite-02.webp", "slug": "mazaq"}
      ]
    }'::jsonb,
    '{
      "ar": {
        "eyebrow": "نبني",
        "title": "الهوية والتغليف",
        "body": "نصنع هويات بصرية وأنظمة تغليف متناسقة عبر كل نقطة تواصل. من الشعارات والطباعة إلى تصاميم العبوات الجريئة والحضور في نقاط البيع — كل تفصيلة مقصودة.",
        "link_label": "اطّلع على أعمال الهوية",
        "cards": [
          {"title": "هوية جريئة تتحدث قبل الكلمات.", "subtitle": "هوية العلامة التجارية", "image_url": "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/burgito/burgitowebsite-13.webp", "slug": "burgito"},
          {"title": "تغليف يستحق مكانه على الرف.", "subtitle": "التغليف والطباعة", "image_url": "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/mazaq/mazaqwebsite-02.webp", "slug": "mazaq"}
        ]
      }
    }'::jsonb
  ),
  (
    'services_section'::text, 3,
    '{
      "section_id": "content",
      "eyebrow": "We Create",
      "title": "Content & Campaigns",
      "body": "We tell brand stories across every channel — social media strategy, campaign direction, and content that connects emotionally and drives real results. Visual, verbal, and always on-brand.",
      "link_label": "View Campaign Work",
      "cards": [
        {"title": "A campaign rooted in culture and craving.", "subtitle": "Campaign Direction", "image_url": "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/wahed-makhlout/TEAwebsite-01.webp", "slug": "wahed-makhlout"},
        {"title": "Content that feels personal, not promotional.", "subtitle": "Social Content", "image_url": "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/come-true/cometruewebsite-07.webp", "slug": "come-true"}
      ]
    }'::jsonb,
    '{
      "ar": {
        "eyebrow": "نصنع",
        "title": "المحتوى والحملات",
        "body": "نحكي قصص العلامات التجارية عبر كل قناة — استراتيجية وسائل التواصل الاجتماعي وإدارة الحملات ومحتوى يتواصل عاطفياً ويحقق نتائج حقيقية.",
        "link_label": "اطّلع على أعمال الحملات",
        "cards": [
          {"title": "حملة متجذّرة في الثقافة والشوق.", "subtitle": "إدارة الحملة", "image_url": "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/wahed-makhlout/TEAwebsite-01.webp", "slug": "wahed-makhlout"},
          {"title": "محتوى يبدو شخصياً لا ترويجياً.", "subtitle": "محتوى التواصل الاجتماعي", "image_url": "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/come-true/cometruewebsite-07.webp", "slug": "come-true"}
        ]
      }
    }'::jsonb
  ),
  (
    'services_section'::text, 4,
    '{
      "section_id": "digital",
      "eyebrow": "We Design",
      "title": "Digital & Strategy",
      "body": "We help brands define who they are online — from brand strategy and positioning to websites and digital experiences that elevate presence, communicate clearly, and perform.",
      "link_label": "View Digital Work",
      "cards": [
        {"title": "A digital system built around appetite.", "subtitle": "Brand Strategy", "image_url": "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/qpasta/Qwebsite-01.webp", "slug": "qpasta"},
        {"title": "Retail branding that commands attention in-store.", "subtitle": "Digital Presence", "image_url": "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/neamah/Nwebsite-01.webp", "slug": "neamah"}
      ]
    }'::jsonb,
    '{
      "ar": {
        "eyebrow": "نصمم",
        "title": "الرقمي والاستراتيجية",
        "body": "نساعد العلامات التجارية على تحديد هويتها الرقمية — من الاستراتيجية والتموضع إلى المواقع والتجارب الرقمية التي ترفع الحضور وتتواصل بوضوح.",
        "link_label": "اطّلع على الأعمال الرقمية",
        "cards": [
          {"title": "نظام رقمي مبني حول الشهية.", "subtitle": "استراتيجية العلامة", "image_url": "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/qpasta/Qwebsite-01.webp", "slug": "qpasta"},
          {"title": "علامة تجارية للتجزئة تستأثر بالانتباه.", "subtitle": "الحضور الرقمي", "image_url": "https://thyqvwshctiufabfqbwa.supabase.co/storage/v1/object/public/media/projects/neamah/Nwebsite-01.webp", "slug": "neamah"}
        ]
      }
    }'::jsonb
  ),
  (
    'services_credentials'::text, 5,
    '{
      "eyebrow": "Our Track Record",
      "title": "Built to Perform",
      "body": "Every project we take on is an opportunity to raise the bar. Here are some of the numbers behind the work.",
      "stats": [
        {"label": "Happy Clients",       "value": "120+"},
        {"label": "Projects Delivered",  "value": "200+"},
        {"label": "Years of Experience", "value": "8+"},
        {"label": "Industries Served",   "value": "25+"}
      ]
    }'::jsonb,
    '{
      "ar": {
        "eyebrow": "سجلنا",
        "title": "مبني للأداء",
        "body": "كل مشروع نتولاه هو فرصة لرفع المستوى. إليك بعض الأرقام خلف الأعمال.",
        "stats": [
          {"label": "عميل سعيد",   "value": "120+"},
          {"label": "مشروع منجز",  "value": "200+"},
          {"label": "سنة خبرة",    "value": "8+"},
          {"label": "قطاع خدمناه", "value": "25+"}
        ]
      }
    }'::jsonb
  )
) AS v(type, sort_order, content, translations)
WHERE p.slug = 'services';
