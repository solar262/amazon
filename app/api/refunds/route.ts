import { adminAllowed } from "@/lib/admin";
import { recommendRefundDecision } from "@/lib/automation";
import { fail, getRequestId, logEvent, ok } from "@/lib/api";
import { getRefundRequests, getTenants, saveRefundRequest } from "@/lib/store";
import { ensureTenantId } from "@/lib/tenant";
import { validateRefundInput } from "@/lib/validation";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const tenant = ensureTenantId(request, requestId);
  if ("error" in tenant) return tenant.error;
  if (!adminAllowed(request)) {
    return fail(requestId, { code: "unauthorized", message: "Unauthorized request." }, 401);
  }
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") as "pending_authorization" | "authorized" | "denied" | null;
    const refunds = await getRefundRequests(tenant.tenantId, { status: status || undefined });
    return ok(requestId, refunds);
  } catch {
    return fail(requestId, { code: "server_error", message: "Failed to load refunds." }, 500);
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const tenant = ensureTenantId(request, requestId);
  if ("error" in tenant) return tenant.error;
  if (!adminAllowed(request)) {
    logEvent("warn", "refunds.create.unauthorized", requestId, { tenantId: tenant.tenantId });
    return fail(requestId, { code: "unauthorized", message: "Unauthorized request." }, 401);
  }
  try {
    const body = await request.json();
    const parsed = validateRefundInput(body);
    if (parsed.errors.length > 0) {
      return fail(requestId, { code: "validation_error", message: "Invalid refund payload.", details: parsed.errors }, 400);
    }
    const tenants = await getTenants();
    const tenantConfig = tenants.find((item) => item.id === tenant.tenantId);
    const recommendation = recommendRefundDecision({
      amount: parsed.value?.amount || 0,
      reason: parsed.value?.reason || "",
      rules: tenantConfig?.automationRules
    });
    const refund = await saveRefundRequest({
      tenantId: tenant.tenantId,
      orderId: parsed.value?.orderId || "",
      customerEmail: parsed.value?.customerEmail || "",
      amount: parsed.value?.amount || 0,
      reason: parsed.value?.reason || "",
      aiRecommendation: recommendation
    });
    logEvent("info", "refunds.create.success", requestId, { tenantId: tenant.tenantId, refundId: refund.id, recommendation });
    return ok(requestId, refund, 201);
  } catch {
    return fail(requestId, { code: "server_error", message: "Failed to create refund request." }, 500);
  }
}
