import Link from "next/link";
import { getProducts, getArticles } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { ArticleCard } from "@/components/ArticleCard";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

export default async function HomePage() {
  const products = await getProducts(DEFAULT_TENANT_ID);
  const articles = await getArticles(DEFAULT_TENANT_ID);
  const topProducts = products.slice(0, 3);
  const topArticles = articles.slice(0, 3);

  return (
    <div>
      <section className="premium-hero section">
        <div className="hero-copy">
          <p className="eyebrow">Premium editorial buying guides</p>
          <h1>Better product picks, cleaner pages, faster affiliate publishing.</h1>
          <p className="hero-text">A Wirecutter-style storefront for helpful reviews, comparison pages, deals, and SEO articles that guide visitors toward confident buying decisions.</p>
          <div className="hero-actions">
            <Link className="button primary" href="/products">Shop top picks</Link>
            <Link className="button ghost" href="/admin">Open admin</Link>
          </div>
          <div className="trust-row">
            <span>Independent guides</span>
            <span>Clear pros and cons</span>
            <span>Fast article drafts</span>
          </div>
        </div>
        <div className="editorial-panel">
          <div className="panel-topline"><span>Editor pick</span><span>Updated today</span></div>
          <h2>Home upgrades worth comparing first</h2>
          <p>Premium cards, honest summaries, and clean buying buttons make the site feel like a trusted content brand instead of a basic product dump.</p>
          <div className="mini-rankings">
            {topProducts.map((product, index) => (
              <Link key={product.slug} href={`/products/${product.slug}`} className="mini-row">
                <strong>0{index + 1}</strong>
                <span>{product.title}</span>
                <em>{product.badge}</em>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section feature-strip">
        <div><strong>Storefront</strong><span>Premium product pages</span></div>
        <div><strong>Admin</strong><span>Add products and guides</span></div>
        <div><strong>Content</strong><span>Draft SEO articles fast</span></div>
        <div><strong>Revenue</strong><span>Tracked buy buttons</span></div>
      </section>

      <section className="section split-heading">
        <div>
          <p className="eyebrow">Top recommendations</p>
          <h2>Curated product picks</h2>
        </div>
        <Link className="text-link" href="/products">View all products</Link>
      </section>
      <section className="grid section pt0">
        {topProducts.map((product) => <ProductCard key={product.slug} product={product} />)}
      </section>

      <section className="section compare-band">
        <div>
          <p className="eyebrow">Why this looks premium</p>
          <h2>Editorial first, product second.</h2>
          <p>Visitors should feel they are reading useful buying advice, not being pushed into random products. That trust is what makes the click more valuable.</p>
        </div>
        <div className="checklist">
          <span>✓ Clean typography</span>
          <span>✓ Warm amber accent</span>
          <span>✓ Dark-mode option</span>
          <span>✓ Clear article-to-product flow</span>
        </div>
      </section>

      <section className="section split-heading">
        <div>
          <p className="eyebrow">Organic traffic engine</p>
          <h2>Guides that lead into product clicks</h2>
        </div>
        <Link className="text-link" href="/blog">View all guides</Link>
      </section>
      <section className="grid section pt0">
        {topArticles.map((article) => <ArticleCard key={article.slug} article={article} />)}
      </section>

      <section className="section cta-panel">
        <p className="eyebrow">Admin workflow</p>
        <h2>Add the product. Draft the article. Publish the buying path.</h2>
        <p>The admin area is built so you can add products, create draft guide content, and keep building the site into a larger affiliate content machine.</p>
        <Link className="button primary" href="/admin">Go to admin</Link>
      </section>
    </div>
  );
}
