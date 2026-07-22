import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { trackedUrl } from "@/lib/tracking";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card product-card">
      <Image src={product.image} alt={product.title} width={1200} height={800} unoptimized />
      <div className="card-body">
        <p className="label">{product.badge}</p>
        <h3>{product.title}</h3>
        <p>{product.summary}</p>
        <div className="meta"><span>{product.category}</span><span>★ {product.rating}</span></div>
        <div className="card-actions">
          <Link className="button ghost" href={`/products/${product.slug}`}>Read review</Link>
          <a className="button primary" href={trackedUrl(product.sourceUrl, product.asin)} target="_blank" rel="nofollow sponsored noopener noreferrer">Check price</a>
        </div>
      </div>
    </article>
  );
}
