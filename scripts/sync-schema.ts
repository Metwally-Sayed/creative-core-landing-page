import { getPayload } from 'payload';
import config from '../src/payload.config.ts';

async function sync() {
  console.log("Initializing payload...");
  const payload = await getPayload({ config });
  
  console.log("Generating types...");
  await payload.types.generate();
  console.log("Types generated successfully!");
  process.exit(0);
}

sync().catch(err => {
  console.error("Error syncing schema:", err);
  process.exit(1);
});
