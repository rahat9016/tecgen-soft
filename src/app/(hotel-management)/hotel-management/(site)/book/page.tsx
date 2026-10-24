import GuestInfoForm from "@/src/components/hotel/Booking/GuestInfoForm";
import BookingSteps from "@/src/components/hotel/Booking/BookingSteps";

export default function HotelBookingPage() {
  return (
    // scroll-mt clears the sticky header when navigation scrolls this page into view.
    <div className="container scroll-mt-20 py-4 md:py-8">
      {/* Phones go straight to the form: no stepper, and the heading is kept for screen readers only. */}
      <div className="hidden md:block">
        <BookingSteps current={1} />
      </div>

      <h1 className="sr-only text-2xl font-bold text-neutral-900 md:not-sr-only md:mt-6 md:block md:text-3xl">
        Complete your booking
      </h1>

      <div className="md:mt-6">
        <GuestInfoForm />
      </div>
    </div>
  );
}
