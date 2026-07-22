# Storefront Builder

A clean editorial storefront with product cards, detail pages, guide pages, a deals page, and a simple dashboard.

Run locally:

npm install
npm run dev

Open /admin to add items and draft guide content.

## Environment variables

Create a `.env.local` file:

```
MONGODB_URI=
MONGODB_DB=storefront
ADMIN_PASSWORD=
SHOPIFY_STORE_DOMAIN=
SHOPIFY_ADMIN_API_ACCESS_TOKEN=
SHOPIFY_API_VERSION=2024-10
```

`SHOPIFY_STORE_DOMAIN` should be your `*.myshopify.com` domain.  
Use **Test Shopify connection** in `/admin` to verify the app can reach Shopify Admin API.
