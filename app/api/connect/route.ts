import { ok } from "@/lib/api";
import { getDb } from "@/lib/db";
import { requirePersistentStore } from "@/lib/runtime";

export async function GET(request: Request) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  let status: "connected" | "degraded" | "down" = "connected";

  try {
    const db = await getDb();
    if (!db) status = requirePersistentStore() ? "down" : "degraded";
  } catch {
    status = "down";
  }

  return ok(requestId, { status }, status === "down" ? 503 : 200);
}
