import { getProducts } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";

export default async function DealsPage() {
  const products = await getProducts();
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
