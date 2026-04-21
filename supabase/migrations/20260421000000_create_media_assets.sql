-- media_assets: stores metadata for every file uploaded to Supabase Storage
CREATE TABLE IF NOT EXISTS media_assets (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path   text        NOT NULL,
  public_url     text        NOT NULL,
  file_type      text        NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  mime_type      text        NOT NULL,
  size_bytes     int8        NOT NULL,
  title          text        NOT NULL,
  alt_text       text,
  tags           text[]      NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically; deny all direct client access
CREATE POLICY "deny_anon"          ON media_assets FOR ALL TO anon          USING (false);
CREATE POLICY "deny_authenticated" ON media_assets FOR ALL TO authenticated USING (false);
