import BookingConfirmation from "@/src/components/hotel/Booking/BookingConfirmation";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;

  if (!bookingId) {
    return (
      <div className="container py-16 text-center text-sm text-neutral-500">
        Missing booking reference.
      </div>
    );
  }

  return <BookingConfirmation bookingId={bookingId} />;
}
