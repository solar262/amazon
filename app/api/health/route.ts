import { ok } from "@/lib/api";
import { getDb } from "@/lib/db";
import { appEnv, requirePersistentStore } from "@/lib/runtime";

export async function GET(request: Request) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  let dbStatus: "ready" | "degraded" | "down" = "ready";
  try {
    const db = await getDb();
    if (!db) dbStatus = requirePersistentStore() ? "down" : "degraded";
  } catch {
    dbStatus = "down";
  }
  const healthy = dbStatus !== "down";
  return ok(
    requestId,
    {
      status: healthy ? "ok" : "error",
      environment: appEnv(),
      datastore: dbStatus,
      checks: {
        mongodb: dbStatus
      }
    },
    healthy ? 200 : 503
  );
}
