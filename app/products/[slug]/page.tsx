import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/store";
import { trackedUrl } from "@/lib/tracking";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();
  return (
    <article className="section content">
      <p className="eyebrow">{product.category}</p>
      <h1>{product.title}</h1>
      <img src={product.image} alt="" className="detail-image" />
      <p className="hero-text">{product.summary}</p>
      <h2>Pros</h2>
      <ul>{product.pros.map((item) => <li key={item}>{item}</li>)}</ul>
      <h2>Cons</h2>
      <ul>{product.cons.map((item) => <li key={item}>{item}</li>)}</ul>
      <a className="button primary" href={trackedUrl(product.sourceUrl, product.asin)} target="_blank" rel="nofollow sponsored noopener noreferrer">Check price</a>
    </article>
  );
}
