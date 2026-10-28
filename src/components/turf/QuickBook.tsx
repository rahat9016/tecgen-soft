"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { useElementSize } from "@/src/hooks/useElementSize";
import { addDays, dateLabel, hourLabel, rangeLabel, slotTime, taka, todayYmd } from "@/src/lib/turf-store/format";
import { conflictMessage, findConflict, freeSlots, hoursOf, quote, useHydrated, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { Court } from "@/src/lib/turf-store/types";
import { useT } from "@/src/lib/turf-store/i18n";
import { cn } from "@/src/lib/utils";
import DateCalendar from "./DateCalendar";

/** Days shown as chips before the calendar takes over. */
const QUICK_DAYS = 4;
const chip = "flex h-14 min-w-0 flex-col items-center justify-center rounded-xl transition";
const chipOn = "bg-emerald-800 text-white";
const chipOff = "bg-neutral-100 text-neutral-800 hover:bg-emerald-50";

/** Hero booking card: shows which start times are free as the visitor picks, then hands off to the slot page. */
export default function QuickBook() {
  const db = useTurfDB();
  const tr = useT();
  const router = useRouter();
  const hydrated = useHydrated();
  const now = useNow(15_000);
  const { settings } = db;
  // No ground picker here: if the venue ever has more than one, the first free at the chosen time gets the booking.
  const candidates = db.courts.filter((c) => c.active);

  const [date, setDate] = useState("");
  const [hour, setHour] = useState(-1);
  const [duration, setDuration] = useState(1);
  // The slot list grows and shrinks with the date; the card eases to its new height instead of jumping.
  const { ref: bodyRef, height: bodyHeight } = useElementSize<HTMLDivElement>();
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  const day = date || (hydrated ? todayYmd() : "");
  const days = hydrated ? Array.from({ length: settings.bookingWindowDays }, (_, i) => addDays(todayYmd(), i)) : [];
  // Hours already started are noise late in the day; taken ones stay visible so a busy day reads as busy.
  const later = days.indexOf(day) >= QUICK_DAYS;
  const hours = hoursOf(settings).filter((h) => !hydrated || !day || slotTime(day, h) > now);

  const freeAt = new Map<number, Court | undefined>(
    hours.map((h) => [
      h,
      hydrated && day ? candidates.find((c) => !findConflict(db, { courtId: c.id, date: day, startHour: h, duration }, { now })) : undefined,
    ])
  );
  const freeCount = hours.filter((h) => freeAt.get(h)).length;

  const check = (() => {
    if (!day || hour < 0 || !candidates.length) return null;
    const pick = freeAt.get(hour);
    if (pick)
      return {
        ok: true as const,
        court: pick,
        ...quote(pick, hour, duration, settings),
      };
    // The start hour may be free while a later hour of the game isn't: count how many hours do fit.
    let fits = 0;
    while (fits < duration - 1 && candidates.some((c) => !findConflict(db, { courtId: c.id, date: day, startHour: hour, duration: fits + 1 }, { now }))) fits++;
    const conflict = findConflict(db, { courtId: candidates[0].id, date: day, startHour: hour, duration }, { now });
    const taken = conflict?.kind === "booking" || conflict?.kind === "hold" || conflict?.kind === "block";
    const message = fits
      ? tr("Only {n} hr free from {time}.", { n: fits, time: hourLabel(hour) })
      : taken
        ? tr("{time} is already taken.", { time: hourLabel(hour) })
        : conflict
          ? tr(conflictMessage(conflict))
          : "";
    // Point the visitor at the next start time that works.
    const next = hours.find((h) => h > hour && freeAt.get(h));
    return { ok: false as const, message, fits, next };
  })();

  const go = () => {
    const target = check?.ok ? check.court : candidates[0];
    const q = new URLSearchParams({ court: target?.id ?? "", date: day });
    if (check?.ok) q.set("start", String(hour));
    q.set("duration", String(duration));
    router.push(`/turf/book?${q}`);
  };

  return (
    <div className="w-full min-w-0 rounded-3xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-md">
      <motion.div
        initial={false}
        animate={{ height: bodyHeight || "auto" }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease }}
        className="overflow-hidden rounded-2xl bg-white"
      >
        <div ref={bodyRef} className="space-y-5 p-5">
          <div role="group" aria-labelledby="qb-date">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p id="qb-date" className="flex items-center text-sm font-medium text-neutral-800">
                <Step n={1} /> {tr("Date")}
              </p>
              {day && <span className="text-sm text-neutral-500">{dateLabel(day)}</span>}
            </div>
            {/* The next few days one tap away; anything later through the calendar. */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {days.slice(0, QUICK_DAYS).map((d, i) => {
                const on = d === day;
                return (
                  <button
                    key={d}
                    onClick={() => setDate(d)}
                    aria-pressed={on}
                    aria-label={dateLabel(d, { weekday: "long", day: "numeric", month: "long" })}
                    className={cn(chip, on ? chipOn : chipOff)}
                  >
                    <span className={cn("text-[11px] font-medium", on ? "text-white/75" : "text-neutral-500")}>
                      {i === 0 ? tr("Today") : dateLabel(d, { weekday: "short" })}
                    </span>
                    <span className="text-lg font-semibold leading-tight tabular-nums">{dateLabel(d, { day: "numeric" })}</span>
                  </button>
                );
              })}
              {days.length > QUICK_DAYS && (
                <DateCalendar
                  value={day}
                  first={days[0]}
                  last={days[days.length - 1]}
                  isFull={(d) => candidates.every((c) => freeSlots(db, c, d, now) === 0)}
                  onChange={setDate}
                >
                  <button aria-label={tr("Pick a later date")} aria-pressed={later} className={cn(chip, "gap-1", later ? chipOn : chipOff)}>
                    <CalendarDays className="size-4" />
                    <span className="text-[11px] font-medium">{later ? dateLabel(day, { day: "numeric", month: "short" }) : tr("More")}</span>
                  </button>
                </DateCalendar>
              )}
            </div>
          </div>
          {/* Phones: label on its own line and the lengths share the full width, so longer (Bangla) labels never wrap. */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="text-sm font-medium text-neutral-800">{tr("Duration")}</p>
            <div className="flex h-10 gap-1 rounded-xl bg-neutral-100 p-1">
              {Array.from({ length: settings.maxDuration }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  aria-pressed={d === duration}
                  className={cn(
                    "min-w-0 flex-1 whitespace-nowrap rounded-lg px-2.5 text-sm font-medium transition sm:min-w-14 sm:flex-none sm:px-3",
                    d === duration ? "bg-emerald-800 text-white" : "text-neutral-600 hover:bg-white"
                  )}
                >
                  {tr("{n} hr", { n: d })}
                </button>
              ))}
            </div>
          </div>
          <div role="group" aria-labelledby="qb-time">
            <div className="mb-2 flex items-center justify-between">
              <p id="qb-time" className="flex items-center text-sm font-medium text-neutral-800">
                <Step n={2} /> {tr("Start time")}
              </p>
              {hydrated && hours.length > 0 && (
                <span className={cn("text-sm font-medium", freeCount ? "text-emerald-700" : "text-rose-600")}>
                  {freeCount ? tr("{n} free", { n: freeCount }) : tr("Fully booked")}
                </span>
              )}
            </div>
            {hours.length === 0 && (
              <p className="rounded-xl bg-neutral-50 px-3 py-3 text-sm text-neutral-600">
                {tr("No start times left today.")}{" "}
                <button onClick={() => setDate(addDays(todayYmd(), 1))} className="font-semibold text-emerald-800 underline">
                  {tr("See tomorrow")}
                </button>
              </p>
            )}
            <div key={day} className="grid grid-cols-4 gap-2">
              {hours.map((h, i) => {
                const ok = !!freeAt.get(h);
                const peak = h >= settings.peakStartHour;
                const selected = h === hour;
                // Every hour of a valid pick lights up, not just the kick-off.
                const inGame = !!check?.ok && h >= hour && h < hour + duration;
                return (
                  <motion.button
                    key={h}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: Math.min(i * 0.02, 0.3),
                      ease,
                    }}
                    disabled={!ok}
                    onClick={() => setHour(h)}
                    aria-pressed={selected || inGame}
                    aria-label={`${hourLabel(h)}${ok ? "" : `, ${tr("taken")}`}${peak ? `, ${tr("peak rate")}` : ""}`}
                    className={cn(
                      "relative h-11 rounded-xl text-sm font-medium transition disabled:cursor-not-allowed",
                      inGame
                        ? "bg-emerald-800 text-white disabled:cursor-default"
                        : selected
                          ? "bg-rose-50 text-rose-600 ring-1 ring-rose-300"
                          : ok
                            ? "bg-neutral-100 text-neutral-800 hover:bg-emerald-50 hover:ring-1 hover:ring-emerald-500"
                            : "bg-neutral-50 text-neutral-300 line-through"
                    )}
                  >
                    {hourLabel(h).toLowerCase()}
                    {peak && ok && !inGame && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-orange-500" />}
                  </motion.button>
                );
              })}
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-sm text-neutral-500">
              <span className="size-1.5 rounded-full bg-orange-500" /> {tr("Peak rate from {time}", { time: hourLabel(settings.peakStartHour) })}
            </p>
          </div>

          {check && (
            <motion.div
              key={check.ok ? `ok-${check.court.id}` : "taken"}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease }}
              aria-live="polite"
              className={cn("flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm", check.ok ? "bg-lime-50 text-emerald-900" : "bg-rose-50 text-rose-700")}
            >
              {check.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
              {check.ok ? (
                <span>
                  <b>{tr("Available")}</b> · {tr("{total} total · {advance} advance to lock it", { total: taka(check.total), advance: taka(check.advance) })}
                </span>
              ) : (
                <span>
                  {check.message}{" "}
                  {check.fits ? (
                    <button onClick={() => setDuration(check.fits)} className="font-semibold underline">
                      {tr("Book {n} hr", { n: check.fits })}
                    </button>
                  ) : (
                    check.next !== undefined && (
                      <button onClick={() => setHour(check.next!)} className="font-semibold underline">
                        {tr("Try {time}", { time: hourLabel(check.next) })}
                      </button>
                    )
                  )}
                </span>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
      <button onClick={go} className="mt-4 h-13 w-full rounded-2xl bg-white text-base font-semibold text-emerald-950 transition hover:bg-lime-300">
        {check?.ok ? tr("Book {time}", { time: rangeLabel(hour, duration) }) : tr("Check live slots")}
      </button>
    </div>
  );
}

function Step({ n }: { n: number }) {
  return <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-lime-400 text-xs font-bold text-emerald-950">{n}</span>;
}
