import { getSettingsAdmin } from "./actions";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSettingsAdmin();

  return (
    <>
      <h1 className="mb-8 text-2xl font-semibold">Settings</h1>
      <SettingsForm initialSettings={settings} />
    </>
  );
}
