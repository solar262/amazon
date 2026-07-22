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
