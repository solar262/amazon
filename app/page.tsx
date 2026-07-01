import Link from "next/link";
import { getProducts, getArticles } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { ArticleCard } from "@/components/ArticleCard";

export default async function HomePage() {
  const products = await getProducts();
  const articles = await getArticles();
  return (
    <div>
      <section className="hero section">
        <div className="hero-copy">
          <p className="eyebrow">Buying guides</p>
          <h1>Helpful product research in a clean editorial layout.</h1>
          <p className="hero-text">Browse clear product summaries, practical guides, and simple comparison cards.</p>
          <div className="hero-actions">
            <Link className="button primary" href="/products">Browse products</Link>
            <Link className="button ghost" href="/blog">Read guides</Link>
          </div>
        </div>
        <div className="hero-card">
          <p className="label">New build</p>
          <h2>Storefront, admin, and writing helper</h2>
          <p>Add products and draft useful articles from one simple dashboard.</p>
        </div>
      </section>
      <section className="section split-heading"><div><p className="eyebrow">Featured</p><h2>Recommended products</h2></div><Link href="/products">View all</Link></section>
      <section className="grid section pt0">{products.slice(0, 3).map((product) => <ProductCard key={product.slug} product={product} />)}</section>
      <section className="section split-heading"><div><p className="eyebrow">Guides</p><h2>Latest articles</h2></div><Link href="/blog">View all</Link></section>
      <section className="grid section pt0">{articles.slice(0, 3).map((article) => <ArticleCard key={article.slug} article={article} />)}</section>
    </div>
  );
}
