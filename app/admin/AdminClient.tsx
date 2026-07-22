"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product, Article, DraftResponse, Tenant, RefundRequest, TenantKpiSnapshot, AutomationRun } from "@/lib/types";

type Props = {
  products: Product[];
  articles: Article[];
  tenants: Tenant[];
  tenantId: string;
};

export function AdminClient({ products, articles, tenants, tenantId }: Props) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [asin, setAsin] = useState("");
  const [topic, setTopic] = useState("");
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [leadId, setLeadId] = useState("");
  const [refundOrderId, setRefundOrderId] = useState("");
  const [refundEmail, setRefundEmail] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [kpis, setKpis] = useState<TenantKpiSnapshot | null>(null);
  const [automationRuns, setAutomationRuns] = useState<AutomationRun[]>([]);

  const activeTenantName = useMemo(() => tenants.find((item) => item.id === tenantId)?.name || tenantId, [tenants, tenantId]);

  async function readApiResponse(response: Response) {
    const payload = await response.json();
    if (!response.ok || payload.ok === false) {
      throw new Error(payload?.error?.message || "Request failed.");
    }
    return payload.data;
  }

  function authHeaders() {
    return {
      "content-type": "application/json",
      "x-admin-password": password,
      "x-tenant-id": tenantId
    };
  }

  async function saveProduct() {
    setStatus("Saving product...");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: authHeaders(),
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
        headers: authHeaders(),
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
        headers: authHeaders(),
        body: JSON.stringify({ ...draft, productSlugs: products.slice(0, 3).map((p) => p.slug) })
      });
      await readApiResponse(res);
      setStatus("Article saved. Refresh to see it.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Article save failed.");
    }
  }

  async function runEndToEnd() {
    setStatus("Running content pipeline...");
    try {
      const res = await fetch("/api/control/run", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ topic, productSlugs: products.slice(0, 6).map((product) => product.slug), publish: true })
      });
      const data = await readApiResponse(res);
      setDraft(data.draft);
      setStatus("Content pipeline complete.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Pipeline failed.");
    }
  }

  async function runAutomation() {
    setStatus("Running modular automation pipeline...");
    try {
      const res = await fetch("/api/automation/run", {
        method: "POST",
        headers: { ...authHeaders(), "idempotency-key": `automation-${tenantId}-${leadId}` },
        body: JSON.stringify({ leadId, source: "organic", value: 120 })
      });
      await readApiResponse(res);
      await loadAutomationRuns();
      setStatus("Automation run completed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Automation run failed.");
    }
  }

  async function loadAutomationRuns() {
    const res = await fetch(`/api/automation/run?tenantId=${encodeURIComponent(tenantId)}`, {
      method: "GET",
      headers: { "x-admin-password": password, "x-tenant-id": tenantId }
    });
    const data = await readApiResponse(res);
    setAutomationRuns(Array.isArray(data) ? data : []);
  }

  async function togglePublication(resourceType: "product" | "article", slug: string, published: boolean) {
    setStatus(`${published ? "Publishing" : "Unpublishing"} ${resourceType}...`);
    try {
      const res = await fetch("/api/control/publication", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ resourceType, slug, published })
      });
      await readApiResponse(res);
      setStatus("Publication status updated. Refresh to see changes.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Publication update failed.");
    }
  }

  async function submitRefundRequest() {
    setStatus("Creating refund request...");
    try {
      const res = await fetch("/api/refunds", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          orderId: refundOrderId,
          customerEmail: refundEmail,
          reason: refundReason,
          amount: Number(refundAmount)
        })
      });
      await readApiResponse(res);
      await loadRefunds();
      setStatus("Refund queued for authorization.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Refund request failed.");
    }
  }

  async function loadRefunds() {
    const res = await fetch(`/api/refunds?tenantId=${encodeURIComponent(tenantId)}&status=pending_authorization`, {
      method: "GET",
      headers: { "x-admin-password": password, "x-tenant-id": tenantId }
    });
    const data = await readApiResponse(res);
    setRefunds(Array.isArray(data) ? data : []);
  }

  async function authorizePendingRefund(refundId: string, decision: "authorized" | "denied") {
    setStatus(`${decision === "authorized" ? "Authorizing" : "Denying"} refund...`);
    try {
      const res = await fetch("/api/refunds/authorize", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          refundId,
          decision,
          actor: "admin-user",
          note: "Human-in-loop refund decision."
        })
      });
      await readApiResponse(res);
      await loadRefunds();
      setStatus("Refund decision recorded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Refund authorization failed.");
    }
  }

  async function loadKpis() {
    const res = await fetch(`/api/kpis?tenantId=${encodeURIComponent(tenantId)}`, {
      method: "GET",
      headers: { "x-admin-password": password, "x-tenant-id": tenantId }
    });
    const data = await readApiResponse(res);
    setKpis(data || null);
    setStatus("KPI snapshot loaded.");
  }

  return (
    <div className="admin-panel">
      <p className="label">Active tenant: {activeTenantName}</p>
      <div className="form-grid">
        <label className="full">
          Tenant
          <select value={tenantId} onChange={(e) => (window.location.href = `/admin?tenantId=${encodeURIComponent(e.target.value)}`)}>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
            ))}
          </select>
        </label>
        <label className="full">Admin password, only needed when configured<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></label>
        <label>Product title<input value={productTitle} onChange={(e) => setProductTitle(e.target.value)} placeholder="Product name" /></label>
        <label>Product URL<input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." /></label>
        <label>ASIN<input value={asin} onChange={(e) => setAsin(e.target.value)} placeholder="Optional" /></label>
        <div className="admin-actions full"><button className="button primary" onClick={saveProduct}>Save product</button></div>
        <label className="full">Article topic<textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Example: best bathroom upgrades for small homes" /></label>
        <div className="admin-actions full">
          <button className="button primary" onClick={makeDraft}>Generate draft</button>
          <button className="button primary" onClick={runEndToEnd}>Run content pipeline</button>
          {draft && <button className="button ghost" onClick={saveDraft}>Save draft</button>}
        </div>
      </div>
      {status && <p>{status}</p>}
      {draft && <div className="card-body"><h2>{draft.title}</h2><p>{draft.excerpt}</p><textarea value={draft.bodyHtml} onChange={(e) => setDraft({ ...draft, bodyHtml: e.target.value })} /></div>}
      <p className="label">Current products: {products.length} | Current articles: {articles.length}</p>

      <div className="card-body">
        <h3>Automation pipeline (95% auto)</h3>
        <label>Lead id<input value={leadId} onChange={(e) => setLeadId(e.target.value)} placeholder="lead-001" /></label>
        <div className="admin-actions">
          <button className="button primary" onClick={runAutomation}>Run automation</button>
          <button className="button ghost" onClick={loadAutomationRuns}>Load runs</button>
        </div>
        {automationRuns.map((run) => (
          <p key={run.id}>Run {run.id.slice(0, 8)} · {run.status} · Risk {run.risk.chargebackRisk}</p>
        ))}
      </div>

      <div className="card-body">
        <h3>Refund queue (human authorization required)</h3>
        <label>Order id<input value={refundOrderId} onChange={(e) => setRefundOrderId(e.target.value)} placeholder="ord-001" /></label>
        <label>Customer email<input value={refundEmail} onChange={(e) => setRefundEmail(e.target.value)} placeholder="customer@email.com" /></label>
        <label>Amount<input value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="89.00" /></label>
        <label>Reason<textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Reason for refund request" /></label>
        <div className="admin-actions">
          <button className="button primary" onClick={submitRefundRequest}>Queue refund request</button>
          <button className="button ghost" onClick={loadRefunds}>Load pending refunds</button>
        </div>
        {refunds.map((refund) => (
          <p key={refund.id}>
            {refund.orderId} · ${refund.amount} · AI: {refund.aiRecommendation}
            {" "}
            <button className="button ghost" onClick={() => authorizePendingRefund(refund.id, "authorized")}>Authorize</button>
            <button className="button ghost" onClick={() => authorizePendingRefund(refund.id, "denied")}>Deny</button>
          </p>
        ))}
      </div>

      <div className="card-body">
        <h3>KPI snapshot</h3>
        <button className="button ghost" onClick={loadKpis}>Load KPIs</button>
        {kpis && (
          <p>
            CAC {kpis.cac} · Conversion {kpis.conversionRate}% · LTV {kpis.ltv} · Refund rate {kpis.refundRate}% · Chargeback rate {kpis.chargebackRate}%
          </p>
        )}
      </div>

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

      <p className="label">
        Multi-tenant routes enforce x-tenant-id. Use <Link href={`/admin?tenantId=${encodeURIComponent(tenantId)}`}>this tenant context</Link> for admin operations.
      </p>
    </div>
  );
}
