import { getProducts, getArticles } from "@/lib/store";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const products = await getProducts();
  const articles = await getArticles();
  return (
    <section className="section">
      <p className="eyebrow">Dashboard</p>
      <h1>Admin workspace</h1>
      <p className="hero-text">Manage product imports, run autopilot article generation, publish flows, and monitor click metrics.</p>
      <AdminClient products={products} articles={articles} />
    </section>
  );
}
