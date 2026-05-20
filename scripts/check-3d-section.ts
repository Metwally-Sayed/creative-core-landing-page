import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await sb
    .from('page_sections')
    .select('id, content, translations')
    .eq('id', 'bfd8cc2e-fe08-4875-b8a0-21345e10bc79')
    .single();

  console.log('EN showcase_images count:', data?.content?.showcase_images?.length);
  console.log('EN showcase_images[0]:', data?.content?.showcase_images?.[0]);
  const ar = data?.translations?.ar as Record<string,unknown> | undefined;
  console.log('AR showcase_images:', ar?.showcase_images ?? 'not set');
}
main();
