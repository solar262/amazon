import { getProducts } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div>
      <section className="section">
        <p className="eyebrow">Products</p>
        <h1>All recommendations</h1>
        <p className="hero-text">Clean product summaries with clear pros, cons, and buying buttons.</p>
      </section>
      <section className="grid section pt0">
        {products.map((product) => <ProductCard key={product.slug} product={product} />)}
      </section>
    </div>
  );
}
