import { NextResponse } from "next/server";
import { automationOrAdminError } from "@/lib/admin";
import { metricsSummary } from "@/lib/analytics";

export async function GET(request: Request) {
  const error = automationOrAdminError(request);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const summary = await metricsSummary();
  return NextResponse.json(summary);
}
