"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { BedDouble, CalendarX, LogIn, MapPin, Moon, Star, Users, XCircle } from "lucide-react";
import { bdt, dateLabel, statusLabels, statusStyles } from "@/src/lib/hotel-store/format";
import {
  cancelOwnBooking,
  cancellationTerms,
  dueOf,
  folioTotal,
  guestBookings,
  paymentStatus,
  siteHotel,
  submitReview,
  unitNumbers,
  useCurrentGuest,
  useHotelDB,
  useHydrated,
  useSession,
} from "@/src/lib/hotel-store/store";
import type { Booking } from "@/src/lib/hotel-store/types";

function ReviewForm({ booking, onDone }: { booking: Booking; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const result = submitReview(booking.id, rating, comment);
        if (!result.ok) return toast.error(result.error);
        toast.success("Thanks! Your review will appear once the hotel approves it.");
        onDone();
      }}
      className="mt-4 rounded-md bg-sky-50/60 p-4"
    >
      <p className="text-sm font-semibold text-neutral-900">How was your stay in the {booking.roomName}?</p>
      <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
          >
            <Star className={`size-7 transition ${n <= (hover || rating) ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"}`} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="What did you love? What could be better?"
        className="mt-3 w-full rounded-md border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-white">
          Not now
        </button>
        <button type="submit" className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
          Submit review
        </button>
      </div>
    </form>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const db = useHotelDB();
  const hotel = siteHotel(db);
  const [reviewing, setReviewing] = useState(false);
  const image = db.roomTypes.find((t) => t.id === booking.roomTypeId)?.images[0] ?? hotel.images[0];
  const pay = paymentStatus(booking);
  const due = dueOf(booking);
  const canCancel = booking.status === "pending" || booking.status === "confirmed";
  const terms = cancellationTerms(db, booking);
  const review = db.reviews.find((r) => r.bookingId === booking.id);
  const rooms = booking.status === "checked-in" ? unitNumbers(db, booking.unitIds) : [];

  const cancel = () => {
    const message = terms.free
      ? `Cancel ${booking.code}? It's free — ${bdt(terms.refund)} will be refunded to your original payment method.`
      : `Free cancellation has ended. Cancel ${booking.code} anyway? The hotel keeps ${bdt(terms.fee)}${terms.refund ? ` and refunds ${bdt(terms.refund)}` : ""}.`;
    if (!confirm(message)) return;
    const result = cancelOwnBooking(booking.id);
    if (!result.ok) return toast.error(result.error);
    toast.success(terms.refund ? `Cancelled — refund of ${bdt(terms.refund)} is on its way.` : "Booking cancelled.");
  };

  return (
    <article className="rounded-md border border-neutral-200/80 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* eslint-disable-next-line @next/next/no-img-element -- images are unoptimized app-wide */}
        <img src={image} alt={booking.roomName} className="h-36 w-full rounded-md object-cover sm:h-auto sm:w-40 sm:shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-neutral-500">{booking.code}</span>
            <span className={`rounded-md px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[booking.status]}`}>{statusLabels[booking.status]}</span>
            <span className={`rounded-md px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${pay.tone}`}>{pay.label}</span>
          </div>
          <h3 className="mt-1.5 text-lg font-bold text-neutral-900">{booking.roomName}</h3>
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <MapPin className="size-3.5" /> {hotel.name} &middot; {hotel.location}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
            <span className="flex items-center gap-1.5">
              <Moon className="size-4 text-neutral-400" />
              {dateLabel(booking.checkIn)} – {dateLabel(booking.checkOut, "EEE, dd MMM yyyy")} · {booking.nights} night{booking.nights !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-neutral-400" />
              {booking.adults + booking.children} guest{booking.adults + booking.children !== 1 ? "s" : ""} · {booking.rooms} room{booking.rooms !== 1 ? "s" : ""}
            </span>
            {rooms.length > 0 && (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <BedDouble className="size-4" /> Room {rooms.join(", ")}
              </span>
            )}
          </div>
          {canCancel && (
            <p className={`mt-2 text-xs ${terms.free ? "text-emerald-700" : "text-amber-700"}`}>
              {terms.free ? `Free cancellation until ${format(new Date(terms.freeUntil), "dd MMM, h:mm a")}` : "Free cancellation period has ended"}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-row items-end justify-between gap-2 sm:flex-col sm:items-end">
          <div className="text-right">
            <p className="text-lg font-bold text-neutral-900">{bdt(folioTotal(booking))}</p>
            {due > 0 && <p className="text-xs font-medium text-sky-700">{bdt(due)} due{booking.status === "checked-in" ? "" : " at check-in"}</p>}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              href={`/hotel-management/booking-success?bookingId=${booking.code}`}
              className="rounded-md border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:border-sky-200 hover:text-sky-700"
            >
              Details &amp; invoice
            </Link>
            {canCancel && (
              <button onClick={cancel} className="flex items-center gap-1 rounded-md border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                <XCircle className="size-3.5" /> Cancel
              </button>
            )}
            {booking.status === "checked-out" && !review && !reviewing && (
              <button onClick={() => setReviewing(true)} className="flex items-center gap-1 rounded-md bg-amber-400 px-3 py-2 text-xs font-semibold text-amber-950 hover:bg-amber-300">
                <Star className="size-3.5" /> Write a review
              </button>
            )}
          </div>
        </div>
      </div>
      {review && (
        <p className="mt-3 rounded-md bg-neutral-50 px-4 py-2.5 text-xs text-neutral-600">
          You rated this stay {review.rating}★ —{" "}
          {review.status === "published" ? "your review is live." : review.status === "pending" ? "waiting for the hotel to approve it." : "the hotel kept it private."}
        </p>
      )}
      {reviewing && <ReviewForm booking={booking} onDone={() => setReviewing(false)} />}
    </article>
  );
}

export default function MyBookings() {
  const db = useHotelDB();
  const ses = useSession();
  const user = useCurrentGuest();
  const hydrated = useHydrated();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  if (!hydrated) return null;

  const bookings = guestBookings(db, ses, user);
  const upcoming = bookings.filter((b) => b.status === "pending" || b.status === "confirmed" || b.status === "checked-in").reverse();
  const past = bookings.filter((b) => !upcoming.includes(b));
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-5">
      {!user && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-sky-50 p-4 text-sm text-sky-900">
          <p>
            <span className="font-semibold">Showing bookings made on this device.</span> Log in to see every booking made with your email —
            and get updates when the hotel confirms or checks you in.
          </p>
          <Link href="/hotel-management/login?next=/hotel-management/my-bookings" className="flex items-center gap-1.5 rounded-md bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700">
            <LogIn className="size-4" /> Log in
          </Link>
        </div>
      )}

      <div className="inline-flex rounded-md bg-neutral-100 p-1 text-sm font-medium">
        {(
          [
            ["upcoming", `Upcoming (${upcoming.length})`],
            ["past", `Past & cancelled (${past.length})`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`rounded-md px-4 py-1.5 transition ${tab === value ? "bg-white font-semibold text-sky-700 shadow-sm" : "text-neutral-600 hover:text-neutral-900"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-neutral-200 py-16 text-center text-neutral-500">
          <CalendarX className="size-10" />
          <p className="font-medium">{tab === "upcoming" ? "No upcoming stays" : "No past bookings yet"}</p>
          <Link href="/hotel-management/rooms" className="text-sm font-semibold text-sky-700 hover:underline">
            Browse rooms
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
}
