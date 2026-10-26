"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { useElementSize } from "@/src/hooks/useElementSize";
import { addDays, dateLabel, hourLabel, rangeLabel, slotTime, taka, todayYmd } from "@/src/lib/turf-store/format";
import { conflictMessage, findConflict, hoursOf, quote, useHydrated, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { Court } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";

const field =
  "relative flex h-12 w-full items-center rounded-xl bg-neutral-100 pl-10 pr-3 text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500";

/** Hero booking card: shows which start times are free as the visitor picks, then hands off to the slot page. */
export default function QuickBook() {
  const db = useTurfDB();
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
    const conflict = findConflict(db, { courtId: candidates[0].id, date: day, startHour: hour, duration }, { now });
    const taken = conflict?.kind === "booking" || conflict?.kind === "hold" || conflict?.kind === "block";
    const message = taken ? `${hourLabel(hour)} is already taken.` : conflict ? conflictMessage(conflict) : "";
    // Point the visitor at the next start time that works.
    const next = hours.find((h) => h > hour && freeAt.get(h));
    return { ok: false as const, message, next };
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
      <div className="px-2 pb-4 pt-1">
        <p className="text-xl font-semibold leading-snug text-white">Check a free slot in 2 steps</p>
        <p className="mt-1 text-sm text-white/75">Pick a day and a start time — we show what&apos;s free right now.</p>
      </div>
      <motion.div
        initial={false}
        animate={{ height: bodyHeight || "auto" }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease }}
        className="overflow-hidden rounded-2xl bg-white"
      >
        <div ref={bodyRef} className="space-y-5 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qb-date" className="mb-2 flex items-center text-sm font-medium text-neutral-800">
                <Step n={1} /> Date
              </label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-neutral-500" />
                <select id="qb-date" value={day} onChange={(e) => setDate(e.target.value)} className={field}>
                  {days.map((d, i) => (
                    <option key={d} value={d}>
                      {i === 0 ? "Today" : i === 1 ? "Tomorrow" : dateLabel(d)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <p className="mb-2 flex h-5 items-center text-sm font-medium text-neutral-800">Duration</p>
              <div className="flex h-12 gap-1 rounded-xl bg-neutral-100 p-1">
                {Array.from({ length: settings.maxDuration }, (_, i) => i + 1).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    aria-pressed={d === duration}
                    className={cn(
                      "flex-1 rounded-lg text-sm font-medium transition",
                      d === duration ? "bg-emerald-800 text-white" : "text-neutral-600 hover:bg-white"
                    )}
                  >
                    {d} hr
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div role="group" aria-labelledby="qb-time">
            <div className="mb-2 flex items-center justify-between">
              <p id="qb-time" className="flex items-center text-sm font-medium text-neutral-800">
                <Step n={2} /> Start time
              </p>
              {hydrated && hours.length > 0 && (
                <span className={cn("text-sm font-medium", freeCount ? "text-emerald-700" : "text-rose-600")}>
                  {freeCount ? `${freeCount} free` : "Fully booked"}
                </span>
              )}
            </div>
            {hours.length === 0 && (
              <p className="rounded-xl bg-neutral-50 px-3 py-3 text-sm text-neutral-600">
                No start times left today.{" "}
                <button onClick={() => setDate(addDays(todayYmd(), 1))} className="font-semibold text-emerald-800 underline">
                  See tomorrow
                </button>
              </p>
            )}
            <div key={day} className="grid grid-cols-4 gap-2">
              {hours.map((h, i) => {
                const ok = !!freeAt.get(h);
                const peak = h >= settings.peakStartHour;
                const selected = h === hour;
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
                    aria-pressed={selected}
                    aria-label={`${hourLabel(h)}${ok ? "" : ", taken"}${peak ? ", peak rate" : ""}`}
                    className={cn(
                      "relative h-11 rounded-xl text-sm font-medium transition disabled:cursor-not-allowed",
                      selected
                        ? ok
                          ? "bg-emerald-800 text-white"
                          : "bg-rose-50 text-rose-600 ring-1 ring-rose-300"
                        : ok
                          ? "bg-neutral-100 text-neutral-800 hover:bg-emerald-50 hover:ring-1 hover:ring-emerald-500"
                          : "bg-neutral-50 text-neutral-300 line-through"
                    )}
                  >
                    {hourLabel(h).toLowerCase()}
                    {peak && ok && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-orange-500" />}
                  </motion.button>
                );
              })}
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-sm text-neutral-500">
              <span className="size-1.5 rounded-full bg-orange-500" /> Peak rate from {hourLabel(settings.peakStartHour)}
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
                  <b>Available</b> · {taka(check.total)} total · {taka(check.advance)} advance to lock it
                </span>
              ) : (
                <span>
                  {check.message}{" "}
                  {check.next !== undefined && (
                    <button onClick={() => setHour(check.next!)} className="font-semibold underline">
                      Try {hourLabel(check.next)}
                    </button>
                  )}
                </span>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
      <button onClick={go} className="mt-4 h-13 w-full rounded-2xl bg-white text-base font-semibold text-emerald-950 transition hover:bg-lime-300">
        {check?.ok ? `Book ${rangeLabel(hour, duration)}` : "Check live slots"}
      </button>
      <p className="mt-3 text-center text-sm text-white/75">Next: enter your name &amp; phone, then pay {settings.advancePercent}% advance to lock it.</p>
    </div>
  );
}

function Step({ n }: { n: number }) {
  return <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-lime-400 text-xs font-bold text-emerald-950">{n}</span>;
}
