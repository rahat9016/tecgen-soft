import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import type { Hotel } from "@/src/data/hotels";

export default function HotelResultCard({
  hotel,
  query,
}: {
  hotel: Hotel;
  query: string;
}) {
  return (
    <Link
      href={`/hotel-management/hotel/${hotel.slug}?${query}`}
      className="flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition hover:shadow-md sm:flex-row"
    >
      <img
        src={hotel.images[0]}
        alt={hotel.name}
        className="h-48 w-full object-cover sm:h-auto sm:w-64 sm:shrink-0"
      />
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-neutral-900">{hotel.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                <MapPin className="size-3.5" /> {hotel.location}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              <Star className="size-3.5 fill-emerald-600 text-emerald-600" />
              {hotel.rating}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{hotel.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 4).map((a) => (
              <span
                key={a}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600"
              >
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <span className="text-xs text-neutral-400">{hotel.reviewsCount} reviews</span>
          <div className="text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-neutral-900">
                BDT {hotel.price.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-400 line-through">
                BDT {hotel.originalPrice.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-neutral-500">per night</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
