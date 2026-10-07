"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { parseDayKey, toDayKey } from "@/src/lib/hotelDates";
import DateRangeField from "@/src/components/hotel/shared/DateRangeField";
import GuestsRoomsField, { type GuestsRoomsValue } from "@/src/components/hotel/shared/GuestsRoomsField";

/** Change dates and guests without leaving the rooms list; keeps the current sort. */
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

  const apply = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", toDayKey(checkIn));
    if (checkOut) params.set("checkOut", toDayKey(checkOut));
    params.set("adults", String(guests.adults));
    params.set("children", String(guests.children));
    params.set("rooms", String(guests.rooms));
    if (sort !== "recommended") params.set("sort", sort);
    router.push(`/hotel-management/rooms?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="grid gap-2 rounded-3xl border border-neutral-200/80 bg-neutral-100/80 p-2 shadow-lg shadow-neutral-900/5 md:grid-cols-[1fr_auto_auto] md:items-center md:rounded-[1.75rem]">
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
        <GuestsRoomsField variant="inline" value={guests} onChange={setGuests} />
      </div>
      <Button
        onClick={apply}
        className="h-12 rounded-2xl bg-sky-600 px-6 text-sm font-semibold shadow-lg shadow-sky-600/25 hover:bg-sky-700 md:h-14 md:rounded-[1.25rem]"
      >
        <RefreshCw className="size-4" />
        Update
      </Button>
    </div>
  );
}
