export function adminAllowed(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-admin-password") === expected;
}

export function adminError(request: Request) {
  if (adminAllowed(request)) return null;
  if (!process.env.ADMIN_PASSWORD) return "ADMIN_PASSWORD is required in production.";
  return "Unauthorized.";
}

export function automationAllowed(request: Request) {
  const secret = process.env.AUTOMATION_SECRET;
  if (!secret) return false;
  const provided = request.headers.get("x-automation-secret");
  return provided === secret;
}

export function automationOrAdminAllowed(request: Request) {
  return adminAllowed(request) || automationAllowed(request);
}

export function automationOrAdminError(request: Request) {
  if (automationOrAdminAllowed(request)) return null;
  if (!process.env.ADMIN_PASSWORD && !process.env.AUTOMATION_SECRET) {
    return "ADMIN_PASSWORD or AUTOMATION_SECRET is required in production.";
  }
  return "Unauthorized.";
}

export function refundAuthorizationAllowed(request: Request) {
  const expected = process.env.REFUND_AUTHORIZATION_SECRET;
  if (!expected) return false;
  return request.headers.get("x-refund-authorization") === expected;
}

export function refundAuthorizationError(request: Request) {
  if (refundAuthorizationAllowed(request)) return null;
  if (!process.env.REFUND_AUTHORIZATION_SECRET) return "REFUND_AUTHORIZATION_SECRET is required.";
  return "Refund authorization required.";
}
