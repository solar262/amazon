import { adminAllowed } from "@/lib/admin";
import { fail, getRequestId, logEvent, ok } from "@/lib/api";
import { getTenants, saveTenant } from "@/lib/store";
import { validateTenantInput } from "@/lib/validation";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  if (!adminAllowed(request)) {
    return fail(requestId, { code: "unauthorized", message: "Unauthorized request." }, 401);
  }
  try {
    return ok(requestId, await getTenants());
  } catch {
    return fail(requestId, { code: "server_error", message: "Failed to load tenants." }, 500);
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  if (!adminAllowed(request)) {
    logEvent("warn", "tenants.create.unauthorized", requestId);
    return fail(requestId, { code: "unauthorized", message: "Unauthorized request." }, 401);
  }
  try {
    const body = await request.json();
    const parsed = validateTenantInput(body);
    if (parsed.errors.length > 0) {
      return fail(requestId, { code: "validation_error", message: "Invalid tenant payload.", details: parsed.errors }, 400);
    }
    const tenant = await saveTenant(parsed.value || {});
    logEvent("info", "tenants.create.success", requestId, { tenantId: tenant.id });
    return ok(requestId, tenant, 201);
  } catch {
    return fail(requestId, { code: "server_error", message: "Failed to save tenant." }, 500);
  }
}
