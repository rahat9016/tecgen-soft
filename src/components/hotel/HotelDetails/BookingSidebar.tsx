"use client";

import { useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import type { RoomType } from "@/src/data/hotels";
import { Button } from "@/src/components/ui/button";
import DatePickerField from "@/src/components/hotel/shared/DatePickerField";
import GuestsRoomsField, {
  type GuestsRoomsValue,
} from "@/src/components/hotel/shared/GuestsRoomsField";

export default function BookingSidebar({
  selectedRoom,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  guests,
  onGuestsChange,
  onBookNow,
}: {
  selectedRoom: RoomType | null;
  checkIn: Date | null;
  checkOut: Date | null;
  onCheckInChange: (date: Date | null) => void;
  onCheckOutChange: (date: Date | null) => void;
  guests: GuestsRoomsValue;
  onGuestsChange: (value: GuestsRoomsValue) => void;
  onBookNow: () => void;
}) {
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  const nights =
    checkIn && checkOut ? Math.max(1, differenceInCalendarDays(checkOut, checkIn)) : 0;
  const subtotal = selectedRoom ? selectedRoom.price * nights * guests.rooms : 0;
  const serviceFee = subtotal ? Math.round(subtotal * 0.03) : 0;
  const tax = subtotal ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + serviceFee + tax;

  const canBook = Boolean(selectedRoom && checkIn && checkOut && nights > 0);

  return (
    <div className="sticky top-20 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-neutral-900">Book Your Stay</h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <DatePickerField
          label="Check-in"
          value={checkIn}
          onChange={(date) => {
            onCheckInChange(date);
            if (date && (!checkOut || checkOut <= date)) onCheckOutChange(null);
            setCheckOutOpen(true);
          }}
        />
        <DatePickerField
          label="Check-out"
          value={checkOut}
          onChange={onCheckOutChange}
          disabledBefore={checkIn ? new Date(checkIn.getTime() + 86400000) : undefined}
          open={checkOutOpen}
          onOpenChange={setCheckOutOpen}
        />
      </div>

      <div className="mt-3">
        <GuestsRoomsField value={guests} onChange={onGuestsChange} />
      </div>

      <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-sm">
        {selectedRoom ? (
          <>
            <p className="font-medium text-neutral-900">{selectedRoom.name}</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              BDT {selectedRoom.price.toLocaleString()} / night &times; {nights || 0} night
              {nights !== 1 ? "s" : ""} &times; {guests.rooms} room{guests.rooms !== 1 ? "s" : ""}
            </p>
          </>
        ) : (
          <p className="text-xs text-neutral-500">Select a room below to see pricing.</p>
        )}
      </div>

      {selectedRoom && nights > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-neutral-100 pt-3 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
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
          <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-bold text-neutral-900">
            <span>Total</span>
            <span>BDT {total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <Button
        onClick={onBookNow}
        disabled={!canBook}
        className="mt-4 w-full bg-sky-700 hover:bg-sky-800"
      >
        {canBook ? "Book Now" : "Select room & dates"}
      </Button>
    </div>
  );
}
