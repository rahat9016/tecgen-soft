import Link from "next/link";
import { BedDouble, Check, Coffee, Flame, Maximize, Users, XCircle } from "lucide-react";
import type { RoomType } from "@/src/data/hotels";

export default function RoomResultCard({
  room,
  query,
  guestsPerRoom,
  roomsNeeded,
  available,
}: {
  room: RoomType;
  query: string;
  guestsPerRoom: number;
  roomsNeeded: number;
  /** Free rooms of this type for the searched dates, or null when no dates were chosen. */
  available: number | null;
}) {
  const isAvailable = available === null || available >= roomsNeeded;
  const tooSmall = room.capacity < guestsPerRoom;
  const isBreakfast = (a: string) => a.toLowerCase().includes("breakfast");
  const breakfast = room.amenities.some(isBreakfast);

  return (
    <Link
      href={`/hotel-management/rooms/${room.id}${query ? `?${query}` : ""}`}
      className={`group relative flex w-full flex-col gap-4 rounded-2xl border-2 border-neutral-200/70 bg-white p-3 text-left transition sm:flex-row ${
        isAvailable ? "hover:border-sky-200 hover:shadow-md" : "opacity-60"
      }`}
    >
      <div className="relative h-44 shrink-0 overflow-hidden rounded-xl sm:h-auto sm:w-56">
        <img
          src={room.images[0]}
          alt={room.name}
          className={`absolute inset-0 size-full object-cover transition duration-500 ${
            isAvailable ? "group-hover:scale-105" : "grayscale"
          }`}
        />
        {isAvailable ? (
          available !== null &&
          available <= 2 && (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">
              <Flame className="size-3" /> Only {available} left for your dates
            </span>
          )
        ) : (
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

      <div className="flex min-w-0 flex-1 flex-col py-1 pr-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-bold text-neutral-900">{room.name}</p>
          <span
            className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-neutral-300 text-transparent transition ${
              isAvailable ? "group-hover:border-sky-600 group-hover:bg-sky-600 group-hover:text-white" : ""
            }`}
          >
            <Check className="size-3.5" strokeWidth={3} />
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
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

        <div className="mt-3 flex flex-wrap gap-1.5">
          {room.amenities
            .filter((a) => !isBreakfast(a))
            .map((a) => (
              <span
                key={a}
                className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600"
              >
                {a}
              </span>
            ))}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <div>
            {breakfast && (
              <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <Coffee className="size-3.5" /> Breakfast included
              </p>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-neutral-900">
                BDT {room.price.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-400 line-through">
                BDT {room.originalPrice.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-neutral-500">per night</p>
          </div>

          <span
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              isAvailable ? "bg-sky-50 text-sky-700 group-hover:bg-sky-100" : "bg-neutral-100 text-neutral-400"
            }`}
          >
            {isAvailable ? "Select room" : "Try other dates"}
          </span>
        </div>
      </div>
    </Link>
  );
}
