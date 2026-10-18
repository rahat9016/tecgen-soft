import { Suspense } from "react";
import BookingDetail from "@/src/components/hotel/admin/BookingDetail";

export default async function HotelAdminBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <BookingDetail id={id} />
    </Suspense>
  );
}
