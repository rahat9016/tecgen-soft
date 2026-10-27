import { Suspense } from "react";
import BookingDetail from "@/src/components/turf/admin/BookingDetail";

export default async function TurfBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <BookingDetail id={id} />
    </Suspense>
  );
}
