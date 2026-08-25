"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarX, MapPin } from "lucide-react";
import { getBookingHistory, type BookingRecord } from "@/src/lib/hotelBookingHistory";

export default function MyBookings() {
  const [bookings, setBookings] = useState<BookingRecord[] | null>(null);

  useEffect(() => {
    setBookings(getBookingHistory());
  }, []);

  if (bookings === null) return null;

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-neutral-500">
        <CalendarX className="size-10" />
        <p className="font-medium">No bookings yet</p>
        <Link href="/hotel-management" className="text-sm text-sky-700 hover:underline">
          Browse hotels
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.bookingId}
          className="flex flex-col gap-4 rounded-xl border border-neutral-100 bg-white p-4 sm:flex-row sm:items-center"
        >
          <img
            src={booking.hotelImage}
            alt={booking.hotelName}
            className="h-32 w-full rounded-lg object-cover sm:h-20 sm:w-28 sm:shrink-0"
          />

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-neutral-900">{booking.hotelName}</p>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                Confirmed
              </span>
            </div>
            <p className="flex items-center gap-1 text-xs text-neutral-500">
              <MapPin className="size-3.5" /> {booking.hotelLocation} &middot; {booking.roomName}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {format(new Date(booking.checkIn), "dd/MM/yyyy")} –{" "}
              {format(new Date(booking.checkOut), "dd/MM/yyyy")} &middot; {booking.nights} night
              {booking.nights !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-col items-start gap-1 sm:items-end">
            <p className="text-sm font-bold text-neutral-900">
              BDT {booking.total.toLocaleString()}
            </p>
            <Link
              href={`/hotel-management/booking-success?bookingId=${booking.bookingId}`}
              className="text-xs font-medium text-sky-700 hover:underline"
            >
              View Invoice
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
