"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { parseYmd, ymd } from "@/src/lib/turf-store/format";

/**
 * Month calendar in a popover, for dates the quick-pick chips don't reach. Days outside the booking
 * window and fully booked days can't be picked; booked-out ones are struck through so a busy month reads as busy.
 */
export default function DateCalendar({
  value,
  first,
  last,
  isFull,
  onChange,
  children,
}: {
  value: string;
  /** First and last bookable days (yyyy-mm-dd). */
  first: string;
  last: string;
  isFull: (day: string) => boolean;
  onChange: (day: string) => void;
  /** The trigger button. */
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [from, to] = [parseYmd(first), parseYmd(last)];
  // Only days inside the window can be "booked out"; past days are simply unavailable.
  const full = (d: Date) => d >= from && d <= to && isFull(ymd(d));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="end" className="w-auto rounded-2xl border-neutral-200 bg-white p-3 shadow-xl">
        <DayPicker
          mode="single"
          required
          selected={parseYmd(value)}
          defaultMonth={parseYmd(value)}
          onSelect={(d) => {
            onChange(ymd(d));
            setOpen(false);
          }}
          startMonth={from}
          endMonth={to}
          disabled={[{ before: from }, { after: to }, full]}
          modifiers={{ full }}
          modifiersClassNames={{
            selected: "[&>button]:bg-emerald-800 [&>button]:text-white [&>button]:hover:bg-emerald-800",
            today: "[&>button]:font-bold",
            full: "[&>button]:line-through",
          }}
          classNames={{
            months: "relative",
            month_caption: "flex h-9 items-center px-1 text-sm font-semibold text-neutral-900",
            nav: "absolute right-0 top-0 flex gap-1",
            button_previous: "flex size-9 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 disabled:opacity-30",
            button_next: "flex size-9 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 disabled:opacity-30",
            month_grid: "mt-2 border-collapse",
            weekday: "size-10 text-xs font-medium text-neutral-500",
            day: "p-0.5",
            day_button:
              "flex size-10 items-center justify-center rounded-lg text-sm tabular-nums text-neutral-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent",
            outside: "invisible",
          }}
          components={{
            Chevron: ({ orientation }) => (orientation === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />),
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
