import { Suspense } from "react";
import BookingsList from "@/src/components/hotel/admin/BookingsList";

export default function HotelAdminBookingsPage() {
  return (
    <Suspense>
      <BookingsList />
    </Suspense>
  );
}
