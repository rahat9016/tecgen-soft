import Link from "next/link";
import {
  BedDouble,
  Check,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Flame,
  Images,
  MapPin,
  Navigation,
  Star,
} from "lucide-react";
import type { Hotel } from "@/src/data/hotels";
import { amenityIcons } from "@/src/components/hotel/HotelDetails/AmenitiesGrid";

const ratingLabel = (rating: number) =>
  rating >= 4.5 ? "Excellent" : rating >= 4 ? "Very Good" : rating >= 3.5 ? "Good" : "Pleasant";

export default function HotelResultCard({
  hotel,
  query,
  nights,
}: {
  hotel: Hotel;
  query: string;
  nights: number;
}) {
  const availableRooms = hotel.rooms.filter((room) => room.available > 0);
  const roomsLeft = availableRooms.reduce((sum, room) => sum + room.available, 0);
  const cheapestRoom = [...availableRooms].sort((a, b) => a.price - b.price)[0];
  const freeCancellation = hotel.policies.some((p) => p.toLowerCase().includes("free cancellation"));
  const breakfast = hotel.amenities.includes("Free Breakfast");
  const review = hotel.reviews[0];
  const nearby = hotel.nearby[0];

  return (
    <Link
      href={`/hotel-management/hotel/${hotel.slug}?${query}`}
      className="group grid overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-xl sm:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr_230px]"
    >
      <div className="relative h-56 overflow-hidden sm:h-full sm:min-h-72">
        <img
          src={hotel.images[0]}
          alt={hotel.name}
          className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        {hotel.discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
            -{hotel.discount}% OFF
          </span>
        )}
        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Images className="size-3.5" /> {hotel.images.length} photos
        </span>
      </div>

      <div className="flex min-w-0 flex-col p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
            {hotel.category}
          </span>
          <span className="flex items-center gap-0.5" aria-label={`${hotel.rating} out of 5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`size-3.5 ${
                  i < Math.round(hotel.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-neutral-200 text-neutral-200"
                }`}
              />
            ))}
          </span>
        </div>

        <h2 className="mt-2 text-lg font-bold text-neutral-900 transition group-hover:text-sky-700">
          {hotel.name}
        </h2>
        <p className="mt-1 flex items-start gap-1 text-xs text-neutral-500">
          <MapPin className="mt-px size-3.5 shrink-0" /> {hotel.address}
        </p>
        {nearby && (
          <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
            <Navigation className="size-3.5 shrink-0" /> {nearby.distance} from {nearby.name}
          </p>
        )}

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-600">
          {hotel.description}
        </p>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {hotel.amenities.slice(0, 5).map((amenity) => {
            const Icon = amenityIcons[amenity] ?? CheckCircle2;
            return (
              <li key={amenity} className="flex items-center gap-1.5 text-xs text-neutral-600">
                <Icon className="size-3.5 text-sky-600" />
                {amenity}
              </li>
            );
          })}
          {hotel.amenities.length > 5 && (
            <li className="text-xs font-medium text-sky-700">+{hotel.amenities.length - 5} more</li>
          )}
        </ul>

        {cheapestRoom && (
          <p className="mt-3 flex flex-wrap items-center gap-x-1.5 rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
            <BedDouble className="size-4 text-neutral-500" />
            <span className="font-semibold text-neutral-800">{cheapestRoom.name}</span>
            &middot; {cheapestRoom.beds} &middot; {cheapestRoom.size} &middot; up to{" "}
            {cheapestRoom.capacity} guests
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
          {freeCancellation && (
            <span className="flex items-center gap-1 text-emerald-700">
              <Check className="size-3.5" /> Free cancellation
            </span>
          )}
          {breakfast && (
            <span className="flex items-center gap-1 text-emerald-700">
              <Coffee className="size-3.5" /> Breakfast included
            </span>
          )}
          {roomsLeft > 0 && roomsLeft <= 5 && (
            <span className="flex items-center gap-1 text-rose-600">
              <Flame className="size-3.5" /> Only {roomsLeft} room{roomsLeft !== 1 ? "s" : ""} left
            </span>
          )}
        </div>

        {review && (
          <div className="mt-4 flex items-start gap-3 border-t border-neutral-100 pt-4">
            <img
              src={`https://i.pravatar.cc/64?img=${review.avatar}`}
              alt={review.name}
              className="size-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow"
            />
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm italic text-neutral-700">&ldquo;{review.comment}&rdquo;</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700">{review.name}</span>
                &middot; {review.location}
                <span className="flex items-center gap-0.5 font-semibold text-amber-600">
                  <Star className="size-3 fill-amber-400 text-amber-400" /> {review.rating}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between gap-4 border-t border-neutral-100 p-4 sm:col-span-2 md:p-5 lg:col-span-1 lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <div className="lg:text-right">
            <p className="text-sm font-bold text-neutral-900">{ratingLabel(hotel.rating)}</p>
            <p className="text-xs text-neutral-500">{hotel.reviewsCount.toLocaleString()} reviews</p>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl rounded-bl-none bg-sky-700 text-base font-bold text-white">
            {hotel.rating.toFixed(1)}
          </span>
        </div>

        <div className="sm:text-right">
          {roomsLeft === 0 ? (
            <p className="text-sm font-semibold text-rose-600">Sold out for these dates</p>
          ) : (
            <>
              <p className="text-xs text-neutral-400 line-through">
                BDT {hotel.originalPrice.toLocaleString()}
              </p>
              <p className="text-2xl font-extrabold text-neutral-900">
                BDT {hotel.price.toLocaleString()}
              </p>
              <p className="text-xs text-neutral-500">per night</p>
              {nights > 0 && (
                <p className="mt-1 text-xs font-medium text-neutral-700">
                  BDT {(hotel.price * nights).toLocaleString()} for {nights} night
                  {nights !== 1 ? "s" : ""}
                </p>
              )}
            </>
          )}
          <span className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-600/25 transition group-hover:bg-sky-700">
            See availability <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
