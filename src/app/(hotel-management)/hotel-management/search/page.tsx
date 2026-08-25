import { SearchX } from "lucide-react";
import { hotels } from "@/src/data/hotels";
import HotelResultCard from "@/src/components/hotel/Search/HotelResultCard";

export default async function HotelSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const location = typeof params.location === "string" ? params.location : "";
  const adults = typeof params.adults === "string" ? params.adults : "2";
  const rooms = typeof params.rooms === "string" ? params.rooms : "1";

  const results = location
    ? hotels.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(location.toLowerCase()) ||
          hotel.location.toLowerCase().includes(location.toLowerCase())
      )
    : hotels;

  const query = new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) =>
      typeof value === "string" ? [[key, value] as [string, string]] : []
    )
  ).toString();

  return (
    <div className="container py-8">
      <h1 className="text-xl font-bold text-neutral-900">
        {location ? `Hotels in "${location}"` : "All Hotels & Resorts"}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {results.length} propert{results.length === 1 ? "y" : "ies"} found &middot; {adults}{" "}
        guests &middot; {rooms} room{rooms !== "1" ? "s" : ""}
      </p>

      {results.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-neutral-500">
          <SearchX className="size-10" />
          <p className="font-medium">No hotels found for &ldquo;{location}&rdquo;</p>
          <p className="text-sm">Try a different destination or hotel name.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {results.map((hotel) => (
            <HotelResultCard key={hotel.slug} hotel={hotel} query={query} />
          ))}
        </div>
      )}
    </div>
  );
}
