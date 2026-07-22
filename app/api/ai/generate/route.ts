import { adminAllowed } from "@/lib/admin";
import { fail, getRequestId, logEvent, ok } from "@/lib/api";
import { validateDraftInput } from "@/lib/validation";

function fallback(topic: string) {
  const title = topic ? `${topic} buying guide` : "New buying guide";
  return {
    title,
    excerpt: "A clear, practical guide for comparing products and deciding what matters before buying.",
    seoTitle: title,
    seoDescription: "A practical product guide with simple comparison points and clear next steps.",
    bodyHtml: "<p>This draft gives readers a simple way to compare options before choosing a product.</p><h2>What to check first</h2><p>Start with fit, size, daily use, materials, and customer reviews.</p>"
  };
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
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
    const draft = fallback(parsed.topic);
    logEvent("info", "draft.generate.success", requestId, { topic: parsed.topic });
    return ok(requestId, draft, 200);
  } catch {
    return fail(requestId, { code: "server_error", message: "Draft generation failed." }, 500);
  }
}
