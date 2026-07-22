export function requirePersistentStore() {
  if (process.env.REQUIRE_PERSISTENT_STORE === "true") return true;
  const inProduction = process.env.NODE_ENV === "production";
  const inBuildStep = process.env.NEXT_PHASE === "phase-production-build";
  return inProduction && !inBuildStep;
}

export function appEnv() {
  return process.env.NODE_ENV || "development";
}
