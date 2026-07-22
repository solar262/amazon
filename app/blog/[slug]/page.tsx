import { notFound } from "next/navigation";
import { getArticleBySlug, getProducts } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();
  const products = await getProducts();
  const related = products.filter((product) => article.productSlugs.includes(product.slug));
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt || article.createdAt
  };
  return (
    <div>
      <article className="section content">
        <p className="eyebrow">Guide</p>
        <h1>{article.title}</h1>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        <p className="hero-text">{article.excerpt}</p>
        <p>{article.bodyHtml.replace(/<[^>]+>/g, " ")}</p>
        <AffiliateDisclosure />
      </article>
      {related.length > 0 && <section className="grid section pt0">{related.map((product) => <ProductCard key={product.slug} product={product} />)}</section>}
    </div>
  );
}
