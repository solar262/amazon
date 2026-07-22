import type { Product, Article } from "./types";

export const seedProducts: Product[] = [
  {
    id: "p1",
    slug: "motion-sensor-light",
    title: "Motion Sensor Light",
    category: "Home",
    priceLabel: "Check current price",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
    rating: 4.7,
    badge: "Top pick",
    summary: "A simple plug-in light for hallways, bedrooms, and corridors.",
    pros: ["Easy setup", "Compact", "Low power use"],
    cons: ["Needs a nearby socket"],
    published: true
  },
  {
    id: "p2",
    slug: "bathroom-seat",
    title: "Bathroom Seat",
    category: "Bathroom",
    priceLabel: "Check current price",
    image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=1200&auto=format&fit=crop",
    rating: 4.6,
    badge: "Bathroom pick",
    summary: "A practical seat for a more comfortable bathroom routine.",
    pros: ["Supportive", "Non-slip feet", "Light frame"],
    cons: ["Check size first"],
    published: true
  },
  {
    id: "p3",
    slug: "bedside-rail",
    title: "Bedside Rail",
    category: "Bedroom",
    priceLabel: "Check current price",
    image: "https://images.unsplash.com/photo-1615874694520-474822394e73?q=80&w=1200&auto=format&fit=crop",
    rating: 4.5,
    badge: "Helpful support",
    summary: "A compact rail for extra support beside a bed.",
    pros: ["Compact", "Helpful grip point", "Simple design"],
    cons: ["Check bed fit first"],
    published: true
  }
];

export const seedArticles: Article[] = [
  {
    id: "a1",
    slug: "simple-home-checklist",
    title: "Simple Home Checklist",
    excerpt: "A practical room-by-room checklist for useful home upgrades.",
    productSlugs: ["motion-sensor-light", "bathroom-seat", "bedside-rail"],
    bodyHtml: "<p>A more comfortable home often starts with small changes.</p><h2>Start with lighting</h2><p>Hallways, bedrooms, and bathrooms should be easy to navigate at night.</p>",
    published: true
  }
];
