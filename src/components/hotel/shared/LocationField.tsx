"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { destinations } from "@/src/data/hotelHome";
import { hotels } from "@/src/data/hotels";

const suggestions = [
  ...destinations.map((d) => ({ label: d.name, type: "Destination" })),
  ...hotels.map((h) => ({ label: h.name, type: "Hotel" })),
];

export default function LocationField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = suggestions.filter((s) =>
    s.label.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <label className="text-xs font-medium text-neutral-500">Where are you going?</label>
      <div className="mt-1 flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2">
        <MapPin className="size-4 shrink-0 text-neutral-400" />
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search location or hotel"
          className="h-auto border-0 p-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {open && value && filtered.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border border-neutral-100 bg-white py-1 shadow-lg">
          {filtered.map((s) => (
            <li key={s.label}>
              <button
                type="button"
                onClick={() => {
                  onChange(s.label);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-neutral-50"
              >
                <span className="text-neutral-800">{s.label}</span>
                <span className="text-xs text-neutral-400">{s.type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
