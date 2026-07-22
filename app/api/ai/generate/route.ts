import { NextResponse } from "next/server";
import { adminError } from "@/lib/admin";
import { getProducts } from "@/lib/store";
import { generateDraft } from "@/lib/content";

export async function POST(request: Request) {
  const error = adminError(request);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const body = await request.json();
  const topic = String(body.topic || "");
  const products = body.products || (await getProducts());
  return NextResponse.json(generateDraft(topic, products));
}
