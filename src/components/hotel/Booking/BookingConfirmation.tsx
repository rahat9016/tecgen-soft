"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Globe2,
  IdCard,
  Mail,
  MessageSquareText,
  Plane,
  Printer,
  Smartphone,
  StickyNote,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { getBookingById, type BookingRecord } from "@/src/lib/hotelBookingHistory";
import { hotel } from "@/src/data/hotels";
import { parseCheckTimes } from "@/src/components/hotel/HotelDetails/PoliciesSection";
import BookingSteps from "./BookingSteps";

const paymentLabels = {
  hotel: { label: "Pay at hotel", detail: "Cash or card on arrival", icon: Building2 },
  card: { label: "Card", detail: "Visa / Mastercard", icon: CreditCard },
  wallet: { label: "Mobile wallet", detail: "bKash / Nagad / Rocket", icon: Smartphone },
} as const;

// Show only the last 4 characters of an ID on screen and on the printed invoice.
const maskId = (id: string) => (id.length > 4 ? `•••• ${id.slice(-4)}` : id);

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

  const times = parseCheckTimes(hotel.policies);
  const payment = booking.paymentMethod ? paymentLabels[booking.paymentMethod] : null;
  const { guest } = booking;
  const guestDetails = [
    guest.country && { icon: Globe2, label: "Country", value: guest.country },
    guest.idNumber && {
      icon: IdCard,
      label: guest.idType === "nid" ? "NID" : "Passport",
      value: maskId(guest.idNumber.toUpperCase()),
    },
    guest.arrivalTime && { icon: Clock3, label: "Arrival", value: guest.arrivalTime },
    guest.airportPickup && { icon: Plane, label: "Airport pickup", value: "Requested — we'll confirm the price" },
    guest.note && { icon: StickyNote, label: "Requests", value: guest.note },
  ].filter(Boolean) as { icon: typeof Globe2; label: string; value: string }[];

  return (
    <div className="container py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex justify-center print:hidden">
          <BookingSteps current={3} />
        </div>

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
                {format(new Date(booking.checkIn), "EEE, dd MMM yyyy")}
              </p>
              {times && <p className="text-xs text-neutral-500">From {times.checkIn}</p>}
            </div>
            <div>
              <p className="text-xs text-neutral-500">Check-out</p>
              <p className="font-medium text-neutral-900">
                {format(new Date(booking.checkOut), "EEE, dd MMM yyyy")}
              </p>
              {times && <p className="text-xs text-neutral-500">Until {times.checkOut}</p>}
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
              <span>VAT</span>
              <span>BDT {booking.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-bold text-neutral-900">
              <span>{booking.paymentMethod === "hotel" ? "Total due at hotel" : "Total"}</span>
              <span>BDT {booking.total.toLocaleString()}</span>
            </div>
          </div>

          {payment && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-neutral-50 p-3 text-sm">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm">
                <payment.icon className="size-4" />
              </span>
              <div>
                <p className="font-semibold text-neutral-900">{payment.label}</p>
                <p className="text-xs text-neutral-500">{payment.detail} &middot; charged in BDT</p>
              </div>
            </div>
          )}

          {guestDetails.length > 0 && (
            <dl className="mt-4 grid gap-3 border-t border-neutral-100 pt-4 text-sm sm:grid-cols-2">
              {guestDetails.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="mt-0.5 size-4 shrink-0 text-sky-600" />
                  <div className="min-w-0">
                    <dt className="text-xs text-neutral-500">{label}</dt>
                    <dd className="break-words font-medium text-neutral-900">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
            Billed to: {guest.name} &middot; {guest.email} &middot; {guest.phone}
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
