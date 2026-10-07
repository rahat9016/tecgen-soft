import Link from "next/link";
import { differenceInCalendarDays, format } from "date-fns";
import { CalendarCheck2, CalendarSearch, MapPin, Star } from "lucide-react";
import { availableRooms, hotel } from "@/src/data/hotels";
import { parseDayKey } from "@/src/lib/hotelDates";
import { ratingLabel } from "@/src/components/hotel/shared/ratingLabel";
import RoomResultCard from "@/src/components/hotel/Rooms/RoomResultCard";
import RoomsSearchBar from "@/src/components/hotel/Rooms/RoomsSearchBar";

const sortOptions = [
  { key: "recommended", label: "Recommended" },
  { key: "price", label: "Lowest price" },
  { key: "rating", label: "Top rated" },
  { key: "space", label: "Most space" },
] as const;

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const stringParams = Object.fromEntries(
    Object.entries(params).flatMap(([key, value]) => (typeof value === "string" ? [[key, value]] : []))
  ) as Record<string, string>;

  const adults = Number(stringParams.adults ?? 2);
  const children = Number(stringParams.children ?? 0);
  const rooms = Number(stringParams.rooms ?? 1);
  const sort = sortOptions.some((o) => o.key === stringParams.sort) ? stringParams.sort : "recommended";
  const checkIn = parseDayKey(stringParams.checkIn);
  const checkOut = parseDayKey(stringParams.checkOut);
  const nights = checkIn && checkOut ? Math.max(0, differenceInCalendarDays(checkOut, checkIn)) : 0;
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
  const rank = (id: string, capacity: number) => (!isOpen(id) ? 2 : capacity >= guestsPerRoom ? 0 : 1);
  const results = [...hotel.rooms].sort((a, b) => {
    if (sort === "price") return a.price - b.price;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "space") return parseInt(b.size) - parseInt(a.size);
    return rank(a.id, a.capacity) - rank(b.id, b.capacity) || a.price - b.price;
  });

  const latestReview = (roomId: string) =>
    hotel.reviews.filter((r) => r.roomId === roomId).sort((a, b) => b.date.localeCompare(a.date))[0];
  const freeCancellation = hotel.policies.some((p) => p.toLowerCase().includes("free cancellation"));

  const query = new URLSearchParams(stringParams).toString();
  const sortHref = (key: string) => `?${new URLSearchParams({ ...stringParams, sort: key }).toString()}`;

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">Our Rooms</h1>
          <p className="mt-1.5 flex items-center gap-1 text-sm text-neutral-500">
            <MapPin className="size-4 text-sky-600" /> {hotel.name} &middot; {hotel.address}
          </p>
        </div>

        <Link
          href="/hotel-management#reviews"
          className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white py-2 pl-2 pr-4 shadow-sm transition hover:border-sky-200"
        >
          <span className="flex size-11 items-center justify-center rounded-xl rounded-bl-none bg-sky-700 text-base font-bold text-white">
            {hotel.rating.toFixed(1)}
          </span>
          <span>
            <span className="flex items-center gap-1 text-sm font-bold text-neutral-900">
              {ratingLabel(hotel.rating)}
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`size-3 ${
                      i < Math.round(hotel.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-neutral-200 text-neutral-200"
                    }`}
                  />
                ))}
              </span>
            </span>
            <span className="text-xs text-neutral-500">{hotel.reviewsCount} verified guest reviews</span>
          </span>
        </Link>
      </div>

      <div className="mt-5">
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
              available &middot; {format(checkIn, "dd MMM")} – {format(checkOut, "dd MMM")} ({nights} night
              {nights !== 1 ? "s" : ""})
            </span>
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-neutral-600">
            <CalendarSearch className="size-4 text-sky-600" />
            <span>
              <span className="font-semibold text-neutral-900">{hotel.rooms.length} room types</span> &middot;
              add dates to check availability
            </span>
          </p>
        )}

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <span className="hidden text-xs font-medium text-neutral-500 sm:inline">Sort by</span>
          <div className="grid flex-1 grid-cols-2 gap-1 rounded-2xl bg-neutral-100 p-1 text-xs font-medium sm:flex sm:rounded-full sm:text-sm">
            {sortOptions.map((option) => (
              <Link
                key={option.key}
                href={sortHref(option.key)}
                scroll={false}
                className={`flex-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-center transition ${
                  sort === option.key
                    ? "bg-white font-semibold text-sky-700 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-5">
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
            review={latestReview(room.id)}
          />
        ))}
      </div>
    </div>
  );
}
