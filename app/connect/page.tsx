import { redirect } from "next/navigation";

// The session-based /dashboard is the real connect surface now (Shopify/Google via
// OAuth, no manual IDs). The old /connect dev UI is retired — send anyone who lands
// here straight to the app so they never hit the confusing founder_id input.
export default function Page() {
  redirect("/dashboard");
}
