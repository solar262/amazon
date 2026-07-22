import { NextResponse } from "next/server";
import { automationOrAdminError } from "@/lib/admin";
import { evaluateCandidates } from "@/lib/discovery";
import { getProducts, saveProduct } from "@/lib/store";

export async function POST(request: Request) {
  const error = automationOrAdminError(request);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const body = await request.json();
  const candidates = Array.isArray(body.candidates) ? body.candidates : [];
  const existing = await getProducts();
  const result = evaluateCandidates(candidates, existing);

  const saved = [];
  for (const candidate of result.accepted) {
    const product = await saveProduct({
      title: candidate.title,
      sourceUrl: candidate.sourceUrl,
      asin: candidate.asin,
      category: candidate.category || "General",
      summary: candidate.summary || "Imported from discovery workflow.",
      pros: [],
      cons: [],
      badge: `Discovery ${candidate.qualityScore}`,
      merchant: "Discovery"
    });
    saved.push(product.slug);
  }

  return NextResponse.json({
    accepted: result.accepted.length,
    rejected: result.rejected.length,
    savedSlugs: saved,
    rejectedItems: result.rejected
  });
}
