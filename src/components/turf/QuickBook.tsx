"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, LayoutGrid, Timer, XCircle } from "lucide-react";
import { addDays, dateLabel, hourLabel, sportLabels, taka, todayYmd } from "@/src/lib/turf-store/format";
import { conflictMessage, findConflict, hoursOf, quote, useHydrated, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { Sport } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";

const field = "relative flex h-10 w-full items-center rounded-lg bg-neutral-100 pl-8 pr-3 text-xs text-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500";

/** Hero booking card: answers "is it free?" as the visitor picks, then hands off to the slot page. */
export default function QuickBook() {
  const db = useTurfDB();
  const router = useRouter();
  const hydrated = useHydrated();
  const now = useNow(15_000);
  const courts = db.courts.filter((c) => c.active);
  const sports = [...new Set(courts.map((c) => c.sport))];

  const [sport, setSport] = useState<Sport>("football");
  const [courtId, setCourtId] = useState("");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState(-1);
  const [duration, setDuration] = useState(1);

  const sportCourts = courts.filter((c) => c.sport === sport);
  const court = sportCourts.find((c) => c.id === courtId) ?? sportCourts[0];
  const day = date || (hydrated ? todayYmd() : "");
  const days = hydrated ? Array.from({ length: db.settings.bookingWindowDays }, (_, i) => addDays(todayYmd(), i)) : [];

  const check = (() => {
    if (!court || !day || hour < 0) return null;
    const req = { courtId: court.id, date: day, startHour: hour, duration };
    const conflict = findConflict(db, req, { now });
    if (!conflict) return { ok: true as const, ...quote(court, hour, duration, db.settings) };
    // Point the visitor at the next start time that works on the same court.
    const next = hoursOf(db.settings).find((h) => h > hour && !findConflict(db, { ...req, startHour: h }, { now }));
    return { ok: false as const, message: conflictMessage(conflict), next };
  })();

  const go = () => {
    const q = new URLSearchParams({ court: court?.id ?? "", date: day });
    if (hour >= 0) q.set("start", String(hour));
    q.set("duration", String(duration));
    router.push(`/turf/book?${q}`);
  };

  return (
    <div className="w-full rounded-3xl bg-white/10 p-3 ring-1 ring-white/20 backdrop-blur-md">
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
            <label htmlFor="qb-time" className="mb-1 block text-xs font-medium text-neutral-800">
              Time
            </label>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-neutral-500" />
              <select id="qb-time" value={hour} onChange={(e) => setHour(Number(e.target.value))} className={field}>
                <option value={-1}>Choose time</option>
                {hoursOf(db.settings).map((h) => (
                  <option key={h} value={h}>
                    {hourLabel(h)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-800">Duration</label>
          <div className="flex gap-1.5">
            {Array.from({ length: db.settings.maxDuration }, (_, i) => i + 1).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  "flex h-9 flex-1 items-center justify-center gap-1 rounded-lg text-xs font-medium transition",
                  d === duration ? "bg-emerald-800 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                <Timer className="size-3.5" /> {d} hr
              </button>
            ))}
          </div>
        </div>

        {check && (
          <div
            aria-live="polite"
            className={cn("flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs", check.ok ? "bg-lime-50 text-emerald-900" : "bg-rose-50 text-rose-700")}
          >
            {check.ok ? <CheckCircle2 className="mt-px size-4 shrink-0 text-emerald-600" /> : <XCircle className="mt-px size-4 shrink-0" />}
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
          </div>
        )}
      </div>
      <button onClick={go} className="mt-3 h-11 w-full rounded-2xl bg-white text-sm font-semibold text-emerald-950 transition hover:bg-lime-300">
        {check?.ok ? "Book Court Now" : "Check live slots"}
      </button>
    </div>
  );
}
