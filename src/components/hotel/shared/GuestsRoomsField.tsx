"use client";

import { Minus, Plus, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";

export interface GuestsRoomsValue {
  adults: number;
  children: number;
  rooms: number;
}

const counters: { key: keyof GuestsRoomsValue; label: string; min: number }[] = [
  { key: "adults", label: "Adults", min: 1 },
  { key: "children", label: "Children", min: 0 },
  { key: "rooms", label: "Rooms", min: 1 },
];

export default function GuestsRoomsField({
  value,
  onChange,
}: {
  value: GuestsRoomsValue;
  onChange: (value: GuestsRoomsValue) => void;
}) {
  const update = (key: keyof GuestsRoomsValue, delta: number, min: number) => {
    onChange({ ...value, [key]: Math.max(min, value[key] + delta) });
  };

  return (
    <div>
      <label className="text-xs font-medium text-neutral-500">Guests &amp; Rooms</label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="mt-1 flex h-9 w-full items-center gap-1.5 rounded-md border border-neutral-200 bg-transparent px-3 text-left text-sm text-neutral-900"
          >
            <Users className="size-3.5 shrink-0 text-neutral-400" />
            <span className="truncate">
              {value.adults + value.children} Guest{value.adults + value.children !== 1 ? "s" : ""},{" "}
              {value.rooms} Room{value.rooms !== 1 ? "s" : ""}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-4" align="start">
          {counters.map(({ key, label, min }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">{label}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => update(key, -1, min)}
                  disabled={value[key] <= min}
                  className="flex size-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 disabled:opacity-30"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-4 text-center text-sm font-medium">{value[key]}</span>
                <button
                  type="button"
                  onClick={() => update(key, 1, min)}
                  className="flex size-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
