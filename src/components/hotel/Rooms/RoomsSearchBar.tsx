"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseDayKey, toDayKey } from "@/src/lib/hotelDates";
import DateRangeField from "@/src/components/hotel/shared/DateRangeField";
import GuestsRoomsField, { type GuestsRoomsValue } from "@/src/components/hotel/shared/GuestsRoomsField";

/** Change dates and guests without leaving the rooms list; results update as soon as a choice is made. Keeps the current sort. */
export default function RoomsSearchBar({
  checkIn: initialCheckIn,
  checkOut: initialCheckOut,
  guests: initialGuests,
  sort,
}: {
  checkIn?: string;
  checkOut?: string;
  guests: GuestsRoomsValue;
  sort: string;
}) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date | null>(() => parseDayKey(initialCheckIn));
  const [checkOut, setCheckOut] = useState<Date | null>(() => parseDayKey(initialCheckOut));
  const [guests, setGuests] = useState<GuestsRoomsValue>(initialGuests);

  const apply = (next: { checkIn: Date | null; checkOut: Date | null; guests: GuestsRoomsValue }) => {
    const params = new URLSearchParams();
    if (next.checkIn) params.set("checkIn", toDayKey(next.checkIn));
    if (next.checkOut) params.set("checkOut", toDayKey(next.checkOut));
    params.set("adults", String(next.guests.adults));
    params.set("children", String(next.guests.children));
    params.set("rooms", String(next.guests.rooms));
    if (sort !== "recommended") params.set("sort", sort);
    // Replace, not push: each tweak shouldn't add a step to the back button.
    router.replace(`/hotel-management/rooms?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="grid gap-2 rounded-md border border-neutral-200/80 bg-neutral-100/80 p-2 shadow-lg shadow-neutral-900/5 md:grid-cols-[1fr_auto] md:items-center md:rounded-md">
      <div>
        <DateRangeField
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={(nextIn, nextOut) => {
            setCheckIn(nextIn);
            setCheckOut(nextOut);
            // Wait for the check-out date: a half-picked range has nothing to search.
            if (!!nextIn === !!nextOut) apply({ checkIn: nextIn, checkOut: nextOut, guests });
          }}
        />
      </div>
      <div className="md:w-56">
        <GuestsRoomsField
          variant="inline"
          value={guests}
          onChange={(next) => {
            setGuests(next);
            apply({ checkIn, checkOut, guests: next });
          }}
        />
      </div>
    </div>
  );
}
