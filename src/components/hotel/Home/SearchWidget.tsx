"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Landmark, Home, Trees } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import LocationField from "@/src/components/hotel/shared/LocationField";
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
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guests, setGuests] = useState<GuestsRoomsValue>({ adults: 2, children: 0, rooms: 1 });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    params.set("adults", String(guests.adults));
    params.set("children", String(guests.children));
    params.set("rooms", String(guests.rooms));
    params.set("type", activeTab);
    router.push(`/hotel-management/search?${params.toString()}`);
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-xl md:p-6">
      <div className="flex gap-2 overflow-x-auto border-b border-neutral-100 pb-3 text-sm font-medium text-neutral-500">
        {searchTabs.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveTab(label)}
            className={`flex shrink-0 items-center gap-1.5 rounded-t-md px-3 py-2 ${
              activeTab === label
                ? "border-b-2 border-sky-600 text-sky-700"
                : "hover:text-neutral-700"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-end">
        <LocationField value={location} onChange={setLocation} />

        <DatePickerField
          label="Check-in"
          value={checkIn}
          onChange={(date) => {
            setCheckIn(date);
            if (date && (!checkOut || checkOut <= date)) setCheckOut(null);
            setCheckOutOpen(true);
          }}
        />

        <DatePickerField
          label="Check-out"
          value={checkOut}
          onChange={setCheckOut}
          disabledBefore={checkIn ? new Date(checkIn.getTime() + 86400000) : undefined}
          open={checkOutOpen}
          onOpenChange={setCheckOutOpen}
        />

        <GuestsRoomsField value={guests} onChange={setGuests} />

        <Button onClick={handleSearch} className="h-9 bg-sky-700 px-8 hover:bg-sky-800">
          Search
        </Button>
      </div>
    </div>
  );
}
