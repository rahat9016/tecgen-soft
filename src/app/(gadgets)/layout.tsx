import type { Metadata } from "next";
import GadgetHeader from "@/src/components/gadgets/GadgetHeader";
import GadgetFooter from "@/src/components/gadgets/GadgetFooter";
import { GadgetCartProvider } from "@/src/components/gadgets/GadgetCart";

export const metadata: Metadata = {
  title: "gadgethub — Smartphones, Gadgets & Accessories in Bangladesh",
  description:
    "Shop original iPhone, Samsung, AirPods, smart watches, power banks, gaming consoles and drones with 0% EMI and fast delivery across Bangladesh.",
};

export default function GadgetStoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <GadgetCartProvider>
      <div className="min-h-screen bg-white">
        <GadgetHeader />
        {children}
        <GadgetFooter />
      </div>
    </GadgetCartProvider>
  );
}
