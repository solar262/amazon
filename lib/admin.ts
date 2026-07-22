export function adminAllowed(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return process.env.NODE_ENV !== "production";
  const password = request.headers.get("x-admin-password");
  const controlToken = request.headers.get("x-control-token");
  const bearer = request.headers.get("authorization");
  const bearerToken = bearer?.startsWith("Bearer ") ? bearer.slice(7) : null;
  return password === expected || controlToken === expected || bearerToken === expected;
}
