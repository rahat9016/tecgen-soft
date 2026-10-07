"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CalendarSearch, Landmark, Home, Trees } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import DatePickerField from "@/src/components/hotel/shared/DatePickerField";
import GuestsRoomsField, {
  type GuestsRoomsValue,
} from "@/src/components/hotel/shared/GuestsRoomsField";

const searchTabs = [
  { label: "Hotels", icon: Building2 },
  { label: "Resorts", icon: Landmark },
  { label: "Cottages", icon: Home },
  { label: "Eco Resorts", icon: Trees },
];

export default function SearchWidget() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Hotels");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guests, setGuests] = useState<GuestsRoomsValue>({ adults: 2, children: 0, rooms: 1 });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    params.set("adults", String(guests.adults));
    params.set("children", String(guests.children));
    params.set("rooms", String(guests.rooms));
    params.set("type", activeTab);
    router.push(`/hotel-management/search?${params.toString()}`);
  };

  return (
    <div className="rounded-3xl bg-white p-3 shadow-2xl shadow-neutral-900/15 ring-1 ring-neutral-900/5 md:p-4">
      <div
        role="tablist"
        aria-label="Property type"
        className="flex w-full gap-1 overflow-x-auto rounded-full bg-neutral-100 p-1 text-sm font-medium text-neutral-600 sm:w-fit"
      >
        {searchTabs.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={activeTab === label}
            onClick={() => setActiveTab(label)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 transition ${
              activeTab === label
                ? "bg-white font-semibold text-sky-700 shadow-sm"
                : "hover:text-neutral-900"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid rounded-2xl border border-neutral-200 bg-neutral-50 p-1.5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
        <div className="border-b border-neutral-200 md:border-b-0 md:border-r">
          <DatePickerField
            variant="inline"
            label="Check-in"
            value={checkIn}
            onChange={(date) => {
              setCheckIn(date);
              if (date && (!checkOut || checkOut <= date)) setCheckOut(null);
              setCheckOutOpen(true);
            }}
          />
        </div>

        <div className="border-b border-neutral-200 md:border-b-0 md:border-r">
          <DatePickerField
            variant="inline"
            label="Check-out"
            value={checkOut}
            onChange={setCheckOut}
            disabledBefore={
              checkIn ? new Date(checkIn.getTime() + 86400000) : undefined
            }
            open={checkOutOpen}
            onOpenChange={setCheckOutOpen}
          />
        </div>

        <div>
          <GuestsRoomsField
            variant="inline"
            value={guests}
            onChange={setGuests}
          />
        </div>

        <Button
          onClick={handleSearch}
          className="mt-1.5 h-13 rounded-xl bg-sky-600 px-8 text-base font-semibold shadow-lg shadow-sky-600/30 hover:bg-sky-700 md:mt-0 md:ml-1.5"
        >
          <CalendarSearch className="size-5" />
          Check Availability
        </Button>
      </div>
    </div>
  );
}
