import { listFaqItems } from "./actions";
import FaqList from "./FaqList";
import ClientOnly from "@/components/admin/ClientOnly";

export default async function AdminFaqPage() {
  const faqItems = await listFaqItems();
  return (
    <ClientOnly>
      <FaqList initialItems={faqItems} />
    </ClientOnly>
  );
}
