"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarSearch } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { toDayKey } from "@/src/lib/hotelDates";
import DatePickerField from "@/src/components/hotel/shared/DatePickerField";
import GuestsRoomsField, {
  type GuestsRoomsValue,
} from "@/src/components/hotel/shared/GuestsRoomsField";

export default function SearchWidget() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guests, setGuests] = useState<GuestsRoomsValue>({ adults: 2, children: 0, rooms: 1 });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", toDayKey(checkIn));
    if (checkOut) params.set("checkOut", toDayKey(checkOut));
    params.set("adults", String(guests.adults));
    params.set("children", String(guests.children));
    params.set("rooms", String(guests.rooms));
    router.push(`/hotel-management/rooms?${params.toString()}`);
  };

  return (
    <div className="rounded-3xl border border-white/50 bg-white/70 p-3 shadow-2xl shadow-neutral-950/25 backdrop-blur-2xl backdrop-saturate-150 md:p-4">
      <p className="px-1 pb-0.5 text-sm font-bold text-neutral-900">Check room availability</p>

      <div className="mt-3 grid rounded-2xl border border-white/70 bg-white/55 p-1.5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
        <div className="border-b border-neutral-900/10 md:border-b-0 md:border-r">
          <DatePickerField
            variant="inline"
            label="Check-in"
            value={checkIn}
            onChange={(date) => {
              setCheckIn(date);
              if (date && (!checkOut || checkOut <= date)) setCheckOut(null);
              setCheckOutOpen(true);
            }}
          />
        </div>

        <div className="border-b border-neutral-900/10 md:border-b-0 md:border-r">
          <DatePickerField
            variant="inline"
            label="Check-out"
            value={checkOut}
            onChange={setCheckOut}
            disabledBefore={
              checkIn ? new Date(checkIn.getTime() + 86400000) : undefined
            }
            open={checkOutOpen}
            onOpenChange={setCheckOutOpen}
          />
        </div>

        <div>
          <GuestsRoomsField
            variant="inline"
            value={guests}
            onChange={setGuests}
          />
        </div>

        <Button
          onClick={handleSearch}
          className="mt-1.5 h-13 rounded-xl bg-sky-600 px-8 text-base font-semibold shadow-lg shadow-sky-600/30 hover:bg-sky-700 md:mt-0 md:ml-1.5"
        >
          <CalendarSearch className="size-5" />
          Check Availability
        </Button>
      </div>
    </div>
  );
}
