import MyBookings from "@/src/components/hotel/Booking/MyBookings";

export default function MyBookingsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-xl font-bold text-neutral-900">My Bookings</h1>
      <p className="mt-1 text-sm text-neutral-500">Track and manage your hotel reservations.</p>
      <div className="mt-6">
        <MyBookings />
      </div>
    </div>
  );
}
