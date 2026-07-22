import { fail } from "./api";
import type { Tenant } from "./types";

const defaultTenant: Tenant = {
  id: "tenant-main",
  name: "Main Business",
  brand: {},
  connectors: {
    emailProvider: "none",
    crmProvider: "none",
    adsProvider: "none"
  },
  automationRules: {
    refundPolicyLimit: 200,
    escalationThreshold: 70
  },
  active: true,
  createdAt: new Date().toISOString()
};

export const DEFAULT_TENANT_ID = defaultTenant.id;

export function getTenantIdFromRequest(request: Request) {
  const url = new URL(request.url);
  const queryTenant = url.searchParams.get("tenantId");
  const headerTenant = request.headers.get("x-tenant-id");
  const tenantId = (queryTenant || headerTenant || process.env.DEFAULT_TENANT_ID || DEFAULT_TENANT_ID).trim();
  return tenantId || DEFAULT_TENANT_ID;
}

export function ensureTenantId(request: Request, requestId: string) {
  const tenantId = getTenantIdFromRequest(request);
  if (!tenantId) {
    return { error: fail(requestId, { code: "validation_error", message: "tenantId is required." }, 400) };
  }
  return { tenantId };
}

export function seedTenants(): Tenant[] {
  return [defaultTenant];
}
