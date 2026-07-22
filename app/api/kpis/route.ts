import { adminAllowed } from "@/lib/admin";
import { fail, getRequestId, ok } from "@/lib/api";
import { getTenantKpiSnapshot } from "@/lib/store";
import { ensureTenantId } from "@/lib/tenant";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const tenant = ensureTenantId(request, requestId);
  if ("error" in tenant) return tenant.error;
  if (!adminAllowed(request)) {
    return fail(requestId, { code: "unauthorized", message: "Unauthorized request." }, 401);
  }
  try {
    const snapshot = await getTenantKpiSnapshot(tenant.tenantId);
    return ok(requestId, snapshot);
  } catch {
    return fail(requestId, { code: "server_error", message: "Failed to generate KPI snapshot." }, 500);
  }
}
