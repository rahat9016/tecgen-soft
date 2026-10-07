import Link from "next/link";
import { format } from "date-fns";
import {
  AlertTriangle,
  BadgeCheck,
  BedDouble,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Flame,
  Images,
  Maximize,
  Quote,
  Sparkles,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import { roomDiscount, type HotelReview, type RoomType } from "@/src/data/hotels";
import { amenityIcons } from "@/src/components/hotel/HotelDetails/AmenitiesGrid";
import { ratingLabel } from "@/src/components/hotel/shared/ratingLabel";

const isBreakfast = (amenity: string) => amenity.toLowerCase().includes("breakfast");

export default function RoomResultCard({
  room,
  query,
  guestsPerRoom,
  roomsNeeded,
  available,
  nights,
  freeCancellation,
  review,
}: {
  room: RoomType;
  query: string;
  guestsPerRoom: number;
  roomsNeeded: number;
  /** Free rooms of this type for the searched dates, or null when no dates were chosen. */
  available: number | null;
  nights: number;
  freeCancellation: boolean;
  /** Most recent review from a guest who stayed in this room type. */
  review?: HotelReview;
}) {
  const isAvailable = available === null || available >= roomsNeeded;
  const tooSmall = room.capacity < guestsPerRoom;
  const breakfast = room.amenities.some(isBreakfast);
  const discount = roomDiscount(room);
  const stayTotal = room.price * nights * roomsNeeded;

  return (
    <Link
      href={`/hotel-management/rooms/${room.id}${query ? `?${query}` : ""}`}
      className="group relative flex w-full flex-col gap-4 rounded-3xl border border-neutral-200/80 bg-white p-3 text-left shadow-sm transition hover:border-sky-200 hover:shadow-xl sm:flex-row"
    >
      <div className="relative h-56 shrink-0 overflow-hidden rounded-2xl sm:h-auto sm:min-h-80 sm:w-72">
        <img
          src={room.images[0]}
          alt={room.name}
          className={`absolute inset-0 size-full object-cover transition duration-500 ${
            isAvailable ? "group-hover:scale-105" : "grayscale"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 && isAvailable && (
            <span className="rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
              -{discount}% OFF
            </span>
          )}
          {isAvailable && available !== null && available <= 2 && (
            <span className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-rose-600 shadow-sm">
              <Flame className="size-3" /> Only {available} left
            </span>
          )}
        </div>

        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
          <Sparkles className="size-3.5 text-amber-300" /> {room.highlight}
        </span>
        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Images className="size-3.5" /> {room.images.length}
        </span>

        {!isAvailable && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-neutral-950/55 px-3 text-center text-sm font-bold text-white">
            <span className="flex items-center gap-1">
              <XCircle className="size-4" /> Not available
            </span>
            <span className="text-xs font-medium text-white/80">
              {available ? `Only ${available} left — you need ${roomsNeeded}` : "Fully booked for your dates"}
            </span>
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-1 pb-1 sm:py-2 sm:pr-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-neutral-900 transition group-hover:text-sky-700">{room.name}</h2>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
              <span className="flex items-center gap-1">
                <Maximize className="size-3.5 text-neutral-400" /> {room.size}
              </span>
              <span className="flex items-center gap-1">
                <BedDouble className="size-3.5 text-neutral-400" /> {room.beds}
              </span>
              <span className={`flex items-center gap-1 ${tooSmall ? "font-semibold text-amber-700" : ""}`}>
                <Users className="size-3.5 text-neutral-400" /> Up to {room.capacity} guests
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-neutral-900">{ratingLabel(room.rating)}</p>
              <p className="text-xs text-neutral-500">{room.reviewsCount} reviews</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl rounded-bl-none bg-sky-700 text-sm font-bold text-white">
              {room.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-600">{room.description}</p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {room.amenities
            .filter((amenity) => !isBreakfast(amenity))
            .map((amenity) => {
              const Icon = amenityIcons[amenity] ?? CheckCircle2;
              return (
                <li
                  key={amenity}
                  className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700"
                >
                  <Icon className="size-3.5 text-sky-600" />
                  {amenity}
                </li>
              );
            })}
        </ul>

        {review && (
          <figure className="mt-4 flex gap-3 rounded-2xl bg-sky-50/70 p-3">
            <img
              src={`https://i.pravatar.cc/80?img=${review.avatar}`}
              alt={review.name}
              className="size-9 shrink-0 rounded-full object-cover ring-2 ring-white"
            />
            <div className="min-w-0">
              <blockquote className="line-clamp-2 text-sm text-neutral-700">
                <Quote className="mr-1 inline size-3.5 -translate-y-0.5 fill-sky-200 text-sky-200" />
                {review.comment}
              </blockquote>
              <figcaption className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700">{review.name}</span>
                &middot; {format(new Date(review.date), "MMM yyyy")}
                <span className="flex items-center gap-0.5 font-semibold text-amber-600">
                  <Star className="size-3 fill-amber-400 text-amber-400" /> {review.rating}
                </span>
              </figcaption>
            </div>
          </figure>
        )}

        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-end justify-between gap-3 border-t border-neutral-100 pt-4">
            <div>
              <div className="mb-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
                {freeCancellation && (
                  <span className="flex items-center gap-1 text-emerald-700">
                    <BadgeCheck className="size-3.5" /> Free cancellation
                  </span>
                )}
                {breakfast && (
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Coffee className="size-3.5" /> Breakfast included
                  </span>
                )}
                {tooSmall && (
                  <span className="flex items-center gap-1 text-amber-700">
                    <AlertTriangle className="size-3.5" /> Too small for {guestsPerRoom} guests
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-neutral-900">BDT {room.price.toLocaleString()}</span>
                <span className="text-xs text-neutral-500">/night</span>
                <span className="text-xs text-neutral-400 line-through">
                  BDT {room.originalPrice.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                {nights > 0
                  ? `BDT ${stayTotal.toLocaleString()} for ${nights} night${nights !== 1 ? "s" : ""}${
                      roomsNeeded > 1 ? ` · ${roomsNeeded} rooms` : ""
                    } + taxes`
                  : "Taxes & fees shown at checkout"}
              </p>
            </div>

            <span
              className={`flex w-full items-center justify-center gap-1 rounded-2xl px-6 py-3 text-sm font-semibold transition sm:w-auto ${
                isAvailable
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-600/25 group-hover:bg-sky-700"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {isAvailable ? "Select room" : "Try other dates"}
              <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
