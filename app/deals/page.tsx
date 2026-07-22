import { getProducts } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

export default async function DealsPage() {
  const products = await getProducts(DEFAULT_TENANT_ID);
  return (
    <div>
      <section className="section">
        <p className="eyebrow">Deals</p>
        <h1>Current price checks</h1>
        <p className="hero-text">Use these cards to send visitors to the latest product price page.</p>
      </section>
      <section className="grid section pt0">
        {products.map((product) => <ProductCard key={product.slug} product={product} />)}
      </section>
    </div>
  );
}
