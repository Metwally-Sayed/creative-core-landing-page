import PayloadDatabaseUnavailable from "@/components/payload/PayloadDatabaseUnavailable";
import {
  getPayloadDatabaseURL,
  isPayloadDatabaseReachable,
} from "@/lib/payload-db-health";
import config from "@payload-config";
import "@payloadcms/next/css";
import { RootLayout, handleServerFunctions, metadata } from "@payloadcms/next/layouts";
import { importMap } from "./admin/importMap";

export { metadata };

const serverFunction = async (...args: Parameters<typeof handleServerFunctions>) => {
  "use server";

  const [incomingArgs] = args;

  return handleServerFunctions({
    ...incomingArgs,
    config,
    importMap,
  });
};

export default async function PayloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const databaseReachable = await isPayloadDatabaseReachable();

  if (!databaseReachable) {
    return (
      <PayloadDatabaseUnavailable databaseURL={getPayloadDatabaseURL()} />
    );
  }

  return (
    <RootLayout
      config={config}
      htmlProps={{
        lang: "en",
      }}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  );
}
