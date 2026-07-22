import { NextResponse } from "next/server";
import { automationOrAdminError } from "@/lib/admin";
import { generateDraft } from "@/lib/content";
import { getProducts, saveArticle } from "@/lib/store";
import { isShopifyConfigured, publishToShopify } from "@/lib/shopify";

export async function POST(request: Request) {
  const error = automationOrAdminError(request);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const body = await request.json();
  const mode = body.mode === "publish" ? "publish" : "draft";
  const topic = String(body.topic || process.env.DEFAULT_AUTOPILOT_TOPIC || "best home upgrades");
  const products = await getProducts();
  const draft = generateDraft(topic, products);
  const productSlugs = products.slice(0, 3).map((item) => item.slug);

  const article = await saveArticle({
    ...draft,
    productSlugs,
    status: mode === "publish" ? "published" : "draft",
    publishedAt: mode === "publish" ? new Date().toISOString() : undefined
  });

  let published = null;
  if (mode === "publish" && isShopifyConfigured()) {
    const result = await publishToShopify(article);
    if (result) {
      published = result;
      await saveArticle({
        ...article,
        status: "published",
        shopifyArticleId: result.shopifyArticleId,
        canonicalUrl: result.canonicalUrl,
        publishedAt: new Date().toISOString()
      });
    }
  }

  return NextResponse.json({
    mode,
    topic,
    articleSlug: article.slug,
    shopifyPublished: Boolean(published),
    canonicalUrl: published?.canonicalUrl
  });
}
