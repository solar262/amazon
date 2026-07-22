export function requirePersistentStore() {
  return process.env.NODE_ENV === "production" || process.env.REQUIRE_PERSISTENT_STORE === "true";
}

export function appEnv() {
  return process.env.NODE_ENV || "development";
}
