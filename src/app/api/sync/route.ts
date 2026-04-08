import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET() {
  try {
    console.log("Initializing payload from Next.js server context...");
    const payload = await getPayload({ config });

    console.log("Pushing database schema...", payload.db.name);
    
    // Most adapters (like postgres) implement pushSchema or push
    if (typeof payload.db.pushSchema === 'function') {
      await payload.db.pushSchema();
      console.log("Schema pushed using pushSchema!");
      return NextResponse.json({ success: true, message: "Schema pushed using pushSchema" });
    } else if (typeof payload.db.push === 'function') {
      await payload.db.push();
      console.log("Schema pushed using push!");
      return NextResponse.json({ success: true, message: "Schema pushed using push" });
    } else {
      console.log("Database adapter does not support pushing schema programmatically.");
      return NextResponse.json({ success: false, message: "No push method found on db adapter" });
    }
  } catch (error) {
    console.error("Error during Next.js DB push route:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
