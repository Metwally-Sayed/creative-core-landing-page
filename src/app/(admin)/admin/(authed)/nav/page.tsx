import { listNavLinks } from "./actions";
import NavList from "./NavList";
import ClientOnly from "@/components/admin/ClientOnly";

export default async function AdminNavPage() {
  const navLinks = await listNavLinks();
  return (
    <ClientOnly>
      <NavList initialItems={navLinks} />
    </ClientOnly>
  );
}
