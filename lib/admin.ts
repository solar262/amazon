export function adminAllowed(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return true;
  return request.headers.get("x-admin-password") === expected;
}
