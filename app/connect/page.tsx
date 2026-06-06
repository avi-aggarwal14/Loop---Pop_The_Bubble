import type { Metadata } from "next";
import ConnectSources from "@/components/connect/ConnectSources";

export const metadata: Metadata = {
  title: "Synapse — Connect Sources",
  description: "Connect Shopify, Google Analytics, Vercel, and website context to Synapse.",
};

export default function Page() {
  return <ConnectSources />;
}
