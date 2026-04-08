import { getPayload } from "payload";
import config from "./payload.bundle.mjs";

async function run() {
  console.log("Loading db...");
  const payload = await getPayload({ config });
  console.log("Pushing schema...");
  if (payload.db.pushSchema) {
    await payload.db.pushSchema();
    console.log("Pushed via pushSchema");
  } else if (payload.db.push) {
    await payload.db.push();
    console.log("Pushed via push");
  } else {
    console.log("No push available");
  }
  process.exit(0);
}
run();
