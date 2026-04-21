-- CMS Sub-project #4 extras: theme palette, service type, work filters, process phases

alter table projects
  add column if not exists service_type              text    not null default '',
  add column if not exists work_filters              text[]  not null default '{}',
  add column if not exists featured_aspect_ratio     text    not null default 'landscape',
  add column if not exists inherit_theme_from_palette bool   not null default false,
  add column if not exists theme_palette             jsonb   not null default '{}';

create table if not exists project_process (
  id           uuid        primary key default gen_random_uuid(),
  project_id   uuid        not null references projects(id) on delete cascade,
  phase        text        not null default '',
  label        text        not null default '',
  description  text        not null default '',
  sort_order   int4        not null default 0,
  translations jsonb       not null default '{}'
);

alter table project_process enable row level security;
create policy "deny anon project_process"  on project_process for all to anon         using (false);
create policy "deny auth project_process"  on project_process for all to authenticated using (false);
