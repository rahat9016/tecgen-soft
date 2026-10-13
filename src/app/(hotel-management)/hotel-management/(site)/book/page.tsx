import GuestInfoForm from "@/src/components/hotel/Booking/GuestInfoForm";
import BookingSteps from "@/src/components/hotel/Booking/BookingSteps";

export default function HotelBookingPage() {
  return (
    <div className="container py-8">
      <BookingSteps current={1} />

      <h1 className="mt-6 text-2xl font-bold text-neutral-900 md:text-3xl">Complete your booking</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Just a few details and your room is reserved. Guests from Bangladesh and abroad are welcome.
      </p>

      <div className="mt-6">
        <GuestInfoForm />
      </div>
    </div>
  );
}
