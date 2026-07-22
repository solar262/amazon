import { getArticles } from "@/lib/store";
import { ArticleCard } from "@/components/ArticleCard";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

export default async function BlogPage() {
  const articles = await getArticles(DEFAULT_TENANT_ID);
  return (
    <div>
      <section className="section">
        <p className="eyebrow">Guides</p>
        <h1>Helpful articles</h1>
        <p className="hero-text">Practical buying advice and simple product education.</p>
      </section>
      <section className="grid section pt0">
        {articles.map((article) => <ArticleCard key={article.slug} article={article} />)}
      </section>
    </div>
  );
}
