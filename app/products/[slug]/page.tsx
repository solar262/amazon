import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/store";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: `${product.title} review`,
    description: product.summary
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.summary,
    category: product.category
  };
  return (
    <article className="section content">
      <p className="eyebrow">{product.category}</p>
      <h1>{product.title}</h1>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <img src={product.image} alt="" className="detail-image" />
      <p className="hero-text">{product.summary}</p>
      <h2>Pros</h2>
      <ul>{product.pros.map((item) => <li key={item}>{item}</li>)}</ul>
      <h2>Cons</h2>
      <ul>{product.cons.map((item) => <li key={item}>{item}</li>)}</ul>
      <a className="button primary" href={`/go/${product.slug}?from=product-detail`} rel="nofollow sponsored">Check price</a>
      <AffiliateDisclosure />
    </article>
  );
}
