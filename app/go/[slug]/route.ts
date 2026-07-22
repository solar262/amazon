import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/store";
import { affiliateUrl } from "@/lib/affiliate";
import { saveEvent } from "@/lib/analytics";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return NextResponse.redirect(new URL("/", request.url));
  const from = new URL(request.url).searchParams.get("from") || "site";
  const destination = affiliateUrl(product, from);
  await saveEvent({
    type: "outbound_click",
    slug: product.slug,
    path: `/go/${product.slug}`,
    destination
  });
  return NextResponse.redirect(destination);
}
