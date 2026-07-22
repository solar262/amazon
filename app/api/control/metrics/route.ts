import { NextResponse } from "next/server";
import { adminError } from "@/lib/admin";
import { metricsSummary } from "@/lib/analytics";

export async function GET(request: Request) {
  const error = adminError(request);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const summary = await metricsSummary();
  return NextResponse.json(summary);
}
