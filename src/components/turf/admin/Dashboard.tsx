"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { ArrowRight, BadgeCheck, Ban, CalendarCheck, Clock, Gauge, Hourglass, Wallet } from "lucide-react";
import { StatCard } from "@/src/components/gadgets/admin/kit";
import { addDays, dateLabel, formatDuration, hourLabel, payLabels, rangeLabel, relativeDay, sportLabels, taka, todayYmd, ymd } from "@/src/lib/turf-store/format";
import { courtLive, dueOf, endMs, hoursOf, occupies, setBookingStatus, startMs, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import { cn } from "@/src/lib/utils";
import { BookingStatusBadge, LiveBadge, LiveDot, SportIcon, tbtn } from "../ui";
import BookingDrawer from "./BookingDrawer";

export default function Dashboard() {
  const db = useTurfDB();
  const now = useNow(1000);
  const today = todayYmd();
  const [openId, setOpenId] = useState<string | null>(null);

  const courts = db.courts.filter((c) => c.active);
  const todays = db.bookings.filter((b) => b.date === today && occupies(b));
  const capacity = courts.length * hoursOf(db.settings).length;
  const booked = todays.reduce((s, b) => s + b.duration, 0);
  const collectedToday = db.bookings
    .flatMap((b) => b.payments)
    .filter((p) => ymd(new Date(p.at)) === today)
    .reduce((s, p) => s + (p.kind === "refund" ? -p.amount : p.amount), 0);
  const pending = db.bookings.filter((b) => b.status === "pending").sort((a, b) => startMs(a) - startMs(b));
  const upcoming = db.bookings
    .filter((b) => (b.status === "confirmed" || b.status === "pending") && startMs(b) > now && startMs(b) - now < 6 * 3600_000)
    .sort((a, b) => startMs(a) - startMs(b));
  const overdue = db.bookings.filter((b) => b.status === "confirmed" && endMs(b) <= now);

  // Revenue by booking date for the last 7 days (completed + in play + confirmed), for the bar chart.
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).map((d) => ({
    d,
    v: db.bookings.filter((b) => b.date === d && occupies(b) && b.status !== "no-show").reduce((s, b) => s + b.total, 0),
  }));
  const max = Math.max(1, ...week.map((w) => w.v));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, front desk</h1>
          <p className="mt-1 text-sm text-neutral-500">{dateLabel(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-2">
          <LiveBadge now={now} />
          <Link href="/turf/admin/schedule" className={tbtn.green}>
            Open schedule <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Bookings today" value={todays.length} hint={`${todays.filter((b) => b.status === "checked-in").length} playing now`} icon={CalendarCheck} tone="green" />
        <StatCard label="Utilisation today" value={`${capacity ? Math.round((booked / capacity) * 100) : 0}%`} hint={`${booked} of ${capacity} court-hours`} icon={Gauge} tone="violet" />
        <StatCard label="Collected today" value={taka(collectedToday)} hint="Advances + balances − refunds" icon={Wallet} tone="neutral" />
        <StatCard label="Awaiting verification" value={pending.length} hint="Online advances to check" icon={Hourglass} tone="orange" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Live courts */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Courts right now</h2>
            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
              <LiveDot /> auto-updating
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {courts.map((c) => {
              const { current, next } = courtLive(db, c.id, now);
              const block = db.blocks.find((b) => b.courtId === c.id && b.date === today && now >= startMs(b) && now < endMs(b));
              const left = current ? endMs(current) - now : 0;
              const pct = current ? 100 - (left / (current.duration * 3600_000)) * 100 : 0;
              return (
                <div key={c.id} className={cn("rounded-2xl border p-3", current ? "border-lime-300 bg-lime-50/60" : "border-neutral-200")}>
                  <div className="flex items-center gap-2">
                    <SportIcon sport={c.sport} className="text-emerald-700" />
                    <p className="truncate text-sm font-semibold text-neutral-900">{c.name}</p>
                    <span
                      className={cn(
                        "ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                        current ? "bg-lime-400 text-emerald-950" : block ? "bg-neutral-200 text-neutral-600" : "bg-emerald-50 text-emerald-700"
                      )}
                    >
                      {current ? "In play" : block ? "Closed" : "Free"}
                    </span>
                  </div>
                  {current ? (
                    <button onClick={() => setOpenId(current.id)} className="mt-2 block w-full text-left">
                      <p className="truncate text-sm text-neutral-800">
                        {current.customer.team ?? current.customer.name} · <span className="text-neutral-500">{current.code}</span>
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded bg-white">
                        <div className="h-full bg-lime-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 flex justify-between text-[11px] text-neutral-500">
                        <span>Ends in {formatDuration(left)}</span>
                        {dueOf(current) > 0 && <span className="font-medium text-rose-600">Due {taka(dueOf(current))}</span>}
                      </p>
                    </button>
                  ) : (
                    <p className="mt-2 text-xs text-neutral-500">{block ? block.reason : "Ready for walk-ins"}</p>
                  )}
                  <p className="mt-2 border-t border-neutral-100 pt-2 text-[11px] text-neutral-500">
                    {next ? (
                      <>
                        Next: <b className="text-neutral-700">{hourLabel(next.startHour)}</b> · {next.customer.name} (in {formatDuration(startMs(next) - now)})
                      </>
                    ) : (
                      "No more bookings today"
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Verification queue */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Verify advance payments</h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{pending.length}</span>
          </div>
          {pending.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500">All caught up — no payments waiting.</p>
          ) : (
            <ul className="space-y-2">
              {pending.slice(0, 6).map((b) => {
                const court = db.courts.find((c) => c.id === b.courtId);
                const pay = b.payments[0];
                return (
                  <li key={b.id} className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                    <button onClick={() => setOpenId(b.id)} className="block w-full text-left">
                      <p className="flex items-center justify-between gap-2 text-sm font-semibold text-neutral-900">
                        <span className="truncate">{b.customer.name}</span>
                        <span>{pay ? taka(pay.amount) : "—"}</span>
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {court?.name} · {relativeDay(b.date)} {rangeLabel(b.startHour, b.duration)}
                      </p>
                      {pay && (
                        <p className="mt-0.5 font-mono text-[11px] text-neutral-600">
                          {payLabels[pay.method]} · {pay.ref}
                        </p>
                      )}
                    </button>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => {
                          setBookingStatus(b.id, "confirmed");
                          toast.success(`${b.code} confirmed`);
                        }}
                        className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-full bg-emerald-800 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <BadgeCheck className="size-3.5" /> Confirm
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt(`Reject ${b.code} — reason:`, "Payment could not be verified");
                          if (reason === null) return;
                          setBookingStatus(b.id, "cancelled", reason);
                        }}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-full border border-rose-200 bg-white px-3 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <Ban className="size-3.5" /> Reject
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold text-neutral-900">Booked value · last 7 days</h2>
          <div className="mt-6 flex h-44 items-end gap-2">
            {week.map((w) => (
              <div key={w.d} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] tabular-nums text-neutral-500">{w.v ? `${Math.round(w.v / 1000)}k` : ""}</span>
                <div className={cn("w-full rounded-t-lg", w.d === today ? "bg-lime-400" : "bg-emerald-800")} style={{ height: `${(w.v / max) * 120}px` }} title={`${dateLabel(w.d)} · ${taka(w.v)}`} />
                <span className="text-[11px] text-neutral-500">{w.d === today ? "Today" : dateLabel(w.d, { weekday: "short" })}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Starting in the next 6 hours</h2>
            <Link href="/turf/admin/bookings" className="text-xs font-medium text-emerald-700 hover:underline">
              All bookings
            </Link>
          </div>
          {overdue.length > 0 && (
            <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {overdue.length} confirmed booking{overdue.length > 1 ? "s have" : " has"} ended without check-in — mark them completed or no-show from the Bookings page.
            </p>
          )}
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">Nothing scheduled soon.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {upcoming.slice(0, 8).map((b) => {
                const court = db.courts.find((c) => c.id === b.courtId);
                return (
                  <li key={b.id}>
                    <button onClick={() => setOpenId(b.id)} className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-neutral-50">
                      <span className="flex w-16 shrink-0 flex-col items-center rounded-lg bg-emerald-50 py-1 text-emerald-900">
                        <span className="text-xs font-semibold">{hourLabel(b.startHour)}</span>
                        <span className="text-[10px]">{relativeDay(b.date)}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-neutral-900">{b.customer.team ?? b.customer.name}</span>
                        <span className="flex items-center gap-1 truncate text-xs text-neutral-500">
                          {court && <SportIcon sport={court.sport} className="size-3" />} {court?.name} · {court ? sportLabels[court.sport] : ""}
                        </span>
                      </span>
                      <span className="hidden text-xs text-neutral-500 sm:flex sm:items-center sm:gap-1">
                        <Clock className="size-3" /> in {formatDuration(startMs(b) - now)}
                      </span>
                      <BookingStatusBadge status={b.status} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <BookingDrawer id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
