"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, Printer, Mail, MessageSquareText } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { getBookingById, type BookingRecord } from "@/src/lib/hotelBookingHistory";

export default function BookingConfirmation({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<BookingRecord | null | undefined>(undefined);

  useEffect(() => {
    setBooking(getBookingById(bookingId) ?? null);
  }, [bookingId]);

  if (booking === undefined) return null;

  if (booking === null) {
    return (
      <div className="container py-16 text-center text-sm text-neutral-500">
        Booking not found.{" "}
        <Link href="/hotel-management" className="text-sky-700 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-8" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-neutral-900">Booking Confirmed!</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Booking ID: <span className="font-semibold text-neutral-800">{booking.bookingId}</span>
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500">
            <Mail className="size-3.5" /> Confirmation sent to {booking.guest.email}
            <span className="mx-1">&middot;</span>
            <MessageSquareText className="size-3.5" /> SMS sent to {booking.guest.phone}
          </p>
        </div>

        <div id="invoice" className="mt-8 rounded-xl border border-neutral-100 bg-white p-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <p className="text-lg font-bold text-neutral-900">TripWave Invoice</p>
              <p className="text-xs text-neutral-500">{format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm")}</p>
            </div>
            <p className="text-sm font-semibold text-neutral-700">#{booking.bookingId}</p>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <img
              src={booking.hotelImage}
              alt={booking.hotelName}
              className="size-16 rounded-lg object-cover"
            />
            <div>
              <p className="font-semibold text-neutral-900">{booking.hotelName}</p>
              <p className="text-xs text-neutral-500">{booking.hotelLocation}</p>
              <p className="text-xs text-neutral-500">{booking.roomName}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-neutral-500">Check-in</p>
              <p className="font-medium text-neutral-900">
                {format(new Date(booking.checkIn), "dd/MM/yyyy")}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Check-out</p>
              <p className="font-medium text-neutral-900">
                {format(new Date(booking.checkOut), "dd/MM/yyyy")}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Nights</p>
              <p className="font-medium text-neutral-900">{booking.nights}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Guests</p>
              <p className="font-medium text-neutral-900">
                {booking.adults + booking.children}, {booking.rooms} room
                {booking.rooms !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-1.5 border-t border-neutral-100 pt-4 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>
                Room rate &times; {booking.nights} night{booking.nights !== 1 ? "s" : ""} &times;{" "}
                {booking.rooms} room{booking.rooms !== 1 ? "s" : ""}
              </span>
              <span>BDT {booking.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Service fee</span>
              <span>BDT {booking.serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Tax</span>
              <span>BDT {booking.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-bold text-neutral-900">
              <span>Total Paid</span>
              <span>BDT {booking.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
            Billed to: {booking.guest.name} &middot; {booking.guest.email} &middot;{" "}
            {booking.guest.phone}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex items-center gap-1.5"
          >
            <Printer className="size-4" /> Print Invoice
          </Button>
          <Button asChild variant="outline">
            <Link href="/hotel-management/my-bookings">View My Bookings</Link>
          </Button>
          <Button asChild className="bg-sky-700 hover:bg-sky-800">
            <Link href="/hotel-management">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
