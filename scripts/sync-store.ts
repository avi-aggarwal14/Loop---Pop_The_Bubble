import "dotenv/config";
import { backfillStoreHistory } from "../lib/advise/backfill";
import { recallForStore } from "../lib/advise/recall";

/**
 * One-shot: load a real store's recent history into mubit so the Ask recalls real
 * patterns. No OAuth / Supabase needed — just a store Admin token + the mubit key.
 *
 *   .env:  SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
 *          SHOPIFY_ACCESS_TOKEN=shpat_...
 *          MUBIT_API_KEY=mbt_...
 *          ASK_FOUNDER_ID=acme            (optional; defaults from the shop)
 *          BACKFILL_WEEKS=16              (optional)
 *   run:   npm run sync:store
 *
 * After it finishes, /api/advice answers about THIS store with real memory.
 */
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

async function main(): Promise<void> {
  const shop = required("SHOPIFY_SHOP_DOMAIN");
  const accessToken = required("SHOPIFY_ACCESS_TOKEN");
  required("MUBIT_API_KEY");
  const founderId = process.env.ASK_FOUNDER_ID ?? process.env.SHOPIFY_FOUNDER_ID ?? `store-${shop.replace(/[^a-z0-9]/gi, "-")}`;
  const weeks = Number(process.env.BACKFILL_WEEKS ?? 16);

  console.log(`Syncing ${weeks} weeks of ${shop} → mubit (founder: ${founderId})`);
  const res = await backfillStoreHistory({
    shop,
    accessToken,
    founderId,
    weeks,
    onProgress: (done, total, label) => console.log(`  ${done}/${total}  ${label}`),
  });
  console.log(`\nDone — ${res.weeksIngested} weeks remembered for ${res.businessContext}.`);

  // Smoke-test recall so you can see memory is live.
  process.env.ASK_FOUNDER_ID = founderId;
  const recalled = await recallForStore("how is the business trending and what should I watch?");
  console.log(`\nRecall smoke test → ${recalled?.length ?? 0} memories:`);
  for (const m of recalled ?? []) console.log(`  • ${m}`);
}

main().catch((err) => {
  console.error(`\nFailed: ${(err as Error).message}`);
  process.exit(1);
});
