import Link from "next/link";
import { BedDouble, ChevronRight, Maximize, Users } from "lucide-react";
import type { RoomType } from "@/src/data/hotels";

export default function OtherRooms({
  rooms,
  query,
  availability,
  roomsNeeded,
}: {
  rooms: RoomType[];
  query: string;
  /** Free rooms per room id for the chosen dates; null when no dates are set. */
  availability: Record<string, number | null>;
  roomsNeeded: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rooms.map((room) => {
        const free = availability[room.id];
        const soldOut = free !== null && free < roomsNeeded;
        return (
          <Link
            key={room.id}
            href={`/hotel-management/rooms/${room.id}${query ? `?${query}` : ""}`}
            className="group flex overflow-hidden rounded-2xl border border-neutral-200/70 bg-white transition hover:border-sky-200 hover:shadow-lg"
          >
            <div className="relative w-32 shrink-0 overflow-hidden sm:w-36">
              <img
                src={room.images[0]}
                alt={room.name}
                className={`absolute inset-0 size-full object-cover transition duration-500 ${
                  soldOut ? "grayscale" : "group-hover:scale-105"
                }`}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col p-4">
              <p className="font-bold text-neutral-900 group-hover:text-sky-700">{room.name}</p>
              <div className="mt-1.5 space-y-0.5 text-xs text-neutral-500">
                <p className="flex items-center gap-1">
                  <BedDouble className="size-3.5" /> {room.beds}
                </p>
                <p className="flex items-center gap-1">
                  <Maximize className="size-3.5" /> {room.size}
                  <Users className="ml-2 size-3.5" /> {room.capacity} guests
                </p>
              </div>
              <div className="mt-auto flex items-end justify-between pt-3">
                {soldOut ? (
                  <span className="text-sm font-semibold text-rose-600">Not available for your dates</span>
                ) : (
                  <p className="text-base font-extrabold text-neutral-900">
                    BDT {room.price.toLocaleString()}
                    <span className="text-xs font-medium text-neutral-500"> /night</span>
                  </p>
                )}
                <ChevronRight className="size-4 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-sky-700" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
