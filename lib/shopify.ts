import type { Article, Product } from "./types";

type ShopifyConfig = {
  domain: string;
  token: string;
  version: string;
  blogId: string;
};

function getConfig(): ShopifyConfig | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || "";
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "";
  const blogId = process.env.SHOPIFY_BLOG_ID || "";
  const version = process.env.SHOPIFY_API_VERSION || "2024-10";
  if (!domain || !token || !blogId) return null;
  return { domain, token, blogId, version };
}

export function isShopifyConfigured() {
  return Boolean(getConfig());
}

async function requestShopify(path: string, method: "GET" | "POST", body?: unknown) {
  const cfg = getConfig();
  if (!cfg) throw new Error("Shopify is not configured.");
  const response = await fetch(`https://${cfg.domain}/admin/api/${cfg.version}${path}`, {
    method,
    headers: {
      "X-Shopify-Access-Token": cfg.token,
      "content-type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify error: ${response.status} ${text}`);
  }
  return response.json();
}

export async function publishToShopify(article: Article) {
  const cfg = getConfig();
  if (!cfg) return null;
  const payload = {
    article: {
      title: article.title,
      body_html: article.bodyHtml,
      summary_html: article.excerpt,
      tags: "affiliate,guide",
      published: true
    }
  };
  const data = await requestShopify(`/blogs/${cfg.blogId}/articles.json`, "POST", payload);
  return data?.article
    ? {
        shopifyArticleId: String(data.article.id),
        canonicalUrl: data.article?.handle ? `https://${cfg.domain}/blogs/news/${data.article.handle}` : undefined
      }
    : null;
}

export async function pullShopifyProducts() {
  const data = await requestShopify("/products.json?limit=50", "GET");
  const products = Array.isArray(data?.products) ? data.products : [];
  return products.map((item: any): Partial<Product> => {
    const variant = item.variants?.[0];
    return {
      title: item.title || "Untitled product",
      category: item.product_type || "General",
      image: item.image?.src || "",
      summary: item.body_html ? String(item.body_html).replace(/<[^>]+>/g, " ").trim().slice(0, 220) : "Imported from Shopify.",
      priceLabel: variant?.price ? `From ${variant.price}` : "Check current price",
      rating: 4.5,
      badge: "Shopify import",
      sourceUrl: item.handle ? `https://${process.env.SHOPIFY_STORE_DOMAIN}/products/${item.handle}` : undefined,
      pros: [],
      cons: [],
      merchant: "Shopify"
    };
  });
}
