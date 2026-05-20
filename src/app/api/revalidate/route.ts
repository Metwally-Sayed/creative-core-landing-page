import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  revalidateTag("pages", "max");
  return NextResponse.json({ revalidated: true });
}
