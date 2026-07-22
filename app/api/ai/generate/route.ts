import { adminAllowed } from "@/lib/admin";
import { fail, getRequestId, logEvent, ok } from "@/lib/api";
import { generateDraft } from "@/lib/ai";
import { validateDraftInput } from "@/lib/validation";
import { ensureTenantId } from "@/lib/tenant";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const tenant = ensureTenantId(request, requestId);
  if ("error" in tenant) return tenant.error;
  if (!adminAllowed(request)) {
    logEvent("warn", "draft.generate.unauthorized", requestId);
    return fail(requestId, { code: "unauthorized", message: "Unauthorized request." }, 401);
  }
  try {
    const body = await request.json();
    const parsed = validateDraftInput(body);
    if (parsed.errors.length > 0) {
      return fail(requestId, { code: "validation_error", message: "Invalid draft payload.", details: parsed.errors }, 400);
    }
    const draft = await generateDraft(parsed.topic, parsed.products);
    logEvent("info", "draft.generate.success", requestId, { tenantId: tenant.tenantId, topic: parsed.topic, products: parsed.products.length });
    return ok(requestId, draft, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Draft generation failed.";
    if (message.startsWith("AI provider request failed")) {
      logEvent("error", "draft.generate.provider_error", requestId, { message: message.slice(0, 500) });
    }
    const status = message.includes("AI_API_KEY is required.") ? 503 : 500;
    const code = message.includes("AI_API_KEY is required.") ? "ai_not_configured" : "server_error";
    return fail(requestId, { code, message }, status);
  }
}
