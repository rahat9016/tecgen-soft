import { Suspense } from "react";
import NewBooking from "@/src/components/hotel/admin/NewBooking";

export default function HotelAdminNewBookingPage() {
  return (
    <Suspense>
      <NewBooking />
    </Suspense>
  );
}
