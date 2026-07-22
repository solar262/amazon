import { NextResponse } from "next/server";
import { automationOrAdminError } from "@/lib/admin";
import { pullShopifyProducts } from "@/lib/shopify";
import { saveProduct } from "@/lib/store";

export async function POST(request: Request) {
  const error = automationOrAdminError(request);
  if (error) return NextResponse.json({ error }, { status: 401 });
  try {
    const products = await pullShopifyProducts();
    const saved = [];
    for (const input of products) {
      const product = await saveProduct(input);
      saved.push(product.slug);
    }
    return NextResponse.json({ imported: saved.length, savedSlugs: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Shopify sync failed." }, { status: 500 });
  }
}
