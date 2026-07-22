import { getDb } from "./db";
import { seedProducts, seedArticles } from "./seed";
import type { Product, Article } from "./types";

const memoryProducts = [...seedProducts];
const memoryArticles = [...seedArticles];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export async function getProducts(options?: { includeUnpublished?: boolean }): Promise<Product[]> {
  const db = await getDb();
  const includeUnpublished = Boolean(options?.includeUnpublished);
  if (!db) return includeUnpublished ? memoryProducts : memoryProducts.filter((product) => product.published !== false);
  const rows = await db.collection<Product>("products").find({}).sort({ createdAt: -1 }).toArray();
  const products = rows.length ? rows : memoryProducts;
  return includeUnpublished ? products : products.filter((product) => product.published !== false);
}

export async function getProductBySlug(slug: string, options?: { includeUnpublished?: boolean }) {
  const products = await getProducts({ includeUnpublished: Boolean(options?.includeUnpublished) });
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
    published: input.published ?? true,
    asin: input.asin,
    sourceUrl: input.sourceUrl,
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

export async function getArticles(options?: { includeUnpublished?: boolean }): Promise<Article[]> {
  const db = await getDb();
  const includeUnpublished = Boolean(options?.includeUnpublished);
  if (!db) return includeUnpublished ? memoryArticles : memoryArticles.filter((article) => article.published !== false);
  const rows = await db.collection<Article>("articles").find({}).sort({ createdAt: -1 }).toArray();
  const articles = rows.length ? rows : memoryArticles;
  return includeUnpublished ? articles : articles.filter((article) => article.published !== false);
}

export async function getArticleBySlug(slug: string, options?: { includeUnpublished?: boolean }) {
  const articles = await getArticles({ includeUnpublished: Boolean(options?.includeUnpublished) });
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
    published: input.published ?? true,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
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

export async function setProductPublished(slug: string, published: boolean) {
  const db = await getDb();
  if (!db) {
    const index = memoryProducts.findIndex((product) => product.slug === slug);
    if (index < 0) return null;
    memoryProducts[index] = { ...memoryProducts[index], published };
    return memoryProducts[index];
  }
  await db.collection<Product>("products").updateOne({ slug }, { $set: { published } });
  return getProductBySlug(slug, { includeUnpublished: true });
}

export async function setArticlePublished(slug: string, published: boolean) {
  const db = await getDb();
  if (!db) {
    const index = memoryArticles.findIndex((article) => article.slug === slug);
    if (index < 0) return null;
    memoryArticles[index] = { ...memoryArticles[index], published };
    return memoryArticles[index];
  }
  await db.collection<Article>("articles").updateOne({ slug }, { $set: { published } });
  return getArticleBySlug(slug, { includeUnpublished: true });
}
