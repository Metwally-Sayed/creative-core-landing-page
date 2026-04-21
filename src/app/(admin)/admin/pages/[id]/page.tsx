import { notFound } from "next/navigation";
import { getPageAdmin } from "../actions";
import PageEditor from "./PageEditor";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let page;
  try {
    page = await getPageAdmin(id);
  } catch {
    notFound();
  }

  return <PageEditor page={page} />;
}
