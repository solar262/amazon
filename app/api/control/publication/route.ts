import { adminAllowed } from "@/lib/admin";
import { fail, getRequestId, logEvent, ok } from "@/lib/api";
import { setArticlePublished, setProductPublished } from "@/lib/store";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  if (!adminAllowed(request)) {
    logEvent("warn", "publication.update.unauthorized", requestId);
    return fail(requestId, { code: "unauthorized", message: "Unauthorized request." }, 401);
  }
  try {
    const body = (await request.json()) as {
      resourceType?: "product" | "article";
      slug?: string;
      published?: boolean;
    };
    if (!body.resourceType || !body.slug || typeof body.published !== "boolean") {
      return fail(
        requestId,
        { code: "validation_error", message: "resourceType, slug and published are required." },
        400
      );
    }
    const updated =
      body.resourceType === "product"
        ? await setProductPublished(body.slug, body.published)
        : await setArticlePublished(body.slug, body.published);
    if (!updated) {
      return fail(requestId, { code: "not_found", message: "Resource not found." }, 404);
    }
    logEvent("info", "publication.update.success", requestId, {
      resourceType: body.resourceType,
      slug: body.slug,
      published: body.published
    });
    return ok(requestId, updated);
  } catch {
    return fail(requestId, { code: "server_error", message: "Failed to update publication status." }, 500);
  }
}
