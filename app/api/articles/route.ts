import { getArticles, saveArticle } from "@/lib/store";
import { adminAllowed } from "@/lib/admin";
import { fail, getRequestId, logEvent, ok } from "@/lib/api";
import { validateArticleInput } from "@/lib/validation";
import { ensureTenantId } from "@/lib/tenant";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const tenant = ensureTenantId(request, requestId);
  if ("error" in tenant) return tenant.error;
  try {
    const url = new URL(request.url);
    const includeUnpublished = url.searchParams.get("includeUnpublished") === "true" && adminAllowed(request);
    return ok(requestId, await getArticles(tenant.tenantId, { includeUnpublished }));
  } catch {
    return fail(requestId, { code: "server_error", message: "Failed to load articles." }, 500);
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const tenant = ensureTenantId(request, requestId);
  if ("error" in tenant) return tenant.error;
  if (!adminAllowed(request)) {
    logEvent("warn", "articles.create.unauthorized", requestId);
    return fail(requestId, { code: "unauthorized", message: "Unauthorized request." }, 401);
  }
  try {
    const body = await request.json();
    const parsed = validateArticleInput(body);
    if (parsed.errors.length > 0) {
      return fail(requestId, { code: "validation_error", message: "Invalid article payload.", details: parsed.errors }, 400);
    }
    const article = await saveArticle(tenant.tenantId, parsed.value || {});
    logEvent("info", "articles.create.success", requestId, { tenantId: tenant.tenantId, slug: article.slug });
    return ok(requestId, article, 201);
  } catch {
    return fail(requestId, { code: "server_error", message: "Failed to save article." }, 500);
  }
}
