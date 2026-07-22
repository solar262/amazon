import type { Product } from "./types";
import { affiliateUrl } from "./affiliate";

export function trackedUrl(product: Product, source?: string) {
  return affiliateUrl(product, source);
}

export function hasTrackingTag() {
  return Boolean(process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || process.env.AMAZON_ASSOCIATE_TAG || process.env.AFFILIATE_PROGRAM_ID);
}
