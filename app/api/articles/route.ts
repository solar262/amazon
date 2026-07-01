import { NextResponse } from "next/server";
import { getArticles } from "@/lib/store";

export async function GET() {
  return NextResponse.json(await getArticles());
}
