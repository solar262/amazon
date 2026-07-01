import { notFound } from "next/navigation";
import { getArticleBySlug, getProducts } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();
  const products = await getProducts();
  const related = products.filter((product) => article.productSlugs.includes(product.slug));
  return (
    <div>
      <article className="section content">
        <p className="eyebrow">Guide</p>
        <h1>{article.title}</h1>
        <p className="hero-text">{article.excerpt}</p>
        <p>{article.bodyHtml.replace(/<[^>]+>/g, " ")}</p>
      </article>
      {related.length > 0 && <section className="grid section pt0">{related.map((product) => <ProductCard key={product.slug} product={product} />)}</section>}
    </div>
  );
}
