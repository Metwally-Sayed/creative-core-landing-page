-- ── pages ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text        NOT NULL UNIQUE,
  title            text        NOT NULL,
  meta_title       text        NOT NULL DEFAULT '',
  meta_description text        NOT NULL DEFAULT '',
  og_image_url     text        NOT NULL DEFAULT '',
  published        boolean     NOT NULL DEFAULT false,
  sort_order       int4        NOT NULL DEFAULT 0,
  translations     jsonb       NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny anon" ON pages FOR ALL TO anon USING (false);
CREATE POLICY "deny authenticated" ON pages FOR ALL TO authenticated USING (false);

-- ── page_sections ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_sections (
  id           uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id      uuid  NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type         text  NOT NULL,
  sort_order   int4  NOT NULL DEFAULT 0,
  content      jsonb NOT NULL DEFAULT '{}',
  translations jsonb NOT NULL DEFAULT '{}'
);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny anon" ON page_sections FOR ALL TO anon USING (false);
CREATE POLICY "deny authenticated" ON page_sections FOR ALL TO authenticated USING (false);

-- ── site_settings ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id               int4 PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name        text NOT NULL DEFAULT 'Hello Monday',
  tagline          text NOT NULL DEFAULT '',
  contact_email    text NOT NULL DEFAULT 'hello@hellomonday.com',
  business_email   text NOT NULL DEFAULT 'newbusiness@hellomonday.com',
  social_twitter   text NOT NULL DEFAULT '',
  social_instagram text NOT NULL DEFAULT '',
  social_linkedin  text NOT NULL DEFAULT '',
  social_vimeo     text NOT NULL DEFAULT '',
  seo_title        text NOT NULL DEFAULT '',
  seo_description  text NOT NULL DEFAULT '',
  seo_og_image_url text NOT NULL DEFAULT ''
);

-- Seed the single row
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny anon" ON site_settings FOR ALL TO anon USING (false);
CREATE POLICY "deny authenticated" ON site_settings FOR ALL TO authenticated USING (false);
