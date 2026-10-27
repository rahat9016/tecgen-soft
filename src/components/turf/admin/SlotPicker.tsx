"use client";

import { useState } from "react";
import { CalendarDays, Minus, Plus } from "lucide-react";
import { addDays, dateLabel, hourLabel, slotTime, taka, todayYmd } from "@/src/lib/turf-store/format";
import { conflictMessage, findConflict, freeSlots, groundOf, hoursOf, slotInfo, useNow, useTurfDB, type Conflict } from "@/src/lib/turf-store/store";
import { useT } from "@/src/lib/turf-store/i18n";
import { cn } from "@/src/lib/utils";
import DateCalendar from "../DateCalendar";

/** Days shown as chips before the calendar takes over — same as the booking site's quick-book card. */
const QUICK_DAYS = 4;
const chip = "flex h-14 min-w-0 flex-col items-center justify-center rounded-xl transition";
const chipOn = "bg-emerald-800 text-white";
const chipOff = "bg-neutral-100 text-neutral-800 hover:bg-emerald-50";
/** One-tap lengths; anything else goes through Custom. */
const PRESETS = [1, 2, 3];
const segment = "min-w-0 whitespace-nowrap rounded-lg px-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-30 sm:min-w-14 sm:px-3";
/** "7:00 PM", as on the booking site's kick-off grid. */
const clock = (h: number) => {
  const hh = h % 24;
  return `${hh % 12 === 0 ? 12 : hh % 12}:00 ${hh < 12 ? "AM" : "PM"}`;
};

function Step({ n, show }: { n: number; show: boolean }) {
  if (!show) return null;
  return <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-lime-400 text-xs font-bold text-emerald-950">{n}</span>;
}

/**
 * Date, duration and kick-off time, laid out like the booking site so staff and customers pick a slot the
 * same way: every hour of the chosen length lights up, and a start that can't fit that length shrinks it.
 * Used by the new-booking page and the reschedule dialog.
 */
