import { NextResponse } from "next/server";
import type { ApiError } from "./types";

export function getRequestId(request: Request) {
  return request.headers.get("x-request-id") || crypto.randomUUID();
}

export function ok(requestId: string, data: unknown, status = 200) {
  return NextResponse.json({ ok: true, requestId, data }, { status });
}

export function fail(requestId: string, error: ApiError, status = 400) {
  return NextResponse.json({ ok: false, requestId, error }, { status });
}

export function logEvent(
  level: "info" | "warn" | "error",
  event: string,
  requestId: string,
  metadata?: Record<string, unknown>
) {
  const line = JSON.stringify({
    level,
    event,
    requestId,
    timestamp: new Date().toISOString(),
    ...metadata
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}
