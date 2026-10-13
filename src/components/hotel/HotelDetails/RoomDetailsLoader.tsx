"use client";

import Link from "next/link";
import { BedDouble } from "lucide-react";
import { useHotelSite, useHydrated } from "@/src/lib/hotel-store/store";
import RoomDetailsClient from "./RoomDetailsClient";

/** Room types are edited in the admin panel, so the room is looked up in the store on the client. */
export default function RoomDetailsLoader({ roomId }: { roomId: string }) {
  const hotel = useHotelSite();
  const hydrated = useHydrated();
  const room = hotel.rooms.find((r) => r.id === roomId);

  if (!room) {
    // Before hydration only the seeded rooms are known; a room added in the admin appears a moment later.
    if (!hydrated) return null;
    return (
      <div className="container py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <BedDouble className="size-6" />
          </span>
          <p className="font-semibold text-neutral-900">This room isn&rsquo;t available</p>
          <p className="text-sm text-neutral-500">It may have been renamed or taken off the website.</p>
          <Link href="/hotel-management/rooms" className="mt-1 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">
            Browse rooms
          </Link>
        </div>
      </div>
    );
  }

  // Keyed so switching to another room resets the page state.
  return <RoomDetailsClient key={room.id} hotel={hotel} room={room} />;
}
