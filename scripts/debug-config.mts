import configPromise from './payload.seed-config.mts';

async function debug() {
  try {
    console.log("Loading config...");
    const config = await configPromise;
    console.log("Config build successful");
    
    console.log("\n--- Checking Globals ---");
    config.globals?.forEach(g => {
      console.log(`Global: ${g.slug}`);
      if (!g.fields) {
        console.error(`  ERROR: ${g.slug} has no fields array`);
      } else {
        console.log(`  Fields count: ${g.fields.length}`);
      }
    });

    console.log("\n--- Checking Collections ---");
    config.collections?.forEach(c => {
      console.log(`Collection: ${c.slug}`);
      if (!c.fields) {
        console.error(`  ERROR: ${c.slug} has no fields array`);
      } else {
        console.log(`  Fields count: ${c.fields.length}`);
      }
    });
    
  } catch (err) {
    console.error("Failed to load/build config:", err);
  }
}

debug();
