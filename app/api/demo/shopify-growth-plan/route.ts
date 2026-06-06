import { generateBrief } from "@/lib/brief/generate";
import { SYNTHETIC_SHOPIFY_PULL } from "@/lib/demo/shopify-synthetic";
import type { GrowthBrief } from "@/lib/brief/schema";
import type { DerivedMetrics, TrafficMetrics, WeeklyData } from "@/lib/metrics/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function syntheticWeeklyData(): WeeklyData {
  const data = SYNTHETIC_SHOPIFY_PULL;
  const commerce: DerivedMetrics = {
    windowLabel: data.windows.current.label,
    businessContext: `${data.shop.name} - ${data.shop.category} on Shopify. ${data.shop.tagline}`,
    headline: [
      {
        label: "Revenue",
        current: data.summary.revenue.current,
        previous: data.summary.revenue.previous,
        format: "currency",
        currency: "GBP ",
      },
      {
        label: "Orders",
        current: data.summary.orders.current,
        previous: data.summary.orders.previous,
        format: "number",
      },
      {
        label: "Conversion",
        current: data.summary.conversion_rate.current,
        previous: data.summary.conversion_rate.previous,
        format: "percent",
      },
      {
        label: "New customers",
        current: data.summary.new_customers.current,
        previous: data.summary.new_customers.previous,
        format: "number",
      },
    ],
    channels: data.channels.map((channel) => ({
      name: channel.name,
      newCustomerShare: channel.new_customer_share,
      previousShare: channel.previous_new_customer_share,
      note: channel.note,
    })),
    adSpend: data.channels
      .filter((channel) => "ad_spend" in channel && channel.ad_spend !== undefined)
      .map((channel) => ({
        channel: channel.name,
        spend: channel.ad_spend ?? 0,
        currency: "GBP ",
        conversions: channel.orders,
        roas: channel.roas,
      })),
    products: {
      topByRevenue: data.products
        .slice()
        .sort((a, b) => b.revenue - a.revenue)
        .map((product) => ({
          productId: product.id,
          title: product.title,
          unitsSold: product.units_sold,
          previousUnits: product.previous_units_sold,
          revenue: product.revenue,
          previousRevenue: product.previous_revenue,
          inventory: product.inventory,
          weeksOfStockLeft: product.weeks_of_stock_left,
        })),
      lowStock: data.products
        .filter((product) => product.weeks_of_stock_left !== null && product.weeks_of_stock_left < 2)
        .map((product) => ({
          productId: product.id,
          title: product.title,
          unitsSold: product.units_sold,
          previousUnits: product.previous_units_sold,
          revenue: product.revenue,
          previousRevenue: product.previous_revenue,
          inventory: product.inventory,
          weeksOfStockLeft: product.weeks_of_stock_left,
        })),
      noSales: data.products
        .filter((product) => product.units_sold === 0)
        .map((product) => ({ productId: product.id, title: product.title })),
    },
    notes: [
      "Synthetic Shopify dataset for the demo video; shaped like a real pull from orders, products, inventory, and analytics.",
      "TikTok organic is the main new-customer growth driver this week.",
      "GlowPatch Acne Dots are the breakout product and are at immediate stockout risk.",
      "Meta ads are unprofitable this week.",
    ],
  };

  const traffic: TrafficMetrics = {
    source: "shopify",
    sessions: data.summary.sessions.current,
    previousSessions: data.summary.sessions.previous,
    users: 9480,
    newUsers: 6210,
    conversionRate: data.summary.conversion_rate.current,
    sourceMix: data.channels.map((channel) => ({
      name: channel.name,
      share: channel.new_customer_share,
    })),
    topPages: [
      { path: "/products/glowpatch-acne-dots", views: 3840 },
      { path: "/collections/best-sellers", views: 2210 },
      { path: "/products/cloud-cleanser", views: 1760 },
      { path: "/products/weekend-reset-kit", views: 520 },
    ],
    notes: ["Sessions and conversion are synthetic Shopify-style analytics for the demo."],
  };

  return {
    windowLabel: data.windows.current.label,
    businessContext: commerce.businessContext,
    commerce,
    traffic: [traffic],
    sources: ["shopify", "shopifyql", "synthetic-demo"],
  };
}

export async function GET(): Promise<Response> {
  const fallback = SYNTHETIC_SHOPIFY_PULL.synthetic_growth_brief as GrowthBrief;

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({
      brief: fallback,
      live: false,
      reason: "no_api_key",
      data: SYNTHETIC_SHOPIFY_PULL,
    });
  }

  try {
    const { brief, usage } = await generateBrief({
      data: syntheticWeeklyData(),
      recalledMemories: [
        "Last week Synapse recommended keeping Instagram product demos live and tracking stock velocity.",
        "The founder wants a practical growth plan for the next 7 days, not a report full of charts.",
      ],
    });
    return Response.json({
      brief,
      live: true,
      usage,
      data: SYNTHETIC_SHOPIFY_PULL,
    });
  } catch (err) {
    console.error("[demo/shopify-growth-plan] generation failed:", err);
    return Response.json({
      brief: fallback,
      live: false,
      reason: "error",
      data: SYNTHETIC_SHOPIFY_PULL,
    });
  }
}
