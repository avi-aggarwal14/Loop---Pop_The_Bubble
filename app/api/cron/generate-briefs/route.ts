import { buildServiceDeps } from "../../../../lib/http/deps.js";
import { handleCronGenerate } from "../../../../lib/http/handlers.js";
import { bearerToken, toResponse } from "../../../../lib/http/respond.js";

// Uses node crypto + SDKs; must run on the Node runtime, never cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Weekly job: generate a Growth Brief for every active Shopify connection.
 * Protect with `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this).
 */
async function run(req: Request): Promise<Response> {
  const token = bearerToken(req.headers.get("authorization"));
  const result = await handleCronGenerate(buildServiceDeps(), token);
  return toResponse(result);
}

export const GET = run;
export const POST = run;
