import type { Product } from "./types";

const defaultAmazonTag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || process.env.AMAZON_ASSOCIATE_TAG || "";
const defaultProgramId = process.env.AFFILIATE_PROGRAM_ID || "";
const defaultNetwork = (process.env.AFFILIATE_NETWORK || "amazon").toLowerCase();

function safeUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function baseProductUrl(product: Pick<Product, "sourceUrl" | "asin">) {
  if (product.sourceUrl) return product.sourceUrl;
  if (product.asin) return `https://www.amazon.de/dp/${product.asin}`;
  return "https://www.amazon.de";
}

export function affiliateUrl(product: Product, source?: string) {
  const raw = baseProductUrl(product);
  const url = safeUrl(raw);
  if (!url) return raw;
  const network = (product.affiliateNetwork || defaultNetwork || "amazon").toLowerCase();
  const program = product.affiliateProgramId || defaultProgramId;

  if (network === "amazon" && defaultAmazonTag && url.hostname.includes("amazon.")) {
    url.searchParams.set("tag", defaultAmazonTag);
  }
  if (program) {
    url.searchParams.set("aff_id", program);
  }
  if (source) {
    url.searchParams.set("utm_source", source);
    url.searchParams.set("utm_medium", "affiliate");
  }
  return url.toString();
}

export function affiliateDisclosure() {
  return "Affiliate disclosure: we may earn a commission from qualifying purchases made through links on this site.";
}
