import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TurfHub — Book Football, Cricket & Badminton Turfs in Dhaka",
  description:
    "Check live turf availability, pick your slot and lock it with an advance payment. Football, box cricket, badminton, tennis and basketball courts.",
};

export default function TurfRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
