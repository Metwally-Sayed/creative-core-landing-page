import { listLocations } from "./actions";
import LocationsList from "./LocationsList";
import ClientOnly from "@/components/admin/ClientOnly";

export default async function AdminLocationsPage() {
  const locations = await listLocations();
  return (
    <ClientOnly>
      <LocationsList initialLocations={locations} />
    </ClientOnly>
  );
}
