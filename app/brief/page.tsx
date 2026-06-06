import type { Metadata } from "next";
import BriefDashboard from "@/components/brief/BriefDashboard";

export const metadata: Metadata = {
  title: "Synapse — Your Growth Brief",
  description: "Your analytics, turned into one decision.",
};

export default function Page() {
  return <BriefDashboard />;
}
