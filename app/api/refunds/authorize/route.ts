import { adminAllowed } from "@/lib/admin";
import { fail, getRequestId, logEvent, ok } from "@/lib/api";
import { authorizeRefund } from "@/lib/store";
import { ensureTenantId } from "@/lib/tenant";

type Body = {
  refundId?: string;
  decision?: "authorized" | "denied";
  actor?: string;
  note?: string;
};

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const tenant = ensureTenantId(request, requestId);
  if ("error" in tenant) return tenant.error;
  if (!adminAllowed(request)) {
    logEvent("warn", "refunds.authorize.unauthorized", requestId, { tenantId: tenant.tenantId });
    return fail(requestId, { code: "unauthorized", message: "Unauthorized request." }, 401);
  }
  try {
    const body = (await request.json()) as Body;
    if (!body.refundId || !body.decision || !body.actor) {
      return fail(requestId, { code: "validation_error", message: "refundId, decision and actor are required." }, 400);
    }
    const updated = await authorizeRefund(tenant.tenantId, body.refundId, body.decision, body.actor, body.note);
    if (!updated) {
      return fail(requestId, { code: "not_found", message: "Refund request not found." }, 404);
    }
    logEvent("info", "refunds.authorize.success", requestId, {
      tenantId: tenant.tenantId,
      refundId: updated.id,
      decision: updated.status,
      actor: body.actor
    });
    return ok(requestId, updated);
  } catch {
    return fail(requestId, { code: "server_error", message: "Failed to authorize refund." }, 500);
  }
}
