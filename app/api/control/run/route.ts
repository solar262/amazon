import { adminAllowed } from "@/lib/admin";
import { generateDraft } from "@/lib/ai";
import { fail, getRequestId, logEvent, ok } from "@/lib/api";
import { getProducts, saveArticle, setArticlePublished } from "@/lib/store";
import { validateDraftInput } from "@/lib/validation";

function parseInput(input: unknown) {
  const body = (input || {}) as Record<string, unknown>;
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const productSlugs = Array.isArray(body.productSlugs)
    ? body.productSlugs.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const publish = typeof body.publish === "boolean" ? body.publish : true;
  return { topic, productSlugs, publish };
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  if (!adminAllowed(request)) {
    logEvent("warn", "control.run.unauthorized", requestId);
    return fail(requestId, { code: "unauthorized", message: "Unauthorized request." }, 401);
  }

  try {
    const body = await request.json();
    const parsedInput = parseInput(body);
    const draftValidation = validateDraftInput({ topic: parsedInput.topic });
    if (draftValidation.errors.length > 0) {
      return fail(requestId, { code: "validation_error", message: "Invalid run payload.", details: draftValidation.errors }, 400);
    }

    const availableProducts = await getProducts({ includeUnpublished: true });
    const selectedProducts = parsedInput.productSlugs.length
      ? availableProducts.filter((product) => parsedInput.productSlugs.includes(product.slug))
      : availableProducts.slice(0, 6);
    const draft = await generateDraft(
      parsedInput.topic,
      selectedProducts.map((product) => ({
        title: product.title,
        slug: product.slug,
        summary: product.summary,
        category: product.category,
        priceLabel: product.priceLabel
      }))
    );

    const article = await saveArticle({
      ...draft,
      productSlugs: selectedProducts.map((product) => product.slug),
      published: parsedInput.publish
    });

    const finalArticle = parsedInput.publish ? await setArticlePublished(article.slug, true) : article;
    if (!finalArticle) {
      return fail(requestId, { code: "server_error", message: "Failed to finalize article publication." }, 500);
    }

    logEvent("info", "control.run.success", requestId, {
      topic: parsedInput.topic,
      products: selectedProducts.length,
      articleSlug: finalArticle.slug,
      published: parsedInput.publish
    });

    return ok(requestId, {
      topic: parsedInput.topic,
      selectedProducts: selectedProducts.map((product) => product.slug),
      draft,
      article: finalArticle
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "End-to-end run failed.";
    const status = message.includes("AI_API_KEY is required.") ? 503 : 500;
    const code = message.includes("AI_API_KEY is required.") ? "ai_not_configured" : "server_error";
    logEvent("error", "control.run.failed", requestId, { message: message.slice(0, 500) });
    return fail(requestId, { code, message }, status);
  }
}
