import { NextResponse } from "next/server";
import { getProducts, saveProduct } from "@/lib/store";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const product = await saveProduct(body);
  return NextResponse.json(product);
}
