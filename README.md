# Synapse

AI growth partner for founders. Users connect first-party analytics sources
(Shopify first, then GA4/Vercel/Stripe) and Synapse turns the data into a weekly
Growth Brief with one prioritized action. Claude writes the brief; mubit stores
lessons/outcomes so advice compounds.

## Shopify multi-merchant setup

Synapse should be configured as one Shopify app that many merchants can install.
Do not build production around a single admin-created store token.

The official Shopify CLI is installed locally in this repo. Use `npm run
shopify:*` commands so everyone works from the same CLI version.

1. Create/configure a Shopify app in the Shopify Partner/Dev Dashboard.
2. Set the app URL to `APP_URL`.
3. Add redirect URL `<APP_URL>/api/auth/shopify/callback`.
4. Request scopes:
   `read_orders,read_customers,read_products,read_reports`.
5. Add an `app/uninstalled` webhook pointing at:
   `<APP_URL>/api/webhooks/shopify/app-uninstalled`.
6. Add mandatory compliance webhooks before public app review:
   `customers/data_request` -> `<APP_URL>/api/webhooks/shopify/customers-data-request`;
   `customers/redact` -> `<APP_URL>/api/webhooks/shopify/customers-redact`;
   `shop/redact` -> `<APP_URL>/api/webhooks/shopify/shop-redact`.
7. Put the app credentials in `.env`:
   `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_SCOPES`, `APP_URL`.
8. In production, users must be logged in through Supabase Auth before visiting
   `/connect`; the connector start routes use the server session as the
   `founder_id`.

Local smoke tests may set `ALLOW_QUERY_FOUNDER_ID=true` and pass
`?founder_id=<uuid>` while the auth UI is still being wired. Keep that disabled
in production.

## Shopify CLI commands

```bash
npm run shopify:version          # verify local CLI
npm run shopify:config:link      # link this repo to the Shopify app
npm run shopify:config:pull      # pull dashboard config into shopify.app.toml
npm run shopify:config:validate  # validate Shopify app config
npm run shopify:dev              # run Shopify dev preview + this Next app
npm run shopify:deploy           # deploy app config/extensions to Shopify
npm run shopify:info             # show linked app/dev-store info
```

`shopify.web.toml` points Shopify CLI at this existing Next app. Use
`shopify.app.example.toml` as the template if you need to create
`shopify.app.toml` by hand; otherwise prefer `npm run shopify:config:link`.

See `CLAUDE.md` for full architecture and `ROADMAP.md` for the current plan.

## Demo video data

For a fast demo video without waiting on a real Shopify store, use:

```text
/api/demo/shopify-pull
demo/shopify-demo-video-brief.md
```

That endpoint returns synthetic Shopify-like orders, products, inventory,
traffic/channel summaries, and a ready Growth Brief story. It is fictional demo
data, not merchant data.
