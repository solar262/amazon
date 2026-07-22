import { getDb } from "./db";
import { seedProducts, seedArticles } from "./seed";
import { seedTenants } from "./tenant";
import type { Product, Article, Tenant, RefundRequest, AutomationRun, TenantKpiSnapshot } from "./types";

const memoryProducts = [...seedProducts];
const memoryArticles = [...seedArticles];
const memoryTenants = seedTenants();
const memoryRefunds: RefundRequest[] = [];
const memoryAutomationRuns: AutomationRun[] = [];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function applyTenantScope<T extends { tenantId?: string }>(items: T[], tenantId: string) {
  return items.filter((item) => (item.tenantId || "tenant-main") === tenantId);
}

export async function getTenants(): Promise<Tenant[]> {
  const db = await getDb();
  if (!db) return memoryTenants;
  const rows = await db.collection<Tenant>("tenants").find({}).sort({ createdAt: -1 }).toArray();
  return rows.length ? rows : memoryTenants;
}

export async function saveTenant(input: Partial<Tenant>) {
  const tenant: Tenant = {
    id: input.id || slugify(input.name || "tenant"),
    name: input.name || "Untitled tenant",
    brand: input.brand || {},
    connectors: {
      emailProvider: "none",
      crmProvider: "none",
      adsProvider: "none",
      ...input.connectors
    },
    automationRules: {
      refundPolicyLimit: 200,
      escalationThreshold: 70,
      ...input.automationRules
    },
    active: input.active ?? true,
    createdAt: input.createdAt || new Date().toISOString()
  };
  const db = await getDb();
  if (!db) {
    const existing = memoryTenants.findIndex((item) => item.id === tenant.id);
    if (existing >= 0) memoryTenants[existing] = tenant;
    else memoryTenants.unshift(tenant);
    return tenant;
  }
  await db.collection<Tenant>("tenants").updateOne({ id: tenant.id }, { $set: tenant }, { upsert: true });
  return tenant;
}

export async function getProducts(tenantId: string, options?: { includeUnpublished?: boolean }): Promise<Product[]> {
  const db = await getDb();
  const includeUnpublished = Boolean(options?.includeUnpublished);
  if (!db) {
    const scoped = applyTenantScope(memoryProducts, tenantId);
    return includeUnpublished ? scoped : scoped.filter((product) => product.published !== false);
  }
  const rows = await db.collection<Product>("products").find({ tenantId }).sort({ createdAt: -1 }).toArray();
  const products = rows.length ? rows : applyTenantScope(memoryProducts, tenantId);
  return includeUnpublished ? products : products.filter((product) => product.published !== false);
}

export async function getProductBySlug(tenantId: string, slug: string, options?: { includeUnpublished?: boolean }) {
  const products = await getProducts(tenantId, { includeUnpublished: Boolean(options?.includeUnpublished) });
  return products.find((product) => product.slug === slug) || null;
}

export async function saveProduct(tenantId: string, input: Partial<Product>) {
  const product: Product = {
    id: input.id || crypto.randomUUID(),
    tenantId,
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
    const existing = memoryProducts.findIndex((item) => item.slug === product.slug && (item.tenantId || "tenant-main") === tenantId);
    if (existing >= 0) memoryProducts[existing] = product;
    else memoryProducts.unshift(product);
    return product;
  }
  await db.collection<Product>("products").updateOne({ slug: product.slug, tenantId }, { $set: product }, { upsert: true });
  return product;
}

export async function getArticles(tenantId: string, options?: { includeUnpublished?: boolean }): Promise<Article[]> {
  const db = await getDb();
  const includeUnpublished = Boolean(options?.includeUnpublished);
  if (!db) {
    const scoped = applyTenantScope(memoryArticles, tenantId);
    return includeUnpublished ? scoped : scoped.filter((article) => article.published !== false);
  }
  const rows = await db.collection<Article>("articles").find({ tenantId }).sort({ createdAt: -1 }).toArray();
  const articles = rows.length ? rows : applyTenantScope(memoryArticles, tenantId);
  return includeUnpublished ? articles : articles.filter((article) => article.published !== false);
}

export async function getArticleBySlug(tenantId: string, slug: string, options?: { includeUnpublished?: boolean }) {
  const articles = await getArticles(tenantId, { includeUnpublished: Boolean(options?.includeUnpublished) });
  return articles.find((article) => article.slug === slug) || null;
}

export async function saveArticle(tenantId: string, input: Partial<Article>) {
  const article: Article = {
    id: input.id || crypto.randomUUID(),
    tenantId,
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
    const existing = memoryArticles.findIndex((item) => item.slug === article.slug && (item.tenantId || "tenant-main") === tenantId);
    if (existing >= 0) memoryArticles[existing] = article;
    else memoryArticles.unshift(article);
    return article;
  }
  await db.collection<Article>("articles").updateOne({ slug: article.slug, tenantId }, { $set: article }, { upsert: true });
  return article;
}

