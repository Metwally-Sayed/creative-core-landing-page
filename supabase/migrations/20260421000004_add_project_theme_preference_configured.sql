alter table projects
  add column if not exists theme_preference_configured bool not null default false;

update projects
set theme_preference_configured = true
where inherit_theme_from_palette = true;
