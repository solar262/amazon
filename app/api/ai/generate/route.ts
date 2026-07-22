import { adminAllowed } from "@/lib/admin";
import { fail, getRequestId, logEvent, ok } from "@/lib/api";
import { validateDraftInput } from "@/lib/validation";

type ProductContext = {
  title: string;
  slug?: string;
  summary?: string;
  category?: string;
  priceLabel?: string;
};

type DraftPayload = {
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  bodyHtml: string;
};

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseDraftPayload(input: unknown): DraftPayload | null {
  const data = (input || {}) as Record<string, unknown>;
  const title = asText(data.title);
  const excerpt = asText(data.excerpt);
  const seoTitle = asText(data.seoTitle) || title;
  const seoDescription = asText(data.seoDescription) || excerpt;
  const bodyHtml = asText(data.bodyHtml);
  if (!title || !excerpt || !seoTitle || !seoDescription || !bodyHtml) return null;
  return { title, excerpt, seoTitle, seoDescription, bodyHtml };
}

async function generateDraft(topic: string, products: ProductContext[], requestId: string) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("AI_API_KEY is required.");
  }
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const url = `${baseUrl}/chat/completions`;
  const productContext = products.length
    ? products
        .slice(0, 12)
        .map((product, index) =>
          `${index + 1}. ${product.title}${product.category ? ` | category: ${product.category}` : ""}${product.priceLabel ? ` | price: ${product.priceLabel}` : ""}${product.summary ? ` | summary: ${product.summary}` : ""}`
        )
        .join("\n")
    : "No specific product context provided.";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + apiKey
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write ecommerce buying guides. Return strict JSON with: title, excerpt, seoTitle, seoDescription, bodyHtml. bodyHtml must be valid HTML with headings, paragraphs, and at least one list."
        },
        {
          role: "user",
          content: `Topic: ${topic}\n\nProduct context:\n${productContext}\n\nWrite a clear buying guide for shoppers. Keep title under 70 chars, excerpt under 180 chars, and seoDescription under 160 chars.`
        }
      ]
    })
  });

  if (!response.ok) {
    const details = await response.text();
    logEvent("error", "draft.generate.provider_error", requestId, {
      status: response.status,
      details: details.slice(0, 500)
    });
    throw new Error("AI provider request failed.");
  }

  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI provider returned empty content.");

  try {
    const parsed = JSON.parse(content);
    const draft = parseDraftPayload(parsed);
    if (!draft) throw new Error("Invalid draft structure.");
    return draft;
  } catch {
    throw new Error("AI provider returned invalid JSON.");
  }
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
    const draft = await generateDraft(parsed.topic, parsed.products, requestId);
    logEvent("info", "draft.generate.success", requestId, { topic: parsed.topic, products: parsed.products.length });
    return ok(requestId, draft, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Draft generation failed.";
    const status = message.includes("AI_API_KEY is required.") ? 503 : 500;
    const code = message.includes("AI_API_KEY is required.") ? "ai_not_configured" : "server_error";
    return fail(requestId, { code, message }, status);
  }
}
