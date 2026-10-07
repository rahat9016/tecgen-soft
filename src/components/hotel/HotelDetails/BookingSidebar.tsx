"use client";

import { useState } from "react";
import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import {
  AlertTriangle,
  CalendarX2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { roomDiscount, type RoomType } from "@/src/data/hotels";
import { Button } from "@/src/components/ui/button";
import DatePickerField from "@/src/components/hotel/shared/DatePickerField";
import GuestsRoomsField, {
  type GuestsRoomsValue,
} from "@/src/components/hotel/shared/GuestsRoomsField";

export default function BookingSidebar({
  room,
  available,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  guests,
  onGuestsChange,
  onBookNow,
  cancellationPolicy,
}: {
  room: RoomType;
  /** Free rooms of this type for the chosen dates, or null until both dates are picked. */
  available: number | null;
  checkIn: Date | null;
  checkOut: Date | null;
  onCheckInChange: (date: Date | null) => void;
  onCheckOutChange: (date: Date | null) => void;
  guests: GuestsRoomsValue;
  onGuestsChange: (value: GuestsRoomsValue) => void;
  onBookNow: () => void;
  cancellationPolicy?: string;
}) {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  const nights =
    checkIn && checkOut
      ? Math.max(1, differenceInCalendarDays(checkOut, checkIn))
      : 0;
  const subtotal = room.price * nights * guests.rooms;
  const serviceFee = subtotal ? Math.round(subtotal * 0.03) : 0;
  const tax = subtotal ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + serviceFee + tax;

  const guestsPerRoom = Math.ceil(
    (guests.adults + guests.children) / guests.rooms
  );
  const overCapacity = guestsPerRoom > room.capacity;
  const unavailable = available !== null && available < guests.rooms;
  const discount = roomDiscount(room);

  // The button always does something: it walks the guest to the next missing step.
  const action = !checkIn
    ? { label: "Select dates", onClick: () => setCheckInOpen(true) }
    : !checkOut
      ? { label: "Select check-out date", onClick: () => setCheckOutOpen(true) }
      : unavailable
        ? { label: "Change dates", onClick: () => setCheckInOpen(true) }
        : overCapacity
          ? { label: "Adjust guests or rooms", onClick: undefined }
          : {
              label: `Book now · BDT ${total.toLocaleString()}`,
              onClick: onBookNow,
            };

  return (
    <div
      id="booking"
      className="scroll-mt-36 rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-xl shadow-neutral-900/5 lg:sticky lg:top-36"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-neutral-500">
            Price per night
          </p>
          <p className="mt-0.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900">
              BDT {room.price.toLocaleString()}
            </span>
            <span className="text-sm text-neutral-400 line-through">
              BDT {room.originalPrice.toLocaleString()}
            </span>
          </p>
        </div>
        {discount > 0 && (
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">
            -{discount}%
          </span>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200">
        <div className="grid grid-cols-2 divide-x divide-neutral-200">
          <DatePickerField
            variant="inline"
            label="Check-in"
            value={checkIn}
            open={checkInOpen}
            onOpenChange={setCheckInOpen}
            onChange={(date) => {
              onCheckInChange(date);
              if (date && (!checkOut || checkOut <= date))
                onCheckOutChange(null);
              setCheckOutOpen(true);
            }}
          />
          <DatePickerField
            variant="inline"
            label="Check-out"
            value={checkOut}
            onChange={onCheckOutChange}
            disabledBefore={
              checkIn ? new Date(checkIn.getTime() + 86400000) : undefined
            }
            open={checkOutOpen}
            onOpenChange={setCheckOutOpen}
          />
        </div>
        <div className="border-t border-neutral-200">
          <GuestsRoomsField
            variant="inline"
            value={guests}
            onChange={onGuestsChange}
          />
        </div>
      </div>

      {unavailable ? (
        <div className="mt-3 flex gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
          <CalendarX2 className="size-4 shrink-0" />
          <p>
            {available === 0
              ? "This room is fully booked for these dates."
              : `Only ${available} of this room ${available === 1 ? "is" : "are"} free for these dates — you asked for ${guests.rooms}.`}{" "}
            Try different dates or{" "}
            <Link
              href="/hotel-management/rooms"
              className="font-semibold underline"
            >
              another room
            </Link>
            .
          </p>
        </div>
      ) : (
        available !== null && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="size-4" />
            {available <= 2
              ? `Only ${available} left for your dates — book soon`
              : `Available for your dates`}
          </p>
        )
      )}

      {overCapacity && (
        <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="size-4 shrink-0" />
          This room fits up to {room.capacity} guests. Add another room or
          choose a larger room.
        </p>
      )}

      {nights > 0 && !unavailable && (
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>
              BDT {room.price.toLocaleString()} &times; {nights} night
              {nights !== 1 ? "s" : ""}
              {guests.rooms > 1 && ` × ${guests.rooms} rooms`}
            </span>
            <span>BDT {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Service fee</span>
            <span>BDT {serviceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Tax</span>
            <span>BDT {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-3 text-base font-bold text-neutral-900">
            <span>Total</span>
            <span>BDT {total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <Button
        onClick={action.onClick}
        disabled={!action.onClick}
        className="mt-4 h-12 w-full rounded-xl bg-sky-600 text-base font-semibold shadow-lg shadow-sky-600/25 hover:bg-sky-700"
      >
        {action.label}
      </Button>

      {cancellationPolicy && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-emerald-700">
          <ShieldCheck className="size-4 shrink-0" />
          {cancellationPolicy}
        </p>
      )}
    </div>
  );
}
