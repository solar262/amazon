import { NextResponse } from "next/server";
import { adminAllowed } from "@/lib/admin";
import { checkShopifyConnection } from "@/lib/shopify";

export async function GET(request: Request) {
  if (!adminAllowed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await checkShopifyConnection();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    shopName: result.shopName,
    domain: result.domain
  });
}
