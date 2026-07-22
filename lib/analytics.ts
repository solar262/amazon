import { getDb } from "./db";

export type AnalyticsEvent = {
  id: string;
  type: "outbound_click" | "impression" | "article_view";
  slug?: string;
  path?: string;
  destination?: string;
  createdAt: string;
};

const memoryEvents: AnalyticsEvent[] = [];

export async function saveEvent(input: Omit<AnalyticsEvent, "id" | "createdAt">) {
  const event: AnalyticsEvent = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input
  };
  const db = await getDb();
  if (!db) {
    memoryEvents.unshift(event);
    return event;
  }
  await db.collection<AnalyticsEvent>("analytics_events").insertOne(event);
  return event;
}

export async function listEvents(limit = 200) {
  const db = await getDb();
  if (!db) return memoryEvents.slice(0, limit);
  return db.collection<AnalyticsEvent>("analytics_events").find({}).sort({ createdAt: -1 }).limit(limit).toArray();
}

export async function metricsSummary() {
  const events = await listEvents(2000);
  const now = Date.now();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const outbound = events.filter((event) => event.type === "outbound_click");
  const weekOutbound = outbound.filter((event) => now - new Date(event.createdAt).getTime() <= oneWeek);
  const bySlug = outbound.reduce<Record<string, number>>((acc, event) => {
    const key = event.slug || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topLinks = Object.entries(bySlug)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, clicks]) => ({ slug, clicks }));
  return {
    totalEvents: events.length,
    outboundClicks: outbound.length,
    outboundClicks7d: weekOutbound.length,
    topLinks
  };
}
