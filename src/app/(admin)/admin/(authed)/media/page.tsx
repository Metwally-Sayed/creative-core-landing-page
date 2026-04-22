import { listMediaAssets, countMediaAssets } from "./actions";
import { MEDIA_PAGE_SIZE } from "@/lib/media-types";
import MediaLibrary from "./MediaLibrary";

export default async function AdminMediaPage() {
  const [assets, total] = await Promise.all([
    listMediaAssets({ page: 1 }),
    countMediaAssets(),
  ]);

  return (
    <MediaLibrary
      initialAssets={assets}
      initialTotal={total}
      pageSize={MEDIA_PAGE_SIZE}
    />
  );
}
