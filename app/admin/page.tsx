import { getProducts, getArticles } from "@/lib/store";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const products = await getProducts({ includeUnpublished: true });
  const articles = await getArticles({ includeUnpublished: true });
  return (
    <section className="section">
      <p className="eyebrow">Dashboard</p>
      <h1>Admin workspace</h1>
      <p className="hero-text">Add products and draft article content from one place.</p>
      <AdminClient products={products} articles={articles} />
    </section>
  );
}
