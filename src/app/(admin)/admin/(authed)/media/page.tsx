import { listMediaAssets } from "./actions";
import MediaLibrary from "./MediaLibrary";

export default async function AdminMediaPage() {
  const assets = await listMediaAssets();
  return <MediaLibrary initialAssets={assets} />;
}
