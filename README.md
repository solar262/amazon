# Storefront Builder

A clean editorial storefront with product cards, detail pages, guide pages, a deals page, and an admin dashboard.

## Local development

```bash
npm install
npm run dev
```

Open `/admin` to add products, generate draft articles, and manage publish state.

## Cloud runtime requirements

Run in cloud with:

```bash
npm run build
npm run start
```

### Required environment variables (production)

- `MONGODB_URI` (required)
- `MONGODB_DB` (optional, defaults to `storefront`)
- `ADMIN_PASSWORD` (required in production for authenticated write/control operations)
- `AI_API_KEY` (required for `/api/ai/generate`)
- `REQUIRE_PERSISTENT_STORE=true` (recommended hard enforcement)

### Optional environment variables

- `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` or `AMAZON_ASSOCIATE_TAG`
- `AI_MODEL` (defaults to `gpt-4o-mini`)
- `AI_BASE_URL` (defaults to `https://api.openai.com/v1`, supports OpenAI-compatible providers)

## External control contract (outside nerve system)

All API responses use this shape:

```json
{
  "ok": true,
  "requestId": "uuid",
  "data": {}
}
```

Error responses:

```json
{
  "ok": false,
  "requestId": "uuid",
  "error": {
    "code": "validation_error",
    "message": "Invalid payload"
  }
}
```

### Auth for write operations

Provide one of:

- `x-admin-password: <ADMIN_PASSWORD>`
- `x-control-token: <ADMIN_PASSWORD>`
- `Authorization header token matching ADMIN_PASSWORD`

If `ADMIN_PASSWORD` is not configured, authenticated write/control endpoints are denied in production.

### Endpoints

- `GET /api/health`
  - Health/readiness check for orchestrators.
  - Returns 200 when app is healthy, 503 when datastore is down in required mode.
- `GET /api/connect`
  - Lightweight datastore connectivity check.
  - Returns 200 when datastore is available or optional-degraded, 503 when down in required mode.
- `GET /api/products`
  - Returns published products.
- `GET /api/products?includeUnpublished=true`
  - Returns all products when request is authenticated.
- `POST /api/products`
  - Creates/updates product (authenticated).
- `GET /api/articles`
  - Returns published articles.
- `GET /api/articles?includeUnpublished=true`
  - Returns all articles when request is authenticated.
- `POST /api/articles`
  - Creates/updates article (authenticated).
- `POST /api/ai/generate`
  - Generates draft article metadata/body from a topic using configured LLM provider (authenticated).
- `POST /api/control/publication`
  - Publish/unpublish products and articles (authenticated).
  - Payload:
    ```json
    { "resourceType": "product", "slug": "item-slug", "published": false }
    ```
- `POST /api/control/run`
  - Runs end-to-end topic pipeline (generate draft -> save article -> publish) in one authenticated call.
  - Payload:
    ```json
    { "topic": "best compact espresso machines", "productSlugs": ["slug-a", "slug-b"], "publish": true }
    ```

### Retry and idempotency guidance

- Treat `requestId` as correlation ID for logs and monitoring.
- Retry only on `5xx` responses with exponential backoff.
- Avoid blind retries on `4xx` responses (fix payload/auth first).
- For create/update workflows, use deterministic slugs to keep operations idempotent.

## Operator runbook (central control)

1. Call `GET /api/health` and verify `status: ok` before running jobs.
2. Push catalog updates via `POST /api/products`.
3. Generate draft content via `POST /api/ai/generate`.
4. Save finalized drafts via `POST /api/articles`.
5. Publish or unpublish content via `POST /api/control/publication`.
6. Monitor request IDs and logs for failure recovery.
