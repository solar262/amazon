import type { Product } from "./types";

export type DiscoveryCandidate = {
  title?: string;
  sourceUrl?: string;
  asin?: string;
  category?: string;
  summary?: string;
};

function scoreCandidate(candidate: DiscoveryCandidate) {
  let score = 0;
  const issues: string[] = [];
  if (!candidate.title || candidate.title.trim().length < 5) issues.push("title_too_short");
  else score += 25;
  if (candidate.sourceUrl) {
    try {
      const url = new URL(candidate.sourceUrl);
      if (!["http:", "https:"].includes(url.protocol)) issues.push("invalid_protocol");
      else score += 25;
      if (url.hostname.includes("amazon.")) score += 20;
    } catch {
      issues.push("invalid_url");
    }
  } else if (!candidate.asin) {
    issues.push("missing_url_or_asin");
  } else {
    score += 20;
  }
  if (candidate.summary && candidate.summary.length > 60) score += 15;
  if (candidate.category) score += 15;
  return { score, issues };
}

export function evaluateCandidates(candidates: DiscoveryCandidate[], existing: Product[]) {
  const existingKeys = new Set(existing.map((item) => `${item.title.toLowerCase()}|${item.sourceUrl || item.asin || ""}`));
  const seen = new Set<string>();

  const accepted: Array<DiscoveryCandidate & { qualityScore: number }> = [];
  const rejected: Array<DiscoveryCandidate & { reason: string }> = [];

  for (const candidate of candidates) {
    const title = (candidate.title || "").trim();
    const key = `${title.toLowerCase()}|${candidate.sourceUrl || candidate.asin || ""}`;
    if (!title) {
      rejected.push({ ...candidate, reason: "missing_title" });
      continue;
    }
    if (seen.has(key) || existingKeys.has(key)) {
      rejected.push({ ...candidate, reason: "duplicate" });
      continue;
    }
    seen.add(key);
    const evaluation = scoreCandidate(candidate);
    if (evaluation.score < 40 || evaluation.issues.includes("invalid_url")) {
      rejected.push({ ...candidate, reason: evaluation.issues.join(",") || "quality_too_low" });
      continue;
    }
    accepted.push({ ...candidate, qualityScore: evaluation.score });
  }
  return { accepted, rejected };
}
