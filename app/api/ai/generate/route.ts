import { NextResponse } from "next/server";

function fallback(topic: string) {
  const title = topic ? `${topic} buying guide` : "New buying guide";
  return {
    title,
    excerpt: "A clear, practical guide for comparing products and deciding what matters before buying.",
    seoTitle: title,
    seoDescription: "A practical product guide with simple comparison points and clear next steps.",
    bodyHtml: "<p>This draft gives readers a simple way to compare options before choosing a product.</p><h2>What to check first</h2><p>Start with fit, size, daily use, materials, and customer reviews.</p>"
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const topic = String(body.topic || "");
  return NextResponse.json(fallback(topic));
}
