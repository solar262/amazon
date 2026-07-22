import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@/lib/store";
import { trackedUrl } from "@/lib/tracking";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(DEFAULT_TENANT_ID, params.slug);
  if (!product) notFound();
  return (
    <article className="section content">
      <p className="eyebrow">{product.category}</p>
      <h1>{product.title}</h1>
      <Image src={product.image} alt={product.title} className="detail-image" width={1200} height={800} unoptimized />
      <p className="hero-text">{product.summary}</p>
      <h2>Pros</h2>
      <ul>{product.pros.map((item) => <li key={item}>{item}</li>)}</ul>
      <h2>Cons</h2>
      <ul>{product.cons.map((item) => <li key={item}>{item}</li>)}</ul>
      <a className="button primary" href={trackedUrl(product.sourceUrl, product.asin)} target="_blank" rel="nofollow sponsored noopener noreferrer">Check price</a>
    </article>
  );
}
