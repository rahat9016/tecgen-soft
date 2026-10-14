"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dateLabel, nightsBetween, shiftDay, statusBar, statusLabels, todayKey } from "@/src/lib/hotel-store/format";
import { effectiveCheckOut, freeRooms, isLive, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Booking, BookingStatus } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, AdminHeader, hbtn } from "./ui";

const spans = [7, 14, 30] as const;

/** Night columns (0-based) a booking covers inside the visible window, or null if it's outside. */
function place(b: Booking, start: string, days: number) {
  const end = shiftDay(start, days);
  const out = effectiveCheckOut(b);
  if (b.checkIn >= end || out <= start) return null;
  const from = b.checkIn < start ? 0 : nightsBetween(start, b.checkIn);
  const to = out > end ? days : nightsBetween(start, out);
  return { col: from, span: Math.max(1, to - from), clippedLeft: b.checkIn < start, clippedRight: out > end };
}

export default function CalendarBoard() {
  const db = useHotelDB();
  const router = useRouter();
  const today = todayKey();
  const [start, setStart] = useState(shiftDay(today, -1));
  const [days, setDays] = useState<(typeof spans)[number]>(14);
  const dates = Array.from({ length: days }, (_, i) => shiftDay(start, i));
  const visible = db.bookings.filter((b) => isLive(b));
  const cols = `minmax(108px, 136px) repeat(${days}, minmax(${days > 14 ? 34 : 52}px, 1fr))`;

  const bar = (b: Booking, p: NonNullable<ReturnType<typeof place>>, row: number) => (
    <Link
      key={`${b.id}-${row}`}
      href={`${ADMIN}/bookings/${b.id}`}
      title={`${b.code} · ${b.guest.name} · ${dateLabel(b.checkIn, "dd MMM")} → ${dateLabel(b.checkOut, "dd MMM")} · ${statusLabels[b.status]}`}
      style={{ gridColumn: `${p.col + 1} / span ${p.span}`, gridRow: row }}
      className={cn(
        "z-10 mx-0.5 my-1 flex min-w-0 items-center overflow-hidden whitespace-nowrap px-2 text-[11px] font-semibold ring-1 ring-inset transition hover:brightness-95",
        statusBar[b.status],
        p.clippedLeft ? "rounded-l-none" : "rounded-l-md",
        p.clippedRight ? "rounded-r-none" : "rounded-r-md"
      )}
    >
      <span className="truncate">
        {b.guest.name.replace(/^(Mr|Ms|Mrs|Dr)\s+/, "")}
        {days <= 14 && <span className="ml-1 font-normal opacity-70">{b.code}</span>}
      </span>
    </Link>
  );

  return (
    <div>
      <AdminHeader
        title="Calendar"
        subtitle="Every room, every night. Click a bar to open the booking, or an empty night to book it."
        actions={
          <>
            <div className="flex rounded-md border border-neutral-200 bg-white p-0.5">
              {spans.map((s) => (
                <button key={s} onClick={() => setDays(s)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium", days === s ? "bg-sky-600 text-white" : "text-neutral-600")}>
                  {s} days
                </button>
              ))}
            </div>
            <button onClick={() => setStart(shiftDay(start, -Math.min(7, days)))} aria-label="Earlier" className={hbtn.outline}>
              <ChevronLeft className="size-4" />
            </button>
            <button onClick={() => setStart(shiftDay(today, -1))} className={hbtn.outline}>
              Today
            </button>
            <button onClick={() => setStart(shiftDay(start, Math.min(7, days)))} aria-label="Later" className={hbtn.outline}>
              <ChevronRight className="size-4" />
            </button>
            <input type="date" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} aria-label="Start date" className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm" />
          </>
        }
      />

      <div className="mb-3 flex flex-wrap gap-3 text-xs text-neutral-600">
        {(["pending", "confirmed", "checked-in", "checked-out"] as BookingStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-5 rounded ring-1 ring-inset", statusBar[s])} /> {statusLabels[s]}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded bg-neutral-200 [background-image:repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(0,0,0,.08)_3px,rgba(0,0,0,.08)_6px)]" /> Out of service
        </span>
      </div>

      <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
        <div className="grid min-w-max" style={{ gridTemplateColumns: cols }}>
          {/* Header */}
          <div className="sticky left-0 z-20 border-b border-r border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-500">Room</div>
          {dates.map((d) => {
            const weekend = [5, 6].includes(new Date(`${d}T00:00`).getDay());
            return (
              <div key={d} className={cn("border-b border-r border-neutral-100 px-1 py-2 text-center text-[11px]", d === today ? "bg-sky-600 text-white" : weekend ? "bg-amber-50/60 text-neutral-600" : "bg-neutral-50 text-neutral-500")}>
                <p className="font-semibold">{dateLabel(d, "EEE")}</p>
                <p>{dateLabel(d, "dd MMM")}</p>
              </div>
            );
          })}

          {db.roomTypes.map((t) => {
            const units = db.units.filter((u) => u.typeId === t.id);
            const unassigned = visible.filter((b) => b.roomTypeId === t.id && b.unitIds.length < b.rooms && place(b, start, days));
            return (
              <Fragment key={t.id}>
                {/* Type header with free count per night */}
                <div className="sticky left-0 z-20 border-b border-r border-neutral-200 bg-sky-50 px-3 py-1.5">
                  <p className="truncate text-xs font-bold text-sky-900">{t.name}</p>
                  <p className="text-[10px] text-sky-700">{units.length} rooms · free</p>
                </div>
                {dates.map((d) => {
                  const free = freeRooms(db, t.id, d, shiftDay(d, 1));
                  return (
                    <div key={d} className={cn("flex items-center justify-center border-b border-r border-sky-100 bg-sky-50 text-xs font-semibold", free === 0 ? "text-rose-600" : "text-sky-800")}>
                      {free}
                    </div>
                  );
                })}

                {units.map((u) => (
                  <div key={u.id} className="contents">
                    <div className="sticky left-0 z-20 flex items-center gap-2 border-b border-r border-neutral-200 bg-white px-3 py-2" style={{ gridColumn: 1 }}>
                      <span className="text-sm font-bold text-neutral-900">{u.number}</span>
                      {u.housekeeping === "dirty" && <span className="size-1.5 rounded-full bg-amber-500" title="Needs cleaning" />}
                    </div>
                    <div className="grid" style={{ gridColumn: "2 / -1", gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))` }}>
                      {dates.map((d, i) => (
                        <button
                          key={d}
                          type="button"
                          aria-label={`Book room ${u.number} from ${d}`}
                          disabled={u.outOfService || d < today}
                          onClick={() => router.push(`${ADMIN}/bookings/new?type=${t.id}&unit=${u.id}&checkIn=${d}&checkOut=${shiftDay(d, 1)}`)}
                          style={{ gridColumn: i + 1, gridRow: 1 }}
                          className={cn(
                            "h-11 border-b border-r border-neutral-100 transition enabled:hover:bg-sky-50",
                            d === today && "bg-sky-50/50",
                            u.outOfService && "bg-neutral-100 [background-image:repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,.05)_4px,rgba(0,0,0,.05)_8px)]"
                          )}
                        />
                      ))}
                      {visible
                        .filter((b) => b.unitIds.includes(u.id))
                        .map((b) => {
                          const p = place(b, start, days);
                          return p ? bar(b, p, 1) : null;
                        })}
                    </div>
                  </div>
                ))}

                {unassigned.length > 0 && (
                  <div className="contents">
                    <div className="sticky left-0 z-20 flex items-center border-b border-r border-neutral-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800" style={{ gridColumn: 1 }}>
                      Unassigned ({unassigned.length})
                    </div>
                    <div className="grid bg-amber-50/30" style={{ gridColumn: "2 / -1", gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))`, gridAutoRows: "2.25rem" }}>
                      {unassigned.map((b, row) => {
                        const p = place(b, start, days)!;
                        return bar(b, p, row + 1);
                      })}
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
