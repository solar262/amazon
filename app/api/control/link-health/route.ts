import { NextResponse } from "next/server";
import { automationOrAdminError } from "@/lib/admin";
import { getProducts } from "@/lib/store";
import { affiliateUrl } from "@/lib/affiliate";

async function checkOne(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const error = automationOrAdminError(request);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const products = await getProducts();
  const checks = await Promise.all(
    products.slice(0, 25).map(async (product) => {
      const destination = affiliateUrl(product, "health-check");
      const result = await checkOne(destination);
      return { slug: product.slug, destination, ...result };
    })
  );
  return NextResponse.json({
    total: checks.length,
    failed: checks.filter((item) => !item.ok).length,
    checks
  });
}
