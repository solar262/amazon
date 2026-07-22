import type { DraftResponse, Product } from "./types";

export function generateDraft(topic: string, products: Product[]): DraftResponse {
  const cleanTopic = topic.trim();
  const title = cleanTopic ? `${cleanTopic} buying guide` : "New buying guide";
  const picks = products.slice(0, 3).map((product) => product.title);
  const picksHtml = picks.length ? `<ul>${picks.map((item) => `<li>${item}</li>`).join("")}</ul>` : "<p>Add products to create comparisons.</p>";
  return {
    title,
    excerpt: "A clear, practical guide for comparing products and deciding what matters before buying.",
    seoTitle: title,
    seoDescription: "A practical product guide with simple comparison points and clear next steps.",
    bodyHtml: `<p>This draft gives readers a simple way to compare options before choosing a product.</p><h2>What to check first</h2><p>Start with fit, size, daily use, materials, and customer reviews.</p><h2>Recommended picks</h2>${picksHtml}`
  };
}
