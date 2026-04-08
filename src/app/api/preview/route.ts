import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") || "/";

  const previewSecret = process.env.PREVIEW_SECRET || "hello-monday-payload-dev-secret";
 
   if (secret !== previewSecret) {
     return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
   }

  const draft = await draftMode();
  draft.enable();

  return NextResponse.redirect(new URL(slug, request.url));
}