import { getProducts, saveProduct } from "@/lib/store";
import { adminAllowed } from "@/lib/admin";
import { fail, getRequestId, logEvent, ok } from "@/lib/api";
import { validateProductInput } from "@/lib/validation";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  try {
    const url = new URL(request.url);
    const includeUnpublished = url.searchParams.get("includeUnpublished") === "true" && adminAllowed(request);
    const products = await getProducts({ includeUnpublished });
    return ok(requestId, products);
  } catch {
    return fail(requestId, { code: "server_error", message: "Failed to load products." }, 500);
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  if (!adminAllowed(request)) {
    logEvent("warn", "products.create.unauthorized", requestId);
    return fail(requestId, { code: "unauthorized", message: "Unauthorized request." }, 401);
  }
  try {
    const body = await request.json();
    const parsed = validateProductInput(body);
    if (parsed.errors.length > 0) {
      return fail(requestId, { code: "validation_error", message: "Invalid product payload.", details: parsed.errors }, 400);
    }
    const product = await saveProduct(parsed.value || {});
    logEvent("info", "products.create.success", requestId, { slug: product.slug });
    return ok(requestId, product, 201);
  } catch {
    return fail(requestId, { code: "server_error", message: "Failed to save product." }, 500);
  }
}
