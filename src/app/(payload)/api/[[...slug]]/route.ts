import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";
import config from "@payload-config";
import { isPayloadDatabaseReachable } from "@/lib/payload-db-health";

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

const payloadGet = REST_GET(config);
const payloadPost = REST_POST(config);
const payloadDelete = REST_DELETE(config);
const payloadPatch = REST_PATCH(config);
const payloadPut = REST_PUT(config);
const payloadOptions = REST_OPTIONS(config);

export async function GET(request: Request, args: Parameters<typeof payloadGet>[1]) {
  return (await databaseUnavailableResponse()) ?? payloadGet(request, args);
}

export async function POST(request: Request, args: Parameters<typeof payloadPost>[1]) {
  return (await databaseUnavailableResponse()) ?? payloadPost(request, args);
}

export async function DELETE(request: Request, args: Parameters<typeof payloadDelete>[1]) {
  return (await databaseUnavailableResponse()) ?? payloadDelete(request, args);
}

export async function PATCH(request: Request, args: Parameters<typeof payloadPatch>[1]) {
  return (await databaseUnavailableResponse()) ?? payloadPatch(request, args);
}

export async function PUT(request: Request, args: Parameters<typeof payloadPut>[1]) {
  return (await databaseUnavailableResponse()) ?? payloadPut(request, args);
}

export async function OPTIONS(request: Request, args: Parameters<typeof payloadOptions>[1]) {
  return (await databaseUnavailableResponse()) ?? payloadOptions(request, args);
}
