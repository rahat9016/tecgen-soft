import { Suspense } from "react";
import MyBookings from "@/src/components/turf/MyBookings";
import { Loader } from "@/src/components/turf/ui";

export const metadata = { title: "My Bookings | TurfHub" };

export default function TurfMyBookingsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <MyBookings />
    </Suspense>
  );
}
