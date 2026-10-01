import { Suspense } from "react";
import SlotBooking from "@/src/components/turf/SlotBooking";
import { Loader } from "@/src/components/turf/ui";

export const metadata = { title: "Live Slots | TurfHub" };

export default function TurfBookPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SlotBooking />
    </Suspense>
  );
}
