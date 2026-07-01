import Link from "next/link";
import type { Article } from "@/lib/types";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="card">
      <div className="card-body">
        <p className="label">Guide</p>
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
        <Link className="text-link" href={`/blog/${article.slug}`}>Read guide</Link>
      </div>
    </article>
  );
}
