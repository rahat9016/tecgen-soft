"use client";

import { useRouter } from "next/navigation";
import { differenceInCalendarDays, format } from "date-fns";
import { ArrowUpDown, CalendarCheck2, CalendarSearch } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { availableRooms } from "@/src/data/hotels";
import { useHotelSite } from "@/src/lib/hotel-store/store";
import { parseDayKey } from "@/src/lib/hotelDates";
import RoomResultCard from "./RoomResultCard";
import RoomsSearchBar from "./RoomsSearchBar";

const sortOptions = [
  { key: "recommended", label: "Recommended" },
  { key: "price", label: "Lowest price" },
  { key: "rating", label: "Top rated" },
  { key: "space", label: "Most space" },
] as const;

/** Room results for the searched dates; availability comes live from the hotel store. */
export default function RoomsListing({
  stringParams,
}: {
  stringParams: Record<string, string>;
}) {
  const hotel = useHotelSite();
  const router = useRouter();
  const adults = Number(stringParams.adults ?? 2);
  const children = Number(stringParams.children ?? 0);
  const rooms = Number(stringParams.rooms ?? 1);
  const sort = sortOptions.some((o) => o.key === stringParams.sort)
    ? stringParams.sort
    : "recommended";
  const checkIn = parseDayKey(stringParams.checkIn);
  const checkOut = parseDayKey(stringParams.checkOut);
  const nights =
    checkIn && checkOut
      ? Math.max(0, differenceInCalendarDays(checkOut, checkIn))
      : 0;
  const guestsPerRoom = Math.ceil((adults + children) / rooms);

  // Availability only exists for a date range; without dates every room is simply bookable.
  const availability = new Map(
    hotel.rooms.map((room) => [
      room.id,
      checkIn && nights > 0 ? availableRooms(room, checkIn, checkOut!) : null,
    ])
  );
  const isOpen = (id: string) => {
    const free = availability.get(id);
    return free === null || free === undefined || free >= rooms;
  };
  const openCount = hotel.rooms.filter((room) => isOpen(room.id)).length;

  // Recommended: rooms that are free and fit the party first, then the rest; unavailable last.
  const rank = (id: string, capacity: number) =>
    !isOpen(id) ? 2 : capacity >= guestsPerRoom ? 0 : 1;
  const results = [...hotel.rooms].sort((a, b) => {
    if (sort === "price") return a.price - b.price;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "space") return parseInt(b.size) - parseInt(a.size);
    return rank(a.id, a.capacity) - rank(b.id, b.capacity) || a.price - b.price;
  });

  const freeCancellation = hotel.policies.some((p) =>
    p.toLowerCase().includes("free cancellation")
  );

  const query = new URLSearchParams(stringParams).toString();
  const setSort = (key: string) =>
    router.replace(
      `?${new URLSearchParams({ ...stringParams, sort: key }).toString()}`,
      { scroll: false }
    );

  return (
    <div className="container py-8">
      {/* Title for screen readers and search engines; visually the page opens with the search bar. */}
      <h1 className="sr-only">Our Rooms</h1>

      <div>
        <RoomsSearchBar
          checkIn={stringParams.checkIn}
          checkOut={stringParams.checkOut}
          guests={{ adults, children, rooms }}
          sort={sort}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {nights > 0 && checkIn && checkOut ? (
          <p className="flex items-center gap-2 text-sm text-neutral-600">
            <CalendarCheck2 className="size-4 text-emerald-600" />
            <span>
              <span className="font-semibold text-neutral-900">
                {openCount} of {hotel.rooms.length} room types
              </span>{" "}
              available &middot; {format(checkIn, "dd MMM")} –{" "}
              {format(checkOut, "dd MMM")} ({nights} night
              {nights !== 1 ? "s" : ""})
            </span>
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-neutral-600">
            <CalendarSearch className="size-4 text-sky-600" />
            <span>
              <span className="font-semibold text-neutral-900">
                {hotel.rooms.length} room types
              </span>{" "}
              &middot; add dates to check availability
            </span>
          </p>
        )}

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger
            aria-label="Sort by"
            className="h-10 w-full gap-2 rounded-md border-neutral-200 bg-white text-sm font-medium text-neutral-800 shadow-none sm:ml-auto sm:w-52"
          >
            <span className="flex items-center gap-2">
              <ArrowUpDown className="size-4 text-neutral-400" />
              <span className="text-neutral-500">Sort:</span>
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent align="end">
            {sortOptions.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 space-y-4">
        {results.map((room) => (
          <RoomResultCard
            key={room.id}
            room={room}
            query={query}
            guestsPerRoom={guestsPerRoom}
            roomsNeeded={rooms}
            available={availability.get(room.id) ?? null}
            nights={nights}
            freeCancellation={freeCancellation}
          />
        ))}
      </div>
    </div>
  );
}
