import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await client.connect();
  console.log("Connected to database.");

  await client.query(`
    create table if not exists tags (
      id         uuid        primary key default gen_random_uuid(),
      slug       text        not null unique,
      title_en   text        not null default '',
      title_ar   text        not null default '',
      sort_order int4        not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);
  console.log("Table created.");

  await client.query(`alter table tags enable row level security;`);

  await client.query(`
    do $$ begin
      if not exists (select 1 from pg_policies where tablename='tags' and policyname='deny anon tags') then
        create policy "deny anon tags" on tags for all to anon using (false);
      end if;
      if not exists (select 1 from pg_policies where tablename='tags' and policyname='deny auth tags') then
        create policy "deny auth tags" on tags for all to authenticated using (false);
      end if;
    end $$;
  `);
  console.log("RLS policies set.");

  await client.query(`
    insert into tags (slug, title_en, title_ar, sort_order) values
      ('branding',           'Branding',          'براندينج',                    0),
      ('3d-interior-design', '3D interior design', 'تصميم داخلي ثلاثي الأبعاد', 1),
      ('social-media',       'social media',       'سوشيال ميديا',              2),
      ('photography',        'photography',        'تصوير',                     3),
      ('marketing',          'Marketing',          'تسويق',                     4),
      ('content-creation',   'Content Creation',   'إنشاء المحتوى',             5)
    on conflict (slug) do nothing;
  `);
  console.log("Tags seeded.");

  await client.end();
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
