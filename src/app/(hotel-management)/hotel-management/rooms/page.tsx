import Link from "next/link";
import { differenceInCalendarDays, format } from "date-fns";
import { BedDouble, CalendarDays, CalendarSearch, MapPin, Users } from "lucide-react";
import { availableRooms, hotel } from "@/src/data/hotels";
import { parseDayKey } from "@/src/lib/hotelDates";
import RoomResultCard from "@/src/components/hotel/Rooms/RoomResultCard";

const sortOptions = [
  { key: "recommended", label: "Recommended" },
  { key: "price", label: "Lowest price" },
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
  const guests = adults + children;
  const guestsPerRoom = Math.ceil(guests / rooms);

  // Availability only exists for a date range; without dates every room is simply bookable.
  const availability = new Map(
    hotel.rooms.map((room) => [
      room.id,
      checkIn && nights > 0 ? availableRooms(room, checkIn, checkOut!) : null,
    ])
  );

  // Recommended: rooms that are free and fit the party first, then the rest; unavailable last.
  const rank = (id: string, capacity: number) => {
    const free = availability.get(id);
    if (free !== null && free !== undefined && free < rooms) return 2;
    return capacity >= guestsPerRoom ? 0 : 1;
  };
  const results = [...hotel.rooms].sort((a, b) => {
    if (sort === "price") return a.price - b.price;
    if (sort === "space") return parseInt(b.size) - parseInt(a.size);
    return rank(a.id, a.capacity) - rank(b.id, b.capacity) || a.price - b.price;
  });

  const query = new URLSearchParams(stringParams).toString();
  const sortHref = (key: string) => `?${new URLSearchParams({ ...stringParams, sort: key }).toString()}`;

  const chips = [
    checkIn && {
      icon: CalendarDays,
      text: `${format(checkIn, "EEE, dd MMM")}${checkOut ? ` – ${format(checkOut, "EEE, dd MMM")}` : ""}${
        nights ? ` · ${nights} night${nights !== 1 ? "s" : ""}` : ""
      }`,
    },
    { icon: Users, text: `${guests} guest${guests !== 1 ? "s" : ""}` },
    { icon: BedDouble, text: `${rooms} room${rooms !== 1 ? "s" : ""}` },
  ].filter(Boolean) as { icon: typeof Users; text: string }[];

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Our Rooms</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
            <MapPin className="size-4 text-sky-600" /> {hotel.name} &middot; {hotel.address}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {chips.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700"
              >
                <Icon className="size-3.5 text-sky-600" />
                {text}
              </li>
            ))}
            <li>
              <Link
                href="/hotel-management"
                className="flex items-center rounded-full px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50"
              >
                Change dates
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <span className="hidden text-xs font-medium text-neutral-500 sm:inline">Sort by</span>
          <div className="flex flex-1 gap-1 rounded-full bg-neutral-100 p-1 text-xs font-medium sm:text-sm">
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

      {nights === 0 && (
        <Link
          href="/hotel-management"
          className="mt-6 flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800 transition hover:bg-sky-100"
        >
          <CalendarSearch className="size-5 shrink-0" />
          <span>
            <span className="font-semibold">Add your dates</span> to see which rooms are free for your stay.
          </span>
        </Link>
      )}

      <div className="mt-6 space-y-4">
        {results.map((room) => (
          <RoomResultCard
            key={room.id}
            room={room}
            query={query}
            guestsPerRoom={guestsPerRoom}
            roomsNeeded={rooms}
            available={availability.get(room.id) ?? null}
          />
        ))}
      </div>
    </div>
  );
}
