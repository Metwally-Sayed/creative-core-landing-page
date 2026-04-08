import { GRAPHQL_PLAYGROUND_GET, GRAPHQL_POST } from "@payloadcms/next/routes";
import config from "@payload-config";
import { isPayloadDatabaseReachable } from "@/lib/payload-db-health";

const payloadGraphqlGet = GRAPHQL_PLAYGROUND_GET(config);
const payloadGraphqlPost = GRAPHQL_POST(config);

async function databaseUnavailableResponse() {
  const reachable = await isPayloadDatabaseReachable();

  if (reachable) {
    return null;
  }

  return Response.json(
    {
      error: "Payload database is unavailable.",
    },
    { status: 503 },
  );
}

export async function GET(request: Request, args: Parameters<typeof payloadGraphqlGet>[1]) {
  return (await databaseUnavailableResponse()) ?? payloadGraphqlGet(request, args);
}

export async function POST(request: Request, args: Parameters<typeof payloadGraphqlPost>[1]) {
  return (await databaseUnavailableResponse()) ?? payloadGraphqlPost(request, args);
}
