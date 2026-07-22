import { NextResponse } from "next/server";
import { getArticles, saveArticle } from "@/lib/store";
import { adminError } from "@/lib/admin";

export async function GET() {
  return NextResponse.json(await getArticles());
}

export async function POST(request: Request) {
  const error = adminError(request);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const body = await request.json();
  return NextResponse.json(await saveArticle(body));
}
