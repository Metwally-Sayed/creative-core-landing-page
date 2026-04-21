import { listLocations } from "./actions";
import LocationsList from "./LocationsList";

export default async function AdminLocationsPage() {
  const locations = await listLocations();
  return <LocationsList initialLocations={locations} />;
}
