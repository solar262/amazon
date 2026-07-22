type ShopifyConnectionResult =
  | { ok: true; shopName: string; domain: string }
  | { ok: false; error: string };

function getRequiredEnv(name: "SHOPIFY_STORE_DOMAIN" | "SHOPIFY_ADMIN_API_ACCESS_TOKEN") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export async function checkShopifyConnection(): Promise<ShopifyConnectionResult> {
  try {
    const storeDomain = getRequiredEnv("SHOPIFY_STORE_DOMAIN");
    const accessToken = getRequiredEnv("SHOPIFY_ADMIN_API_ACCESS_TOKEN");
    const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-10";

    const response = await fetch(`https://${storeDomain}/admin/api/${apiVersion}/graphql.json`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-shopify-access-token": accessToken
      },
      body: JSON.stringify({
        query: "query { shop { name myshopifyDomain } }"
      })
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: `Shopify request failed (${response.status}): ${body.slice(0, 300)}` };
    }

    const payload = await response.json();
    if (payload?.errors?.length) {
      return { ok: false, error: `Shopify GraphQL errors: ${JSON.stringify(payload.errors).slice(0, 300)}` };
    }

    const shop = payload?.data?.shop;
    if (!shop?.name || !shop?.myshopifyDomain) {
      return { ok: false, error: "Shopify response missing shop identity fields." };
    }

    return { ok: true, shopName: shop.name, domain: shop.myshopifyDomain };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, error: message };
  }
}
