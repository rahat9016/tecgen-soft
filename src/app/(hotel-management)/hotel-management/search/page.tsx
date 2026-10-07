import Link from "next/link";
import { differenceInCalendarDays, format } from "date-fns";
import { BedDouble, Building2, CalendarDays, SearchX, Users } from "lucide-react";
import { hotels } from "@/src/data/hotels";
import HotelResultCard from "@/src/components/hotel/Search/HotelResultCard";

const sortOptions = [
  { key: "recommended", label: "Recommended" },
  { key: "price", label: "Lowest price" },
  { key: "rating", label: "Top rated" },
] as const;

const parseDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export default async function HotelSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const stringParams = Object.fromEntries(
    Object.entries(params).flatMap(([key, value]) => (typeof value === "string" ? [[key, value]] : []))
  ) as Record<string, string>;

  const location = stringParams.location ?? "";
  const adults = Number(stringParams.adults ?? 2);
  const children = Number(stringParams.children ?? 0);
  const rooms = Number(stringParams.rooms ?? 1);
  const sort = sortOptions.some((o) => o.key === stringParams.sort) ? stringParams.sort : "recommended";
  const checkIn = stringParams.checkIn ? parseDate(stringParams.checkIn) : null;
  const checkOut = stringParams.checkOut ? parseDate(stringParams.checkOut) : null;
  const nights = checkIn && checkOut ? Math.max(0, differenceInCalendarDays(checkOut, checkIn)) : 0;

  const filtered = location
    ? hotels.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(location.toLowerCase()) ||
          hotel.location.toLowerCase().includes(location.toLowerCase())
      )
    : hotels;

  const results =
    sort === "price"
      ? [...filtered].sort((a, b) => a.price - b.price)
      : sort === "rating"
        ? [...filtered].sort((a, b) => b.rating - a.rating)
        : filtered;

  const query = new URLSearchParams(stringParams).toString();
  const sortHref = (key: string) => `?${new URLSearchParams({ ...stringParams, sort: key }).toString()}`;
  const guests = adults + children;

  const chips = [
    checkIn && {
      icon: CalendarDays,
      text: `${format(checkIn, "EEE, dd MMM")}${checkOut ? ` – ${format(checkOut, "EEE, dd MMM")}` : ""}${
        nights ? ` · ${nights} night${nights !== 1 ? "s" : ""}` : ""
      }`,
    },
    { icon: Users, text: `${guests} guest${guests !== 1 ? "s" : ""}` },
    { icon: BedDouble, text: `${rooms} room${rooms !== 1 ? "s" : ""}` },
    { icon: Building2, text: `${results.length} propert${results.length === 1 ? "y" : "ies"}` },
  ].filter(Boolean) as { icon: typeof Users; text: string }[];

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {location ? `Stays in "${location}"` : "All Hotels & Resorts"}
          </h1>
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
          </ul>
        </div>

        {results.length > 1 && (
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
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-neutral-500">
          <SearchX className="size-10" />
          <p className="font-medium">No hotels found for &ldquo;{location}&rdquo;</p>
          <p className="text-sm">Try a different destination or hotel name.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5">
          {results.map((hotel) => (
            <HotelResultCard key={hotel.slug} hotel={hotel} query={query} nights={nights} />
          ))}
        </div>
      )}
    </div>
  );
}
