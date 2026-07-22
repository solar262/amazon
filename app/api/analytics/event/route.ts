import { NextResponse } from "next/server";
import { saveEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  const body = await request.json();
  const type = body.type === "impression" || body.type === "article_view" ? body.type : "outbound_click";
  const event = await saveEvent({
    type,
    slug: body.slug ? String(body.slug) : undefined,
    path: body.path ? String(body.path) : undefined,
    destination: body.destination ? String(body.destination) : undefined
  });
  return NextResponse.json(event);
}
