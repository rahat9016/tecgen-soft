import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TripWave Hotel — Beachfront Rooms & Suites in Cox's Bazar",
  description:
    "Book sea-view rooms and suites at TripWave Hotel on Marine Drive, Cox's Bazar. Live availability, secure bKash, Nagad, Rocket and card payments.",
};

export default function HotelRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
