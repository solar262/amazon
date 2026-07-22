import { NextResponse } from "next/server";
import { automationOrAdminError, refundAuthorizationError } from "@/lib/admin";

export async function POST(request: Request) {
  const authError = automationOrAdminError(request);
  if (authError) return NextResponse.json({ error: authError }, { status: 401 });

  const refundError = refundAuthorizationError(request);
  if (refundError) return NextResponse.json({ error: refundError }, { status: 401 });

  const body = await request.json();
  const refundId = typeof body.refundId === "string" ? body.refundId.trim() : "";
  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";

  if (!refundId && !orderId) {
    return NextResponse.json({ error: "refundId or orderId is required." }, { status: 400 });
  }

  return NextResponse.json({
    approved: true,
    refundId: refundId || `refund-${crypto.randomUUID()}`,
    orderId: orderId || undefined,
    amount: body.amount,
    reason: body.reason,
    authorizedAt: new Date().toISOString()
  });
}
