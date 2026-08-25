"use client";

import { Users, BedDouble, Maximize, CheckCircle2, XCircle } from "lucide-react";
import type { RoomType } from "@/src/data/hotels";
import { Button } from "@/src/components/ui/button";

export default function RoomList({
  rooms,
  selectedRoomId,
  onSelect,
  checking,
}: {
  rooms: RoomType[];
  selectedRoomId: string | null;
  onSelect: (room: RoomType) => void;
  checking: boolean;
}) {
  return (
    <div className="space-y-4">
      {rooms.map((room) => {
        const isSelected = selectedRoomId === room.id;
        const isAvailable = room.available > 0;

        return (
          <div
            key={room.id}
            className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row ${
              isSelected ? "border-sky-600 bg-sky-50/50" : "border-neutral-100"
            }`}
          >
            <img
              src={room.image}
              alt={room.name}
              className="h-40 w-full rounded-lg object-cover sm:h-auto sm:w-48 sm:shrink-0"
            />

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-neutral-900">{room.name}</p>
                  {checking && isSelected ? (
                    <span className="text-xs text-neutral-400">Checking availability…</span>
                  ) : isAvailable ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <CheckCircle2 className="size-3.5" />
                      {room.available} room{room.available !== 1 ? "s" : ""} left
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                      <XCircle className="size-3.5" />
                      Sold out
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Maximize className="size-3.5" /> {room.size}
                  </span>
                  <span className="flex items-center gap-1">
                    <BedDouble className="size-3.5" /> {room.beds}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" /> Up to {room.capacity} guests
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {room.amenities.map((a) => (
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
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-neutral-900">
                      BDT {room.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-400 line-through">
                      BDT {room.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">per night</p>
                </div>

                <Button
                  onClick={() => onSelect(room)}
                  disabled={!isAvailable}
                  className={
                    isSelected
                      ? "bg-sky-800 hover:bg-sky-900"
                      : "bg-sky-700 hover:bg-sky-800"
                  }
                >
                  {isSelected ? "Selected" : "Select Room"}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
