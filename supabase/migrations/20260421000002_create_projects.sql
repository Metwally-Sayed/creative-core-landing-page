-- CMS Sub-project #4: Projects (Rich Collection)
-- Includes translations jsonb for EN/AR bilingual support

create table if not exists projects (
  id                 uuid        primary key default gen_random_uuid(),
  slug               text        not null unique,
  title              text        not null,
  tags               text[]      not null default '{}',
  aspect_ratio       text        not null default 'landscape',
  cover_image_url    text        not null default '',
  published          bool        not null default false,
  sort_order         int4        not null default 0,
  hero_label         text        not null default '',
  hero_title         text        not null default '',
  hero_subtitle      text        not null default '',
  hero_summary       text        not null default '',
  hero_image_url     text        not null default '',
  client             text        not null default '',
  project_type       text        not null default '',
  deliverables       text        not null default '',
  launch_label       text        not null default '',
  launch_url         text        not null default '',
  intro              text[]      not null default '{}',
  showcase_image_url text        not null default '',
  showcase_alt       text        not null default '',
  showcase_label     text        not null default '',
  feature_eyebrow    text        not null default '',
  feature_title      text        not null default '',
  feature_body       text        not null default '',
  translations       jsonb       not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists project_sections (
  id           uuid        primary key default gen_random_uuid(),
  project_id   uuid        not null references projects(id) on delete cascade,
  eyebrow      text        not null default '',
  title        text        not null default '',
  body         text[]      not null default '{}',
  image_url    text        not null default '',
  image_alt    text        not null default '',
  image_layout text        not null default 'right',
  tone         text        not null default 'light',
  sort_order   int4        not null default 0,
  translations jsonb       not null default '{}'
);

create table if not exists project_gallery (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  image_url   text not null default '',
  image_alt   text not null default '',
  image_label text not null default '',
  sort_order  int4 not null default 0
);

create table if not exists project_metrics (
  id           uuid  primary key default gen_random_uuid(),
  project_id   uuid  not null references projects(id) on delete cascade,
  label        text  not null default '',
  value        text  not null default '',
  sort_order   int4  not null default 0,
  translations jsonb not null default '{}'
);

create table if not exists project_credits (
  id           uuid  primary key default gen_random_uuid(),
  project_id   uuid  not null references projects(id) on delete cascade,
  label        text  not null default '',
  value        text  not null default '',
  sort_order   int4  not null default 0,
  translations jsonb not null default '{}'
);

create table if not exists project_overview (
  id           uuid  primary key default gen_random_uuid(),
  project_id   uuid  not null references projects(id) on delete cascade,
  label        text  not null default '',
  value        text  not null default '',
  sort_order   int4  not null default 0,
  translations jsonb not null default '{}'
);

create table if not exists project_related (
  project_id         uuid not null references projects(id) on delete cascade,
  related_project_id uuid not null references projects(id) on delete cascade,
  sort_order         int4 not null default 0,
  primary key (project_id, related_project_id)
);

-- RLS: deny all for anon and authenticated; service-role bypasses
alter table projects         enable row level security;
alter table project_sections enable row level security;
alter table project_gallery  enable row level security;
alter table project_metrics  enable row level security;
alter table project_credits  enable row level security;
alter table project_overview enable row level security;
alter table project_related  enable row level security;

create policy "deny anon projects"          on projects         for all to anon         using (false);
create policy "deny auth projects"          on projects         for all to authenticated using (false);
create policy "deny anon project_sections"  on project_sections for all to anon         using (false);
create policy "deny auth project_sections"  on project_sections for all to authenticated using (false);
create policy "deny anon project_gallery"   on project_gallery  for all to anon         using (false);
create policy "deny auth project_gallery"   on project_gallery  for all to authenticated using (false);
create policy "deny anon project_metrics"   on project_metrics  for all to anon         using (false);
create policy "deny auth project_metrics"   on project_metrics  for all to authenticated using (false);
create policy "deny anon project_credits"   on project_credits  for all to anon         using (false);
create policy "deny auth project_credits"   on project_credits  for all to authenticated using (false);
create policy "deny anon project_overview"  on project_overview for all to anon         using (false);
create policy "deny auth project_overview"  on project_overview for all to authenticated using (false);
create policy "deny anon project_related"   on project_related  for all to anon         using (false);
create policy "deny auth project_related"   on project_related  for all to authenticated using (false);
