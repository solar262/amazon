import { adminAllowed } from "@/lib/admin";
import { fail, getRequestId, logEvent, ok } from "@/lib/api";
import { runAutomationPipeline } from "@/lib/automation";
import { getAutomationRuns } from "@/lib/store";
import { ensureTenantId } from "@/lib/tenant";
import { validateAutomationRunInput } from "@/lib/validation";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const tenant = ensureTenantId(request, requestId);
  if ("error" in tenant) return tenant.error;
  if (!adminAllowed(request)) {
    return fail(requestId, { code: "unauthorized", message: "Unauthorized request." }, 401);
  }
  try {
    const runs = await getAutomationRuns(tenant.tenantId);
    return ok(requestId, runs);
  } catch {
    return fail(requestId, { code: "server_error", message: "Failed to load automation runs." }, 500);
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const tenant = ensureTenantId(request, requestId);
  if ("error" in tenant) return tenant.error;
  if (!adminAllowed(request)) {
    logEvent("warn", "automation.run.unauthorized", requestId, { tenantId: tenant.tenantId });
    return fail(requestId, { code: "unauthorized", message: "Unauthorized request." }, 401);
  }
  try {
    const body = await request.json();
    const parsed = validateAutomationRunInput(body);
    if (parsed.errors.length > 0) {
      return fail(requestId, { code: "validation_error", message: "Invalid automation payload.", details: parsed.errors }, 400);
    }
    const idempotencyKey = request.headers.get("idempotency-key") || undefined;
    const run = await runAutomationPipeline({
      tenantId: tenant.tenantId,
      leadId: parsed.value?.leadId || "",
      source: parsed.value?.source,
      value: parsed.value?.value,
      idempotencyKey
    });
    logEvent("info", "automation.run.success", requestId, { tenantId: tenant.tenantId, runId: run.id, status: run.status });
    return ok(requestId, run, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Automation run failed.";
    logEvent("error", "automation.run.failed", requestId, { tenantId: tenant.tenantId, message: message.slice(0, 300) });
    return fail(requestId, { code: "server_error", message }, 500);
  }
}
