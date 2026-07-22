import Link from "next/link";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card product-card">
      <img src={product.image} alt="" />
      <div className="card-body">
        <p className="label">{product.badge}</p>
        <h3>{product.title}</h3>
        <p>{product.summary}</p>
        <div className="meta"><span>{product.category}</span><span>★ {product.rating}</span></div>
        <div className="card-actions">
          <Link className="button ghost" href={`/products/${product.slug}`}>Read review</Link>
          <a className="button primary" href={`/go/${product.slug}?from=product-card`} rel="nofollow sponsored">Check price</a>
        </div>
      </div>
    </article>
  );
}
