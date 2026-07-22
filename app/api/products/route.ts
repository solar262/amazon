import { NextResponse } from "next/server";
import { getProducts, saveProduct } from "@/lib/store";
import { adminError } from "@/lib/admin";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const error = adminError(request);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const body = await request.json();
  const product = await saveProduct(body);
  return NextResponse.json(product);
}
