import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TurfHub — Book Our Football Turf in Bashundhara, Dhaka",
  description:
    "Check live availability of our 7-a-side football turf, pick your slot and lock it with an advance payment.",
};

export default function TurfRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
