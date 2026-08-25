import GuestInfoForm from "@/src/components/hotel/Booking/GuestInfoForm";

export default function HotelBookingPage() {
  return (
    <div className="container py-8">
      <h1 className="text-xl font-bold text-neutral-900">Complete Your Booking</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Fill in your details to confirm the reservation.
      </p>
      <div className="mt-6">
        <GuestInfoForm />
      </div>
    </div>
  );
}
