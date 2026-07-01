import { NextResponse } from "next/server";
import { getArticles, saveArticle } from "@/lib/store";

export async function GET() {
  return NextResponse.json(await getArticles());
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json(await saveArticle(body));
}
