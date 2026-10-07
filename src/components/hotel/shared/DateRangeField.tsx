"use client";

import { useState, useSyncExternalStore } from "react";
import { differenceInCalendarDays, format, startOfToday } from "date-fns";
import { LogIn, LogOut, Moon } from "lucide-react";
import { Calendar } from "@/src/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";

const subscribeToWidth = (onChange: () => void) => {
  const query = window.matchMedia("(min-width: 768px)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

function Half({
  icon: Icon,
  label,
  date,
  active,
  compact,
}: {
  icon: typeof LogIn;
  label: string;
  date: Date | null;
  active: boolean;
  compact: boolean;
}) {
  return (
    <span
      className={`flex min-w-0 items-center transition ${
        compact ? "gap-2 rounded-xl p-2.5" : "gap-2.5 rounded-2xl px-3 py-2"
      } ${
        active ? "bg-white shadow-md ring-2 ring-sky-400" : "bg-white ring-1 ring-neutral-900/10"
      }`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ${
          compact ? "size-8" : "size-9"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          {label}
        </span>
        <span
          className={`block truncate text-sm font-bold ${
            date ? "text-neutral-900" : "text-neutral-400"
          }`}
        >
          {date ? (
            <>
              <span className="sm:hidden">{format(date, "dd MMM")}</span>
              <span className="hidden sm:inline">{format(date, "EEE, dd MMM")}</span>
            </>
          ) : (
            "Add date"
          )}
        </span>
      </span>
    </span>
  );
}

/** Check-in and check-out picked together on one range calendar, with the night count in view. */
export default function DateRangeField({
  checkIn,
  checkOut,
  onChange,
  open: controlledOpen,
  onOpenChange,
  compact = false,
}: {
  checkIn: Date | null;
  checkOut: Date | null;
  onChange: (checkIn: Date | null, checkOut: Date | null) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Narrow layout for sidebars: smaller icons, no night badge between the halves. */
  compact?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const wide = useSyncExternalStore(
    subscribeToWidth,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true
  );

  const nights = checkIn && checkOut ? differenceInCalendarDays(checkOut, checkIn) : 0;

  const handleDayClick = (day: Date) => {
    // A finished stay, or a click on/before check-in, starts a new selection.
    if (!checkIn || checkOut || day <= checkIn) {
      onChange(day, null);
      return;
    }
    onChange(checkIn, day);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`group grid w-full items-center text-left ${
            compact ? "grid-cols-2 gap-1" : "grid-cols-[1fr_auto_1fr]"
          }`}
        >
          <Half icon={LogIn} label="Check-in" date={checkIn} active={open && !checkIn} compact={compact} />
          {!compact && (
            <span className="relative flex h-full items-center justify-center px-1">
              {nights > 0 && (
                <span className="relative hidden sm:flex items-center gap-1 whitespace-nowrap rounded-full bg-sky-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm ring-1 ring-sky-600">
                  <Moon className="size-3" /> {nights} night{nights !== 1 ? "s" : ""}
                </span>
              )}
            </span>
          )}
          <Half
            icon={LogOut}
            label="Check-out"
            date={checkOut}
            active={open && Boolean(checkIn) && !checkOut}
            compact={compact}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={10} className="w-auto rounded-2xl p-0 shadow-xl">
        <Calendar
          mode="range"
          numberOfMonths={wide ? 2 : 1}
          selected={{ from: checkIn ?? undefined, to: checkOut ?? undefined }}
          onDayClick={handleDayClick}
          disabled={{ before: startOfToday() }}
          defaultMonth={checkIn ?? undefined}
          autoFocus
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3">
          <p className="text-sm text-neutral-600">
            {!checkIn ? (
              "Select your check-in date"
            ) : !checkOut ? (
              <>
                <span className="font-semibold text-neutral-900">{format(checkIn, "EEE, dd MMM")}</span> →
                select check-out
              </>
            ) : (
              <>
                <span className="font-semibold text-neutral-900">
                  {format(checkIn, "dd MMM")} – {format(checkOut, "dd MMM")}
                </span>{" "}
                &middot; {nights} night{nights !== 1 ? "s" : ""}
              </>
            )}
          </p>
          <div className="flex gap-2">
            {checkIn && (
              <button
                type="button"
                onClick={() => onChange(null, null)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Done
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
