import { getTenants, saveAutomationRun } from "./store";
import type { AutomationRun, AutomationStage, RefundRequest } from "./types";

function scoreLead(lead: { value?: number; source?: string }) {
  let score = 50;
  if ((lead.value || 0) > 100) score += 25;
  if (lead.source === "organic") score += 10;
  return Math.min(100, score);
}

function riskFromScore(score: number): AutomationRun["risk"] {
  if (score >= 85) return { fraudScore: score, chargebackRisk: "high", flagged: true };
  if (score >= 70) return { fraudScore: score, chargebackRisk: "medium", flagged: false };
  return { fraudScore: score, chargebackRisk: "low", flagged: false };
}

export async function runAutomationPipeline(input: {
  tenantId: string;
  leadId: string;
  source?: string;
  value?: number;
  idempotencyKey?: string;
}) {
  const tenants = await getTenants();
  const tenant = tenants.find((item) => item.id === input.tenantId && item.active);
  if (!tenant) {
    throw new Error("Tenant not found or inactive.");
  }

  const score = scoreLead({ source: input.source, value: input.value });
  const risk = riskFromScore(score);
  const stageConnector = {
    follow_up: tenant.connectors.emailProvider || "none",
    lead_scoring: tenant.connectors.crmProvider || "none",
    checkout: tenant.connectors.stripeSecretKey ? "stripe" : "none",
    lead_intake: "internal",
    fulfillment: "internal",
    support_triage: "internal"
  } as const;

  const stageOrder: AutomationStage[] = [
    "lead_intake",
    "lead_scoring",
    "follow_up",
    "checkout",
    "fulfillment",
    "support_triage"
  ];

  const blockedByCheckout = !tenant.connectors.stripeSecretKey;
  const stages = stageOrder.map((stage) => {
    const blocked = blockedByCheckout && (stage === "checkout" || stage === "fulfillment");
    return {
      stage,
      connector: stageConnector[stage],
      status: blocked ? "blocked" : "completed",
      notes: blocked ? "Missing Stripe connector for tenant." : undefined
    };
  });

  const run: AutomationRun = {
    id: crypto.randomUUID(),
    tenantId: input.tenantId,
    leadId: input.leadId,
    idempotencyKey: input.idempotencyKey,
    stages,
    risk,
    status: risk.flagged || blockedByCheckout ? "requires_review" : "completed",
    createdAt: new Date().toISOString()
  };
  await saveAutomationRun(run);
  return run;
}

export function recommendRefundDecision(input: {
  amount: number;
  reason: string;
  rules?: { refundPolicyLimit?: number; escalationThreshold?: number };
}): RefundRequest["aiRecommendation"] {
  const limit = input.rules?.refundPolicyLimit ?? 200;
  const escalation = input.rules?.escalationThreshold ?? 70;
  const normalized = input.reason.toLowerCase();
  const abuseSignals = ["fraud", "chargeback", "abuse", "scam"];
  if (abuseSignals.some((item) => normalized.includes(item))) return "manual_review";
  if (input.amount > limit) return "manual_review";
  if (input.amount > escalation) return "deny";
  return "approve";
}