export default function SlotPicker({
  date,
  start,
  duration,
  onDate,
  onStart,
  onDuration,
  conflict,
  bookingId,
  allowNowHour,
  numbered = true,
  className,
}: {
  date: string;
  start: number | null;
  duration: number;
  onDate: (d: string) => void;
  onStart: (h: number) => void;
  onDuration: (n: number) => void;
  conflict: Conflict | null;
  /** The booking being moved: its own hours count as free. */
  bookingId?: string;
  /** Walk-ins may take the hour that is being played right now. */
  allowNowHour?: boolean;
  /** Number the Date and kick-off steps; off where the page already numbers its sections. */
  numbered?: boolean;
  /** Extra classes for the kick-off grid, e.g. more columns on a wide page. */
  className?: string;
}) {
  const db = useTurfDB();
  const now = useNow(30_000);
  const t = useT();
  const [custom, setCustom] = useState(!PRESETS.includes(duration));
  const ground = groundOf(db);
  if (!ground) return null;

  const { settings } = db;
  const today = todayYmd();
  // The admin shell renders pages only after hydration, so `now` is the real clock here.
  const thisHour = new Date(now).getHours();
  const last = addDays(today, settings.bookingWindowDays - 1);
  // Staff can book longer than customers (tournaments, events) — up to the whole opening day.
  const maxHours = settings.closeHour - settings.openHour;
  const days = Array.from({ length: QUICK_DAYS }, (_, i) => addDays(today, i));
  const later = !days.includes(date);
  // Hours already started are dropped, except the one being played when a walk-in can still take it.
  const nowHour = (h: number) => !!allowNowHour && date === today && h === thisHour;
  const hours = hoursOf(settings).filter((h) => slotTime(date, h) > now || nowHour(h));
  const fits = (h: number, d: number) => !findConflict(db, { courtId: ground.id, date, startHour: h, duration: d }, { now, ignoreBookingId: bookingId, allowPast: nowHour(h) });

  /** State of one hour on its own: open to start a game, or taken (and why). */
  const cell = (h: number) => {
    const info = slotInfo(db, ground, date, h, now, "");
    const own = info.kind === "booked" && info.booking.id === bookingId;
    const open = own || info.kind === "free" || (info.kind === "past" && nowHour(h));
    const note = t(open ? "Available" : info.kind === "blocked" ? "Closed" : info.kind === "held" ? "Being paid" : "Booked");
    return { open, note };
  };

  const pick = (h: number) => {
    onStart(h);
    // Keep the chosen length if it still fits from here, otherwise shrink to what does.
    let d = duration;
    while (d > 1 && !fits(h, d)) d--;
    if (d !== duration) onDuration(d);
  };

  const groups = [
    { label: "Morning & Afternoon", rate: ground.price, hs: hours.filter((h) => h < settings.peakStartHour) },
    { label: "Evening", rate: ground.peakPrice, hs: hours.filter((h) => h >= settings.peakStartHour) },
  ];

  return (
    <div className="space-y-5">
      <div role="group" aria-labelledby="sp-date">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p id="sp-date" className="flex items-center text-sm font-medium text-neutral-800">
            <Step n={1} show={numbered} /> {t("Date")}
          </p>
          <span className="text-sm text-neutral-500">{dateLabel(date)}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {days.map((d, i) => {
            const on = d === date;
            return (
              <button
                key={d}
                type="button"
                onClick={() => onDate(d)}
                aria-pressed={on}
                aria-label={dateLabel(d, { weekday: "long", day: "numeric", month: "long" })}
                className={cn(chip, on ? chipOn : chipOff)}
              >
                <span className={cn("text-[11px] font-medium", on ? "text-white/75" : "text-neutral-500")}>{i === 0 ? t("Today") : dateLabel(d, { weekday: "short" })}</span>
                <span className="text-lg font-semibold leading-tight tabular-nums">{dateLabel(d, { day: "numeric" })}</span>
              </button>
            );
          })}
          <DateCalendar value={date} first={today} last={date > last ? date : last} isFull={(d) => freeSlots(db, ground, d, now) === 0} onChange={onDate}>
            <button type="button" aria-label={t("Pick a later date")} aria-pressed={later} className={cn(chip, "gap-1", later ? chipOn : chipOff)}>
              <CalendarDays className="size-4" />
              <span className="text-[11px] font-medium">{later ? dateLabel(date, { day: "numeric", month: "short" }) : t("More")}</span>
            </button>
          </DateCalendar>
        </div>
      </div>

      <div>
        {/* Phones: label on its own line and the four lengths share the full width. */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <p className="text-sm font-medium text-neutral-800">{t("Duration")}</p>
          <div className="grid h-11 grid-cols-4 gap-1 rounded-xl bg-neutral-100 p-1 sm:flex sm:h-10">
            {PRESETS.map((d) => {
              const on = !custom && d === duration;
              return (
                <button
                  key={d}
                  type="button"
                  // Once a kick-off is picked, lengths that would run into another booking are off.
                  disabled={start !== null && !fits(start, d)}
                  onClick={() => {
                    setCustom(false);
                    onDuration(d);
                  }}
                  aria-pressed={on}
                  className={cn(segment, on ? "bg-emerald-800 text-white" : "text-neutral-600 hover:bg-white")}
                >
                  {t("{n} hr", { n: d })}
                </button>
              );
            })}
            <button type="button" onClick={() => setCustom(true)} aria-pressed={custom} className={cn(segment, custom ? "bg-emerald-800 text-white" : "text-neutral-600 hover:bg-white")}>
              {t("Custom")}
            </button>
          </div>
        </div>
        {custom && (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2">
            <p className="text-sm text-neutral-600">{t("Hours")}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDuration(Math.max(1, duration - 1))}
                disabled={duration <= 1}
                aria-label={t("One hour less")}
                className="flex size-9 items-center justify-center rounded-lg bg-white text-neutral-700 ring-1 ring-neutral-200 transition hover:ring-emerald-500 disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-16 text-center text-sm font-semibold tabular-nums text-neutral-900">{t(duration === 1 ? "{n} hr" : "{n} hrs", { n: duration })}</span>
              <button
                type="button"
                onClick={() => onDuration(Math.min(maxHours, duration + 1))}
                disabled={duration >= maxHours || (start !== null && !fits(start, duration + 1))}
                aria-label={t("One hour more")}
                className="flex size-9 items-center justify-center rounded-lg bg-white text-neutral-700 ring-1 ring-neutral-200 transition hover:ring-emerald-500 disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div role="group" aria-labelledby="sp-time">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p id="sp-time" className="flex items-center text-sm font-medium text-neutral-800">
            <Step n={2} show={numbered} /> {t("Pick your kick-off")}
          </p>
          <div className="flex items-center gap-3 text-xs text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full border border-neutral-300" /> {t("Available")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-lime-400" /> {t("Selected")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-neutral-200" /> {t("Booked")}
            </span>
          </div>
        </div>

        {hours.length === 0 ? (
          <p className="mt-3 rounded-lg bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-600">
            {t("No kick-off times left on this day.")}{" "}
            <button type="button" onClick={() => onDate(addDays(date, 1))} className="font-semibold text-emerald-800 underline">
              {t("See the next day")}
            </button>
          </p>
        ) : (
          groups.map(
            (g) =>
              g.hs.length > 0 && (
                <div key={g.label} className="mt-4">
                  <p className="mb-2 flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-semibold text-neutral-800">{t(g.label)}</span>
                    <span className="text-xs text-neutral-500">{t("{amount}/hr", { amount: taka(g.rate) })}</span>
                  </p>
                  <div className={cn("grid grid-cols-3 gap-2 sm:grid-cols-4", className)}>
                    {g.hs.map((h) => {
                      const { open, note } = cell(h);
                      const selected = start !== null && h >= start && h < start + duration;
                      return (
                        <button
                          key={h}
                          type="button"
                          disabled={!open}
                          onClick={() => pick(h)}
                          aria-pressed={selected}
                          className={cn(
                            "rounded-lg border px-1.5 py-2.5 text-center transition disabled:cursor-not-allowed",
                            selected ? "border-lime-400 bg-lime-400 text-emerald-950" : open ? "border-neutral-200 bg-white text-neutral-900 hover:border-emerald-700" : "border-transparent bg-neutral-100 text-neutral-400"
                          )}
                        >
                          <span className={cn("block whitespace-nowrap text-sm font-semibold tabular-nums", !open && !selected && "line-through decoration-neutral-300")}>{clock(h)}</span>
                          <span className={cn("mt-0.5 block text-xs leading-tight", selected ? "text-emerald-950/80" : open ? "text-emerald-700" : "text-neutral-400")}>{selected ? t("Selected") : note}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
          )
        )}
        {conflict && start !== null && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            {conflict.kind === "booking"
              ? t("{hours} from {time} clashes with {code}.", { hours: t(duration === 1 ? "{n} hr" : "{n} hrs", { n: duration }), time: hourLabel(start), code: conflict.booking.code })
              : t(conflictMessage(conflict))}
          </p>
        )}
      </div>
    </div>
  );
}
