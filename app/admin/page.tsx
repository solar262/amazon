import { getProducts, getArticles, getTenants } from "@/lib/store";
import { AdminClient } from "./AdminClient";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

export default async function AdminPage({ searchParams }: { searchParams?: { tenantId?: string } }) {
  const tenantId = searchParams?.tenantId || DEFAULT_TENANT_ID;
  const [products, articles, tenants] = await Promise.all([
    getProducts(tenantId),
    getArticles(tenantId),
    getTenants()
  ]);
  return (
    <section className="section">
      <p className="eyebrow">Dashboard</p>
      <h1>Admin workspace</h1>
      <p className="hero-text">Multi-tenant automation workspace with refund authorization control.</p>
      <AdminClient products={products} articles={articles} tenants={tenants} tenantId={tenantId} />
    </section>
  );
}