export async function setProductPublished(tenantId: string, slug: string, published: boolean) {
  const db = await getDb();
  if (!db) {
    const index = memoryProducts.findIndex((product) => product.slug === slug && (product.tenantId || "tenant-main") === tenantId);
    if (index < 0) return null;
    memoryProducts[index] = { ...memoryProducts[index], published };
    return memoryProducts[index];
  }
  await db.collection<Product>("products").updateOne({ slug, tenantId }, { $set: { published } });
  return getProductBySlug(tenantId, slug, { includeUnpublished: true });
}

export async function setArticlePublished(tenantId: string, slug: string, published: boolean) {
  const db = await getDb();
  if (!db) {
    const index = memoryArticles.findIndex((article) => article.slug === slug && (article.tenantId || "tenant-main") === tenantId);
    if (index < 0) return null;
    memoryArticles[index] = { ...memoryArticles[index], published };
    return memoryArticles[index];
  }
  await db.collection<Article>("articles").updateOne({ slug, tenantId }, { $set: { published } });
  return getArticleBySlug(tenantId, slug, { includeUnpublished: true });
}

export async function saveRefundRequest(input: Partial<RefundRequest> & Pick<RefundRequest, "tenantId" | "orderId" | "customerEmail" | "amount" | "reason" | "aiRecommendation">) {
  const request: RefundRequest = {
    id: input.id || crypto.randomUUID(),
    tenantId: input.tenantId,
    orderId: input.orderId,
    customerEmail: input.customerEmail,
    amount: input.amount,
    reason: input.reason,
    aiRecommendation: input.aiRecommendation,
    status: "pending_authorization",
    auditTrail: input.auditTrail || [
      { at: new Date().toISOString(), actor: "system", action: "refund_requested", note: input.reason }
    ],
    createdAt: input.createdAt || new Date().toISOString()
  };
  const db = await getDb();
  if (!db) {
    memoryRefunds.unshift(request);
    return request;
  }
  await db.collection<RefundRequest>("refund_requests").updateOne({ id: request.id, tenantId: request.tenantId }, { $set: request }, { upsert: true });
  return request;
}

export async function getRefundRequests(tenantId: string, options?: { status?: RefundRequest["status"] }) {
  const db = await getDb();
  if (!db) {
    return memoryRefunds.filter((item) => item.tenantId === tenantId && (!options?.status || item.status === options.status));
  }
  const query: Record<string, unknown> = { tenantId };
  if (options?.status) query.status = options.status;
  return db.collection<RefundRequest>("refund_requests").find(query).sort({ createdAt: -1 }).toArray();
}

export async function authorizeRefund(tenantId: string, refundId: string, decision: "authorized" | "denied", actor: string, note?: string) {
  const db = await getDb();
  if (!db) {
    const index = memoryRefunds.findIndex((item) => item.id === refundId && item.tenantId === tenantId);
    if (index < 0) return null;
    const updated: RefundRequest = {
      ...memoryRefunds[index],
      status: decision,
      authorizedBy: actor,
      authorizedAt: new Date().toISOString(),
      auditTrail: [
        ...memoryRefunds[index].auditTrail,
        { at: new Date().toISOString(), actor, action: `refund_${decision}`, note }
      ]
    };
    memoryRefunds[index] = updated;
    return updated;
  }
  const existing = await db.collection<RefundRequest>("refund_requests").findOne({ id: refundId, tenantId });
  if (!existing) return null;
  const updated: RefundRequest = {
    ...existing,
    status: decision,
    authorizedBy: actor,
    authorizedAt: new Date().toISOString(),
    auditTrail: [...existing.auditTrail, { at: new Date().toISOString(), actor, action: `refund_${decision}`, note }]
  };
  await db.collection<RefundRequest>("refund_requests").updateOne({ id: refundId, tenantId }, { $set: updated });
  return updated;
}

export async function saveAutomationRun(run: AutomationRun) {
  const db = await getDb();
  if (!db) {
    memoryAutomationRuns.unshift(run);
    return run;
  }
  await db.collection<AutomationRun>("automation_runs").updateOne({ id: run.id, tenantId: run.tenantId }, { $set: run }, { upsert: true });
  return run;
}

export async function getAutomationRuns(tenantId: string) {
  const db = await getDb();
  if (!db) return memoryAutomationRuns.filter((item) => item.tenantId === tenantId);
  return db.collection<AutomationRun>("automation_runs").find({ tenantId }).sort({ createdAt: -1 }).toArray();
}

export async function getTenantKpiSnapshot(tenantId: string): Promise<TenantKpiSnapshot> {
  const runs = await getAutomationRuns(tenantId);
  const refunds = await getRefundRequests(tenantId);
  const completedRuns = runs.filter((run) => run.status === "completed");
  const conversionRate = runs.length ? Number(((completedRuns.length / runs.length) * 100).toFixed(2)) : 0;
  const refundRate = completedRuns.length ? Number(((refunds.length / completedRuns.length) * 100).toFixed(2)) : 0;
  const highRisk = runs.filter((run) => run.risk.chargebackRisk === "high").length;
  const chargebackRate = runs.length ? Number(((highRisk / runs.length) * 100).toFixed(2)) : 0;
  return {
    tenantId,
    conversionRate,
    cac: 42,
    ltv: 210,
    refundRate,
    chargebackRate,
    generatedAt: new Date().toISOString()
  };
}
