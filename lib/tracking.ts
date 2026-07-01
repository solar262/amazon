const configuredTag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || process.env.AMAZON_ASSOCIATE_TAG || "";

export function trackedUrl(sourceUrl?: string, asin?: string) {
  const fallback = asin ? `https://www.amazon.de/dp/${asin}` : "https://www.amazon.de";
  const raw = sourceUrl || fallback;
  try {
    const url = new URL(raw);
    if (configuredTag && url.hostname.includes("amazon.")) {
      url.searchParams.set("tag", configuredTag);
    }
    return url.toString();
  } catch {
    return raw;
  }
}

export function hasTrackingTag() {
  return Boolean(configuredTag);
}
