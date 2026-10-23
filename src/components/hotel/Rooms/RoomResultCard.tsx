import Link from "next/link";
import { AlertTriangle, BadgeCheck, BedDouble, CheckCircle2, ChevronRight, Coffee, Flame, Maximize, Star, Users, XCircle } from "lucide-react";
import { roomDiscount, type RoomType } from "@/src/data/hotels";
import { amenityIcons } from "@/src/components/hotel/HotelDetails/AmenitiesGrid";
import { ratingLabel } from "@/src/components/hotel/shared/ratingLabel";

const isBreakfast = (amenity: string) => amenity.toLowerCase().includes("breakfast");
/** Amenities shown on the card; the rest are on the room page. */
const SHOWN_AMENITIES = 4;

export default function RoomResultCard({
  room,
  query,
  guestsPerRoom,
  roomsNeeded,
  available,
  nights,
  freeCancellation,
}: {
  room: RoomType;
  query: string;
  guestsPerRoom: number;
  roomsNeeded: number;
  /** Free rooms of this type for the searched dates, or null when no dates were chosen. */
  available: number | null;
  nights: number;
  freeCancellation: boolean;
}) {
  const isAvailable = available === null || available >= roomsNeeded;
  const tooSmall = room.capacity < guestsPerRoom;
  const breakfast = room.amenities.some(isBreakfast);
  const discount = roomDiscount(room);
  const stayTotal = room.price * nights * roomsNeeded;
  const amenities = room.amenities.filter((a) => !isBreakfast(a));

  return (
    <Link
      href={`/hotel-management/rooms/${room.id}${query ? `?${query}` : ""}`}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left transition hover:border-sky-200 hover:shadow-lg sm:flex-row"
    >
      <div className="relative aspect-16/10 shrink-0 overflow-hidden bg-neutral-100 sm:aspect-auto sm:w-64 lg:w-72">
        <img
          src={room.images[0]}
          alt={room.name}
          className={`absolute inset-0 size-full object-cover transition duration-500 ${isAvailable ? "group-hover:scale-105" : "grayscale"}`}
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 && isAvailable && <span className="rounded-md bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">-{discount}%</span>}
          {isAvailable && available !== null && available <= 2 && (
            <span className="flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-rose-600 shadow-sm">
              <Flame className="size-3" /> Only {available} left
            </span>
          )}
        </div>
        {!isAvailable && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-neutral-950/55 px-3 text-center text-sm font-bold text-white">
            <span className="flex items-center gap-1">
              <XCircle className="size-4" /> Not available
            </span>
            <span className="text-xs font-medium text-white/80">{available ? `Only ${available} left — you need ${roomsNeeded}` : "Fully booked for your dates"}</span>
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col md:flex-row">
        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
          <div>
            {room.highlight && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-sky-700">{room.highlight}</p>}
            <h2 className="text-lg font-bold leading-snug text-neutral-900 transition group-hover:text-sky-700">{room.name}</h2>
            {room.reviewsCount > 0 && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-600">
                <span className="flex items-center gap-0.5 rounded bg-sky-700 px-1.5 py-0.5 font-bold text-white">
                  <Star className="size-3 fill-white" /> {room.rating.toFixed(1)}
                </span>
                <span className="font-semibold text-neutral-800">{ratingLabel(room.rating)}</span>
                <span className="text-neutral-400">·</span>
                {room.reviewsCount} review{room.reviewsCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
            <span className="flex items-center gap-1.5">
              <Maximize className="size-3.5 text-neutral-400" /> {room.size}
            </span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-3.5 text-neutral-400" /> {room.beds}
            </span>
            <span className={`flex items-center gap-1.5 ${tooSmall ? "font-semibold text-amber-700" : ""}`}>
              <Users className="size-3.5 text-neutral-400" /> Up to {room.capacity} guests
            </span>
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600">{room.description}</p>

          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-700">
            {amenities.slice(0, SHOWN_AMENITIES).map((amenity) => {
              const Icon = amenityIcons[amenity] ?? CheckCircle2;
              return (
                <li key={amenity} className="flex items-center gap-1.5">
                  <Icon className="size-3.5 text-sky-600" />
                  {amenity}
                </li>
              );
            })}
            {amenities.length > SHOWN_AMENITIES && <li className="font-medium text-sky-700">+{amenities.length - SHOWN_AMENITIES} more</li>}
          </ul>

          {(freeCancellation || breakfast || tooSmall) && (
            <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs font-semibold">
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
          )}
        </div>

        {/* Price */}
        <div className="flex shrink-0 flex-row items-end justify-between gap-3 border-t border-neutral-100 p-4 sm:px-5 md:w-56 md:flex-col md:items-stretch md:justify-end md:border-l md:border-t-0 md:py-5">
          <div className="md:text-right">
            {room.originalPrice > room.price && <p className="text-xs text-neutral-400 line-through">BDT {room.originalPrice.toLocaleString()}</p>}
            <p className="text-2xl font-extrabold leading-tight text-neutral-900">BDT {room.price.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">
              {nights > 0 ? `BDT ${stayTotal.toLocaleString()} · ${nights} night${nights !== 1 ? "s" : ""}${roomsNeeded > 1 ? ` · ${roomsNeeded} rooms` : ""}` : "per night"}
            </p>
            <p className="text-[11px] text-neutral-400">+ taxes & fees</p>
          </div>
          <span
            className={`flex shrink-0 items-center justify-center gap-1 rounded-lg px-5 py-2.5 text-sm font-semibold transition md:mt-3 md:w-full ${
              isAvailable ? "bg-sky-600 text-white group-hover:bg-sky-700" : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {isAvailable ? "Select room" : "Try other dates"}
            <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
