import { listTags } from "./actions";
import TagsList from "./TagsList";

export default async function TagsPage() {
  const tags = await listTags();
  return <TagsList initialTags={tags} />;
}
