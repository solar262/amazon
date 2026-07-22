export type Product = {
  id: string;
  tenantId?: string;
  slug: string;
  title: string;
  category: string;
  priceLabel: string;
  image: string;
  rating: number;
  badge: string;
  summary: string;
  pros: string[];
  cons: string[];
  published: boolean;
  asin?: string;
  sourceUrl?: string;
  createdAt?: string;
};

export type Article = {
  id: string;
  tenantId?: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  productSlugs: string[];
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
};

export type DraftResponse = {
  title: string;
  excerpt: string;
  bodyHtml: string;
  seoTitle: string;
  seoDescription: string;
};

export type ApiError = {
  code: string;
  message: string;
  details?: string[];
};

export type Tenant = {
  id: string;
  name: string;
  brand: {
    primaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
  };
  connectors: {
    stripeSecretKey?: string;
    emailProvider?: "none" | "resend" | "mailgun";
    crmProvider?: "none" | "hubspot" | "pipedrive";
    adsProvider?: "none" | "meta" | "google";
  };
  automationRules: {
    offerLogic?: string;
    pricingPromoRules?: string;
    refundPolicyLimit?: number;
    escalationThreshold?: number;
  };
  active: boolean;
  createdAt: string;
};

export type AutomationStage =
  | "lead_intake"
  | "lead_scoring"
  | "follow_up"
  | "checkout"
  | "fulfillment"
  | "support_triage";

export type AutomationRun = {
  id: string;
  tenantId: string;
  leadId: string;
  idempotencyKey?: string;
  stages: Array<{
    stage: AutomationStage;
    status: "completed" | "blocked" | "queued";
    connector?: string;
    notes?: string;
  }>;
  risk: {
    fraudScore: number;
    chargebackRisk: "low" | "medium" | "high";
    flagged: boolean;
  };
  status: "completed" | "requires_review";
  createdAt: string;
};

export type RefundRequest = {
  id: string;
  tenantId: string;
  orderId: string;
  customerEmail: string;
  amount: number;
  reason: string;
  aiRecommendation: "approve" | "deny" | "manual_review";
  status: "pending_authorization" | "authorized" | "denied";
  authorizedBy?: string;
  authorizedAt?: string;
  auditTrail: Array<{
    at: string;
    actor: string;
    action: string;
    note?: string;
  }>;
  createdAt: string;
};

export type TenantKpiSnapshot = {
  tenantId: string;
  conversionRate: number;
  cac: number;
  ltv: number;
  refundRate: number;
  chargebackRate: number;
  generatedAt: string;
};
