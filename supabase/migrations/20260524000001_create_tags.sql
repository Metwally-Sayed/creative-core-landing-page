-- Tags table: manages filterable project categories
-- Tags are stored as slugs in projects.tags text[] for filtering

create table if not exists tags (
  id         uuid        primary key default gen_random_uuid(),
  slug       text        not null unique,
  title_en   text        not null default '',
  title_ar   text        not null default '',
  sort_order int4        not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: deny all for anon and authenticated; service-role bypasses
alter table tags enable row level security;

create policy "deny anon tags"  on tags for all to anon         using (false);
create policy "deny auth tags"  on tags for all to authenticated using (false);

-- Seed the 6 default tags matching existing filter categories
insert into tags (slug, title_en, title_ar, sort_order) values
  ('branding',            'Branding',           'براندينج',                    0),
  ('3d-interior-design',  '3D interior design',  'تصميم داخلي ثلاثي الأبعاد', 1),
  ('social-media',        'social media',        'سوشيال ميديا',              2),
  ('photography',         'photography',         'تصوير',                     3),
  ('marketing',           'Marketing',           'تسويق',                     4),
  ('content-creation',    'Content Creation',    'إنشاء المحتوى',             5)
on conflict (slug) do nothing;
