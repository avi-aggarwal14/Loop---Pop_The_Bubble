import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  buildAuthorizeUrl,
  isValidShopDomain,
  missingRequiredScopes,
  verifyCallbackHmac,
  shopifyConfigFromEnv,
} from "../lib/shopify/oauth";

const SECRET = "shpss_testsecret";
const CONFIG = {
  apiKey: "test_key",
  apiSecret: SECRET,
  scopes: "read_orders,read_customers",
  appUrl: "https://synapse.example.com",
};

test("isValidShopDomain accepts only *.myshopify.com", () => {
  assert.ok(isValidShopDomain("acme.myshopify.com"));
  assert.ok(!isValidShopDomain("acme.com"));
  assert.ok(!isValidShopDomain("evil.myshopify.com.attacker.com"));
  assert.ok(!isValidShopDomain("javascript:alert(1)"));
});

test("buildAuthorizeUrl includes the required OAuth params", () => {
  const url = new URL(
    buildAuthorizeUrl({ shop: "acme.myshopify.com", config: CONFIG, state: "s123" }),
  );
  assert.equal(url.host, "acme.myshopify.com");
  assert.equal(url.pathname, "/admin/oauth/authorize");
  assert.equal(url.searchParams.get("client_id"), "test_key");
  assert.equal(url.searchParams.get("scope"), "read_orders,read_customers");
  assert.equal(url.searchParams.get("state"), "s123");
  assert.equal(
    url.searchParams.get("redirect_uri"),
    "https://synapse.example.com/api/auth/shopify/callback",
  );
});

test("buildAuthorizeUrl rejects a bad shop domain", () => {
  assert.throws(() =>
    buildAuthorizeUrl({ shop: "evil.com", config: CONFIG, state: "x" }),
  );
});

test("shopifyConfigFromEnv prefers APP_URL and includes analytics scope by default", () => {
  const config = shopifyConfigFromEnv({
    SHOPIFY_API_KEY: "key",
    SHOPIFY_API_SECRET: "secret",
    APP_URL: "https://app.synapse.test",
    SHOPIFY_APP_URL: "https://old.synapse.test",
  });

  assert.equal(config?.appUrl, "https://app.synapse.test");
  assert.match(config?.scopes ?? "", /read_reports/);
});

test("missingRequiredScopes catches partial Shopify installs", () => {
  assert.deepEqual(
    missingRequiredScopes(
      "read_orders,read_customers,read_products,read_reports",
      "read_orders, read_products",
    ),
    ["read_customers", "read_reports"],
  );
  assert.deepEqual(
    missingRequiredScopes("read_orders,read_products", "read_products,read_orders"),
    [],
  );
});

test("verifyCallbackHmac accepts a correct signature and rejects tampering", () => {
  const params: Record<string, string> = {
    code: "abc",
    shop: "acme.myshopify.com",
    state: "uuid:nonce",
    timestamp: "1700000000",
  };
  const message = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const hmac = createHmac("sha256", SECRET).update(message).digest("hex");

  assert.ok(verifyCallbackHmac({ ...params, hmac }, SECRET));
  // Tamper with a value → must fail.
  assert.ok(!verifyCallbackHmac({ ...params, shop: "evil.myshopify.com", hmac }, SECRET));
  // Wrong secret → must fail.
  assert.ok(!verifyCallbackHmac({ ...params, hmac }, "wrong_secret"));
});
