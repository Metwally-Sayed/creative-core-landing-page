import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data } = await sb
    .from('page_sections')
    .select('content, translations')
    .eq('id', '192b47dd-c9ce-41dd-b479-962ebaae72f9')
    .single();

  console.log('EN cards:');
  (data?.content?.cards ?? []).forEach((c: Record<string,string>, i: number) =>
    console.log(i, c.image_url?.split('/').slice(-2).join('/'))
  );

  console.log('\nAR cards:');
  const ar = data?.translations?.ar as Record<string,unknown>;
  (ar?.cards as Record<string,string>[] ?? []).forEach((c, i) =>
    console.log(i, c.image_url?.split('/').slice(-2).join('/'))
  );

  // Check which lima files actually exist
  console.log('\nlima storage files:');
  const { data: files } = await sb.storage.from('media').list('projects/lima', { sortBy: { column: 'name', order: 'asc' } });
  console.log(files?.filter(f => f.name.match(/\.(webp|jpg|png)/i)).map(f => f.name).join(', '));
}
main();
