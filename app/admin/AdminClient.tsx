"use client";

import { useState } from "react";
import type { Product, Article, DraftResponse } from "@/lib/types";

export function AdminClient({ products, articles }: { products: Product[]; articles: Article[] }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [asin, setAsin] = useState("");
  const [topic, setTopic] = useState("");
  const [draft, setDraft] = useState<DraftResponse | null>(null);

  async function readApiResponse(response: Response) {
    const payload = await response.json();
    if (!response.ok || payload.ok === false) {
      throw new Error(payload?.error?.message || "Request failed.");
    }
    return payload.data;
  }

  async function saveProduct() {
    setStatus("Saving product...");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ title: productTitle, sourceUrl, asin, category: "General", summary: "Add a short summary for this product.", pros: [], cons: [] })
      });
      await readApiResponse(res);
      setStatus("Product saved. Refresh to see it.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Product save failed.");
    }
  }

  async function makeDraft() {
    setStatus("Drafting article...");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ topic, products })
      });
      const data = await readApiResponse(res);
      setDraft(data);
      setStatus("Draft ready.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Draft failed.");
    }
  }

  async function saveDraft() {
    if (!draft) return;
    setStatus("Saving article...");
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ ...draft, productSlugs: products.slice(0, 3).map((p) => p.slug) })
      });
      await readApiResponse(res);
      setStatus("Article saved. Refresh to see it.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Article save failed.");
    }
  }

  async function togglePublication(resourceType: "product" | "article", slug: string, published: boolean) {
    setStatus(`${published ? "Publishing" : "Unpublishing"} ${resourceType}...`);
    try {
      const res = await fetch("/api/control/publication", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ resourceType, slug, published })
      });
      await readApiResponse(res);
      setStatus("Publication status updated. Refresh to see changes.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Publication update failed.");
    }
  }

  return (
    <div className="admin-panel">
      <div className="form-grid">
        <label className="full">Admin password, only needed when configured<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></label>
        <label>Product title<input value={productTitle} onChange={(e) => setProductTitle(e.target.value)} placeholder="Product name" /></label>
        <label>Product URL<input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." /></label>
        <label>ASIN<input value={asin} onChange={(e) => setAsin(e.target.value)} placeholder="Optional" /></label>
        <div className="admin-actions full"><button className="button primary" onClick={saveProduct}>Save product</button></div>
        <label className="full">Article topic<textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Example: best bathroom upgrades for small homes" /></label>
        <div className="admin-actions full"><button className="button primary" onClick={makeDraft}>Generate draft</button>{draft && <button className="button ghost" onClick={saveDraft}>Save draft</button>}</div>
      </div>
      {status && <p>{status}</p>}
      {draft && <div className="card-body"><h2>{draft.title}</h2><p>{draft.excerpt}</p><textarea value={draft.bodyHtml} onChange={(e) => setDraft({ ...draft, bodyHtml: e.target.value })} /></div>}
      <p className="label">Current products: {products.length} | Current articles: {articles.length}</p>
      <div className="card-body">
        <h3>Product publishing</h3>
        {products.map((product) => (
          <p key={product.slug}>
            {product.title} ({product.published !== false ? "Published" : "Unpublished"}){" "}
            <button className="button ghost" onClick={() => togglePublication("product", product.slug, product.published === false)}>
              {product.published !== false ? "Unpublish" : "Publish"}
            </button>
          </p>
        ))}
      </div>
      <div className="card-body">
        <h3>Article publishing</h3>
        {articles.map((article) => (
          <p key={article.slug}>
            {article.title} ({article.published !== false ? "Published" : "Unpublished"}){" "}
            <button className="button ghost" onClick={() => togglePublication("article", article.slug, article.published === false)}>
              {article.published !== false ? "Unpublish" : "Publish"}
            </button>
          </p>
        ))}
      </div>
    </div>
  );
}
