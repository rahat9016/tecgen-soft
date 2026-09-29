import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "gadgethub — Smartphones, Gadgets & Accessories in Bangladesh",
  description:
    "Shop original iPhone, Samsung, AirPods, smart watches, power banks, gaming consoles and drones with 0% EMI and fast delivery across Bangladesh.",
  icons: { icon: "/gadgets/logo-mark.png" },
};

export default function GadgetsRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
