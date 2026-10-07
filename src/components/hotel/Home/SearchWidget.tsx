"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarSearch } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { toDayKey } from "@/src/lib/hotelDates";
import DateRangeField from "@/src/components/hotel/shared/DateRangeField";
import GuestsRoomsField, {
  type GuestsRoomsValue,
} from "@/src/components/hotel/shared/GuestsRoomsField";

export default function SearchWidget() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestsRoomsValue>({
    adults: 2,
    children: 0,
    rooms: 1,
  });

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
    <div className="mx-auto grid max-w-4xl gap-2 rounded-3xl border border-white/60 bg-white/75 p-2 shadow-2xl shadow-neutral-950/30 ring-1 ring-black/5 backdrop-blur-2xl backdrop-saturate-150 md:grid-cols-[1fr_auto_auto] md:items-center md:rounded-[1.75rem]">
      <div>
        <DateRangeField
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={(nextIn, nextOut) => {
            setCheckIn(nextIn);
            setCheckOut(nextOut);
          }}
        />
      </div>

      <div className="md:w-56">
        <GuestsRoomsField
          variant="inline"
          value={guests}
          onChange={setGuests}
        />
      </div>

      <Button
        onClick={handleSearch}
        className="h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-700 px-6 text-sm font-semibold shadow-lg shadow-sky-600/30 transition hover:from-sky-600 hover:to-sky-800 md:h-14 md:rounded-[1.25rem]"
      >
        <CalendarSearch className="size-5" />
        Check Availability
      </Button>
    </div>
  );
}
