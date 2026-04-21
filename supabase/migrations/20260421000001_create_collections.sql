-- locations table
CREATE TABLE IF NOT EXISTS locations (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  country     text        NOT NULL,
  address_lines text[]    NOT NULL DEFAULT '{}',
  email       text        NOT NULL DEFAULT '',
  map_url     text        NOT NULL DEFAULT '',
  sort_order  int4        NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny anon locations"          ON locations FOR ALL TO anon          USING (false);
CREATE POLICY "deny authenticated locations" ON locations FOR ALL TO authenticated USING (false);

-- faq_items table
CREATE TABLE IF NOT EXISTS faq_items (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  question     text        NOT NULL,
  answer       text        NOT NULL,
  preview      text        NOT NULL DEFAULT '',
  deliverables text[]      NOT NULL DEFAULT '{}',
  sort_order   int4        NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny anon faq"          ON faq_items FOR ALL TO anon          USING (false);
CREATE POLICY "deny authenticated faq" ON faq_items FOR ALL TO authenticated USING (false);
