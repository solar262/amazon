import type { Article, Product } from "./types";

function isText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string");
}

export function validateProductInput(input: unknown): { value?: Partial<Product>; errors: string[] } {
  const body = (input || {}) as Record<string, unknown>;
  const errors: string[] = [];
  if (!isText(body.title)) errors.push("title is required");
  if (body.sourceUrl && typeof body.sourceUrl !== "string") errors.push("sourceUrl must be a string");
  if (body.asin && typeof body.asin !== "string") errors.push("asin must be a string");
  if (body.published !== undefined && typeof body.published !== "boolean") errors.push("published must be boolean");
  return {
    errors,
    value: {
      title: typeof body.title === "string" ? body.title : undefined,
      sourceUrl: typeof body.sourceUrl === "string" ? body.sourceUrl : undefined,
      asin: typeof body.asin === "string" ? body.asin : undefined,
      category: typeof body.category === "string" ? body.category : undefined,
      summary: typeof body.summary === "string" ? body.summary : undefined,
      pros: asStringArray(body.pros),
      cons: asStringArray(body.cons),
      published: typeof body.published === "boolean" ? body.published : undefined
    }
  };
}

export function validateArticleInput(input: unknown): { value?: Partial<Article>; errors: string[] } {
  const body = (input || {}) as Record<string, unknown>;
  const errors: string[] = [];
  if (!isText(body.title)) errors.push("title is required");
  if (!isText(body.excerpt)) errors.push("excerpt is required");
  if (!isText(body.bodyHtml)) errors.push("bodyHtml is required");
  if (body.published !== undefined && typeof body.published !== "boolean") errors.push("published must be boolean");
  return {
    errors,
    value: {
      title: typeof body.title === "string" ? body.title : undefined,
      excerpt: typeof body.excerpt === "string" ? body.excerpt : undefined,
      bodyHtml: typeof body.bodyHtml === "string" ? body.bodyHtml : undefined,
      productSlugs: asStringArray(body.productSlugs),
      seoTitle: typeof body.seoTitle === "string" ? body.seoTitle : undefined,
      seoDescription: typeof body.seoDescription === "string" ? body.seoDescription : undefined,
      published: typeof body.published === "boolean" ? body.published : undefined
    }
  };
}

export function validateDraftInput(input: unknown) {
  const body = (input || {}) as Record<string, unknown>;
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  return { topic, errors: topic ? [] : ["topic is required"] };
}
