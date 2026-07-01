export type Product = {
  id: string;
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
  asin?: string;
  sourceUrl?: string;
  createdAt?: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  productSlugs: string[];
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
