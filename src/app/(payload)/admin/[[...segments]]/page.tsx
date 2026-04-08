import type { Metadata } from "next";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import PayloadDatabaseUnavailable from "@/components/payload/PayloadDatabaseUnavailable";
import config from "@payload-config";
import {
  getPayloadDatabaseURL,
  isPayloadDatabaseReachable,
} from "@/lib/payload-db-health";
import { importMap } from "../importMap";

type PageArgs = {
  params: Promise<{
    segments?: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageArgs): Promise<Metadata> {
  const databaseReachable = await isPayloadDatabaseReachable();

  if (!databaseReachable) {
    return {
      title: "Payload Setup Required",
      description: "PostgreSQL must be running before the Payload admin can load.",
    };
  }

  return generatePageMetadata({
    config,
    params,
    searchParams,
  });
}

export default async function Page({ params, searchParams }: PageArgs) {
  const databaseReachable = await isPayloadDatabaseReachable();

  if (!databaseReachable) {
    return (
      <PayloadDatabaseUnavailable databaseURL={getPayloadDatabaseURL()} />
    );
  }

  return RootPage({
    config,
    importMap,
    params,
    searchParams,
  });
}
