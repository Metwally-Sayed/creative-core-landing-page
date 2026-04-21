import { listFaqItems } from "./actions";
import FaqList from "./FaqList";

export default async function AdminFaqPage() {
  const faqItems = await listFaqItems();
  return <FaqList initialItems={faqItems} />;
}
