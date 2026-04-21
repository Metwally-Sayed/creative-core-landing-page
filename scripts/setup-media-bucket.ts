import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET ?? "media";

  const { error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 200 * 1024 * 1024,
    allowedMimeTypes: [
      "image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif",
      "video/mp4", "video/webm", "video/quicktime",
      "application/pdf",
    ],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    console.error("Failed to create bucket:", error.message);
    process.exit(1);
  }

  console.log(`✓ Bucket "${bucketName}" ready`);
}

main().catch((e) => { console.error(e); process.exit(1); });
