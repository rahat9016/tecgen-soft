"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, LayoutGrid, XCircle } from "lucide-react";
import { addDays, dateLabel, hourLabel, rangeLabel, slotTime, sportLabels, taka, todayYmd } from "@/src/lib/turf-store/format";
import { conflictMessage, findConflict, hoursOf, quote, useHydrated, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { Court, Sport } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";

const field = "relative flex h-10 w-full items-center rounded-lg bg-neutral-100 pl-8 pr-3 text-xs text-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500";

/** Hero booking card: shows which start times are free as the visitor picks, then hands off to the slot page. */
export default function QuickBook() {
  const db = useTurfDB();
  const router = useRouter();
  const hydrated = useHydrated();
  const now = useNow(15_000);
  const { settings } = db;
  const courts = db.courts.filter((c) => c.active);
  const sports = [...new Set(courts.map((c) => c.sport))];

  const [sport, setSport] = useState<Sport>("football");
  // "" means any court of the sport: the first one free at the chosen time gets the booking.
  const [courtId, setCourtId] = useState("");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState(-1);
  const [duration, setDuration] = useState(1);

  const sportCourts = courts.filter((c) => c.sport === sport);
  const anyCourt = sportCourts.length > 1;
  const court = sportCourts.find((c) => c.id === courtId) ?? (anyCourt ? undefined : sportCourts[0]);
  const candidates = court ? [court] : sportCourts;
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
    if (pick) return { ok: true as const, court: pick, ...quote(pick, hour, duration, settings) };
    const conflict = findConflict(db, { courtId: candidates[0].id, date: day, startHour: hour, duration }, { now });
    const taken = conflict?.kind === "booking" || conflict?.kind === "hold" || conflict?.kind === "block";
    const message =
      !court && taken ? `Every ${sportLabels[sport].toLowerCase()} court is taken at ${hourLabel(hour)}.` : conflict ? conflictMessage(conflict) : "";
    // Point the visitor at the next start time that works.
    const next = hours.find((h) => h > hour && freeAt.get(h));
    return { ok: false as const, message, next };
  })();

  const go = () => {
    const target = check?.ok ? check.court : (court ?? sportCourts[0]);
    const q = new URLSearchParams({ court: target?.id ?? "", date: day });
    if (check?.ok) q.set("start", String(hour));
    q.set("duration", String(duration));
    router.push(`/turf/book?${q}`);
  };

  return (
    <div className="w-full min-w-0 rounded-3xl bg-white/10 p-3 ring-1 ring-white/20 backdrop-blur-md">
      <p className="px-2 pb-3 pt-1 text-[15px] font-medium leading-snug text-white">
        Discover and book top quality courts effortlessly with <span className="text-lime-400">TurfHub</span>.
      </p>
      <div className="space-y-3 rounded-2xl bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-800">Sport</label>
          <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {sports.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSport(s);
                  setCourtId("");
                }}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition",
                  s === sport ? "bg-emerald-800 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {sportLabels[s]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="qb-court" className="mb-1 block text-xs font-medium text-neutral-800">
            Court
          </label>
          <div className="relative">
            <LayoutGrid className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-neutral-500" />
            <select id="qb-court" value={court?.id ?? ""} onChange={(e) => setCourtId(e.target.value)} className={field}>
              {anyCourt && <option value="">Any {sportLabels[sport].toLowerCase()} court</option>}
              {sportCourts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.size.split(" · ")[0]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="qb-date" className="mb-1 block text-xs font-medium text-neutral-800">
              Date
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-neutral-500" />
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
            <p className="mb-1 block text-xs font-medium text-neutral-800">Duration</p>
            <div className="flex h-10 gap-1 rounded-lg bg-neutral-100 p-1">
              {Array.from({ length: settings.maxDuration }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  aria-pressed={d === duration}
                  className={cn(
                    "flex-1 rounded-md text-xs font-medium transition",
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
          <div className="mb-1 flex items-center justify-between">
            <p id="qb-time" className="text-xs font-medium text-neutral-800">
              Start time
            </p>
            {hydrated && hours.length > 0 && (
              <span className={cn("text-xs", freeCount ? "text-emerald-700" : "text-rose-600")}>
                {freeCount ? `${freeCount} free` : "Fully booked"}
              </span>
            )}
          </div>
          {hours.length === 0 && (
            <p className="rounded-lg bg-neutral-50 px-3 py-2.5 text-xs text-neutral-600">
              No start times left today.{" "}
              <button onClick={() => setDate(addDays(todayYmd(), 1))} className="font-semibold text-emerald-800 underline">
                See tomorrow
              </button>
            </p>
          )}
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {hours.map((h) => {
              const ok = !!freeAt.get(h);
              const peak = h >= settings.peakStartHour;
              const selected = h === hour;
              return (
                <button
                  key={h}
                  disabled={!ok}
                  onClick={() => setHour(h)}
                  aria-pressed={selected}
                  aria-label={`${hourLabel(h)}${ok ? "" : ", taken"}${peak ? ", peak rate" : ""}`}
                  className={cn(
                    "relative h-9 rounded-lg text-xs font-medium transition disabled:cursor-not-allowed",
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
                  {peak && ok && <span className="absolute right-1 top-1 size-1.5 rounded-full bg-orange-500" />}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="size-1.5 rounded-full bg-orange-500" /> Peak rate from {hourLabel(settings.peakStartHour)}
          </p>
        </div>

        {check && (
          <div
            aria-live="polite"
            className={cn("flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs", check.ok ? "bg-lime-50 text-emerald-900" : "bg-rose-50 text-rose-700")}
          >
            {check.ok ? <CheckCircle2 className="mt-px size-4 shrink-0 text-emerald-600" /> : <XCircle className="mt-px size-4 shrink-0" />}
            {check.ok ? (
              <span>
                <b>{court ? "Available" : `${check.court.name} is free`}</b> · {taka(check.total)} total · {taka(check.advance)} advance to lock it
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
          </div>
        )}
      </div>
      <button onClick={go} className="mt-3 h-11 w-full rounded-2xl bg-white text-sm font-semibold text-emerald-950 transition hover:bg-lime-300">
        {check?.ok ? `Book ${rangeLabel(hour, duration)}` : "Check live slots"}
      </button>
    </div>
  );
}
