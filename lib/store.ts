import { getDb } from "./db";
import { seedProducts, seedArticles } from "./seed";
import type { Product, Article } from "./types";

const memoryProducts = [...seedProducts];
const memoryArticles = [...seedArticles];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export async function getProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return memoryProducts;
  const rows = await db.collection<Product>("products").find({}).sort({ createdAt: -1 }).toArray();
  return rows.length ? rows : memoryProducts;
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) || null;
}

export async function saveProduct(input: Partial<Product>) {
  const product: Product = {
    id: input.id || crypto.randomUUID(),
    slug: input.slug || slugify(input.title || "new-product"),
    title: input.title || "Untitled product",
    category: input.category || "General",
    priceLabel: input.priceLabel || "Check current price",
    image: input.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    rating: Number(input.rating || 4.5),
    badge: input.badge || "Pick",
    summary: input.summary || "Product summary coming soon.",
    pros: input.pros || [],
    cons: input.cons || [],
    asin: input.asin,
    sourceUrl: input.sourceUrl,
    affiliateNetwork: input.affiliateNetwork || "amazon",
    affiliateProgramId: input.affiliateProgramId,
    merchant: input.merchant,
    createdAt: input.createdAt || new Date().toISOString()
  };
  const db = await getDb();
  if (!db) {
    memoryProducts.unshift(product);
    return product;
  }
  await db.collection<Product>("products").updateOne({ slug: product.slug }, { $set: product }, { upsert: true });
  return product;
}

export async function getArticles(): Promise<Article[]> {
  const db = await getDb();
  if (!db) return memoryArticles;
  const rows = await db.collection<Article>("articles").find({}).sort({ createdAt: -1 }).toArray();
  return rows.length ? rows : memoryArticles;
}

export async function getArticleBySlug(slug: string) {
  const articles = await getArticles();
  return articles.find((article) => article.slug === slug) || null;
}

export async function saveArticle(input: Partial<Article>) {
  const article: Article = {
    id: input.id || crypto.randomUUID(),
    slug: input.slug || slugify(input.title || "new-article"),
    title: input.title || "Untitled article",
    excerpt: input.excerpt || "Article excerpt coming soon.",
    bodyHtml: input.bodyHtml || "<p>Article body coming soon.</p>",
    productSlugs: input.productSlugs || [],
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    status: input.status || "draft",
    shopifyArticleId: input.shopifyArticleId,
    canonicalUrl: input.canonicalUrl,
    publishedAt: input.publishedAt,
    createdAt: input.createdAt || new Date().toISOString()
  };
  const db = await getDb();
  if (!db) {
    memoryArticles.unshift(article);
    return article;
  }
  await db.collection<Article>("articles").updateOne({ slug: article.slug }, { $set: article }, { upsert: true });
  return article;
}
