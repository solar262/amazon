# Storefront Builder

Editorial affiliate storefront with:
- Product and guide pages
- Admin dashboard for product intake and draft generation
- Autopilot pipeline for draft/publish workflows
- Shopify product sync + blog publishing integration
- Affiliate redirect tracking and click analytics

## Run locally

```bash
npm install
npm run dev
```

Open `/admin`.

## Environment variables

```bash
# security
ADMIN_PASSWORD=change-me
AUTOMATION_SECRET=change-me

# affiliate
AFFILIATE_NETWORK=amazon
AMAZON_ASSOCIATE_TAG=yourtag-21
AFFILIATE_PROGRAM_ID=optional-program-id

# optional db
MONGODB_URI=
MONGODB_DB=storefront

# shopify (required for publish and sync endpoints)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx
SHOPIFY_BLOG_ID=123456789
SHOPIFY_API_VERSION=2024-10
```

## API endpoints

### Core
- `GET /api/products`
- `POST /api/products` (admin)
- `GET /api/articles`
- `POST /api/articles` (admin)
- `POST /api/ai/generate` (admin)

### Automation
- `POST /api/control/run` (admin or `x-automation-secret`)
  - body: `{ "topic": "best ...", "mode": "draft" | "publish" }`
- `POST /api/control/discover` (admin)
  - body: `{ "candidates": [{ "title": "...", "sourceUrl": "https://..." }] }`
- `GET /api/control/link-health` (admin)
- `GET /api/control/metrics` (admin)

### Shopify
- `POST /api/shopify/sync-products` (admin)

### Analytics
- `POST /api/analytics/event`
- `GET /go/:slug` (tracked affiliate redirect + outbound click event)

## Security behavior

- Write operations require `x-admin-password` when `ADMIN_PASSWORD` is set.
- In production, write operations fail closed when `ADMIN_PASSWORD` is missing.
- Scheduled automation can use `x-automation-secret`.
