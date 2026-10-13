"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  ArrowRight,
  BedDouble,
  CalendarClock,
  DoorOpen,
  Gauge,
  Hourglass,
  LogIn,
  LogOut,
  Receipt,
  Sparkles,
  Star,
  Undo2,
  Wallet,
} from "lucide-react";
import { dateLabel, relativeDay, shiftDay, sourceLabels, taka, timeAgo, todayKey } from "@/src/lib/hotel-store/format";
import { collectedByDay, ledger, occupancyOn, roomRevenue, roomsInService, roomsSoldOn } from "@/src/lib/hotel-store/reports";
import {
  checkInBooking,
  checkOutBooking,
  confirmBooking,
  creditOf,
  dueOf,
  unitNumbers,
  useCurrentStaff,
  useHotelDB,
  useNow,
} from "@/src/lib/hotel-store/store";
import type { Booking } from "@/src/lib/hotel-store/types";
import { toDayKey } from "@/src/lib/hotelDates";
import { cn } from "@/src/lib/utils";
import { RankBars, ValueBars } from "./charts";
import { ADMIN, Card, hbtn, LiveDot, StatCard, StatusBadge } from "./ui";

function GuestLine({ b, right }: { b: Booking; right: React.ReactNode }) {
  const db = useHotelDB();
  const rooms = unitNumbers(db, b.unitIds);
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Link href={`${ADMIN}/bookings/${b.id}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
        <span
          className={cn(
            "flex h-10 w-14 shrink-0 flex-col items-center justify-center rounded-lg text-xs font-bold",
            rooms.length ? "bg-sky-50 text-sky-800" : "bg-amber-50 text-amber-700"
          )}
          title={rooms.length ? "Room" : "No room assigned yet"}
        >
          {rooms.length ? rooms.join(", ") : "—"}
          <span className="text-[9px] font-medium uppercase tracking-wide opacity-70">{rooms.length ? "room" : "assign"}</span>
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-neutral-900">{b.guest.name}</span>
          <span className="block truncate text-xs text-neutral-500">
            {b.code} · {b.roomName}
            {b.rooms > 1 ? ` ×${b.rooms}` : ""} · {b.nights}n{b.guest.arrivalTime ? ` · ETA ${b.guest.arrivalTime}` : ""}
          </span>
        </span>
      </Link>
      {right}
    </li>
  );
}

export default function Dashboard() {
  const db = useHotelDB();
  const staff = useCurrentStaff();
  const router = useRouter();
  const now = useNow(60_000);
  const today = todayKey();
  // The admin only renders after hydration, so `now` is always the real clock here.
  const hour = new Date(now).getHours();

  const live = db.bookings;
  const inHouse = live.filter((b) => b.status === "checked-in");
  const arrivals = live.filter((b) => (b.status === "confirmed" || b.status === "pending") && b.checkIn <= today && today < b.checkOut).sort((a, b) => a.code.localeCompare(b.code));
  const departures = inHouse.filter((b) => b.checkOut <= today);
  const departedToday = live.filter((b) => b.status === "checked-out" && b.checkedOutAt && toDayKey(new Date(b.checkedOutAt)) === today);
  const pending = live.filter((b) => b.status === "pending");
  const refunds = live.filter((b) => creditOf(b) > 0);
  const overdue = inHouse.filter((b) => b.checkOut < today);
  const unassigned = live.filter((b) => (b.status === "confirmed" || b.status === "pending") && b.unitIds.length < b.rooms && b.checkIn <= shiftDay(today, 3));
  const dirty = db.units.filter((u) => u.housekeeping === "dirty" && !u.outOfService);
  const pendingReviews = db.reviews.filter((r) => r.status === "pending");
  const outstanding = live.filter((b) => b.status === "checked-in" || b.status === "checked-out").reduce((s, b) => s + dueOf(b), 0);

  const total = roomsInService(db);
  const soldTonight = roomsSoldOn(db, today);
  const rows = ledger(db);
  const byDay = collectedByDay(rows);
  const collectedToday = byDay.get(today) ?? 0;
  const monthStart = `${today.slice(0, 8)}01`;
  const mtd = roomRevenue(db, monthStart, shiftDay(today, 1));
  const daysSoFar = Number(today.slice(8, 10));
  const adr = mtd.nights ? mtd.revenue / mtd.nights : 0;
  const revpar = total ? mtd.revenue / (total * daysSoFar) : 0;

  const last30 = Array.from({ length: 30 }, (_, i) => shiftDay(today, i - 29)).map((d) => ({
    label: dateLabel(d, "dd MMM"),
    value: Math.max(0, byDay.get(d) ?? 0),
    hint: dateLabel(d, "EEE, dd MMM"),
  }));
  const next14 = Array.from({ length: 14 }, (_, i) => shiftDay(today, i)).map((d) => ({
    label: i0(d, today),
    value: occupancyOn(db, d),
    hint: `${dateLabel(d, "EEE, dd MMM")} · ${roomsSoldOn(db, d)} of ${total} rooms`,
  }));
  const typeRows = db.roomTypes
    .map((t) => ({ label: t.name, value: mtd.byType.get(t.id)?.revenue ?? 0, note: `${mtd.byType.get(t.id)?.nights ?? 0} nights` }))
    .sort((a, b) => b.value - a.value);
  const since = shiftDay(today, -30);
  const sources = (Object.keys(sourceLabels) as (keyof typeof sourceLabels)[])
    .map((s) => ({ label: sourceLabels[s], value: live.filter((b) => b.source === s && toDayKey(new Date(b.createdAt)) >= since && b.status !== "cancelled").length }))
    .sort((a, b) => b.value - a.value);

  const quickCheckIn = (b: Booking) => {
    const r = checkInBooking(b.id);
    if (r.ok) toast.success(`${b.guest.name} checked in to room ${unitNumbers(db, r.value.unitIds).join(", ")}`);
    else {
      toast.info(r.error);
      router.push(`${ADMIN}/bookings/${b.id}`);
    }
  };
  const quickCheckOut = (b: Booking) => {
    const r = checkOutBooking(b.id);
    if (r.ok) toast.success(`${b.guest.name} checked out — room marked for cleaning`);
    else {
      toast.info(r.error);
      router.push(`${ADMIN}/bookings/${b.id}`);
    }
  };

  const attention = [
    pending.length && { icon: Hourglass, tone: "text-amber-600 bg-amber-50", text: `${pending.length} booking${pending.length > 1 ? "s" : ""} awaiting confirmation`, href: `${ADMIN}/bookings?status=pending` },
    refunds.length && { icon: Undo2, tone: "text-violet-600 bg-violet-50", text: `${refunds.length} refund${refunds.length > 1 ? "s" : ""} to process (${taka(refunds.reduce((s, b) => s + creditOf(b), 0))})`, href: `${ADMIN}/payments?tab=refunds` },
    overdue.length && { icon: AlertTriangle, tone: "text-rose-600 bg-rose-50", text: `${overdue.length} guest${overdue.length > 1 ? "s" : ""} past check-out date`, href: `${ADMIN}/bookings?status=checked-in` },
    unassigned.length && { icon: BedDouble, tone: "text-sky-600 bg-sky-50", text: `${unassigned.length} arrival${unassigned.length > 1 ? "s" : ""} in the next 3 days without a room`, href: `${ADMIN}/calendar` },
    dirty.length && { icon: Sparkles, tone: "text-amber-600 bg-amber-50", text: `${dirty.length} room${dirty.length > 1 ? "s" : ""} need cleaning`, href: `${ADMIN}/rooms?filter=dirty` },
    pendingReviews.length && { icon: Star, tone: "text-amber-600 bg-amber-50", text: `${pendingReviews.length} review${pendingReviews.length > 1 ? "s" : ""} to moderate`, href: `${ADMIN}/reviews` },
  ].filter(Boolean) as { icon: typeof Star; tone: string; text: string; href: string }[];

  const activity = db.notices.filter((n) => n.to === "staff").slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Good {hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"}, {staff?.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">{dateLabel(today, "EEEE, dd MMMM yyyy")} · {db.content.hotel.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`${ADMIN}/rooms`} className={hbtn.outline}>
            Rooms board
          </Link>
          <Link href={`${ADMIN}/calendar`} className={hbtn.dark}>
            Calendar <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
        <StatCard label="Occupancy tonight" value={`${total ? Math.round((soldTonight / total) * 100) : 0}%`} hint={`${soldTonight} of ${total} rooms`} icon={Gauge} tone="violet" />
        <StatCard label="In house" value={inHouse.reduce((s, b) => s + b.adults + b.children, 0)} hint={`guests in ${inHouse.reduce((s, b) => s + b.rooms, 0)} rooms`} icon={BedDouble} tone="green" />
        <StatCard label="Arrivals today" value={arrivals.length} hint={`${live.filter((b) => b.checkIn === today && b.status === "checked-in").length} already checked in`} icon={LogIn} tone="neutral" />
        <StatCard label="Departures today" value={departures.length} hint={`${departedToday.length} already left`} icon={LogOut} tone="neutral" />
        <StatCard label="Collected today" value={taka(collectedToday)} hint="Payments − refunds" icon={Wallet} tone="green" />
        <StatCard label="Outstanding" value={taka(outstanding)} hint="Due from in-house & departed" icon={Receipt} tone={outstanding ? "orange" : "neutral"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
              <LogIn className="size-4 text-sky-600" /> Arrivals today
            </h2>
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">{arrivals.length}</span>
          </div>
          {arrivals.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">No more arrivals today.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {arrivals.slice(0, 7).map((b) => (
                <GuestLine
                  key={b.id}
                  b={b}
                  right={
                    b.status === "pending" ? (
                      <button onClick={() => confirmBooking(b.id).ok && toast.success(`${b.code} confirmed`)} className={hbtn.small}>
                        Confirm
                      </button>
                    ) : (
                      <button onClick={() => quickCheckIn(b)} className={cn(hbtn.small, "border-sky-200 text-sky-700")}>
                        Check in
                      </button>
                    )
                  }
                />
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
              <DoorOpen className="size-4 text-sky-600" /> Departures
            </h2>
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">{departures.length}</span>
          </div>
          {departures.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">Everyone due out has checked out.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {departures.slice(0, 7).map((b) => {
                const due = dueOf(b);
                return (
                  <GuestLine
                    key={b.id}
                    b={b}
                    right={
                      <span className="flex shrink-0 items-center gap-2">
                        {due > 0 && <span className="text-xs font-semibold text-rose-600">{taka(due)}</span>}
                        <button onClick={() => quickCheckOut(b)} className={hbtn.small}>
                          {due > 0 ? "Settle" : "Check out"}
                        </button>
                      </span>
                    }
                  />
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-neutral-900">
            <AlertTriangle className="size-4 text-amber-500" /> Needs attention
          </h2>
          {attention.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">All caught up.</p>
          ) : (
            <ul className="space-y-2">
              {attention.map((a) => (
                <li key={a.text}>
                  <Link href={a.href} className="flex items-center gap-3 rounded-xl border border-neutral-100 p-2.5 text-sm text-neutral-700 transition hover:border-sky-200 hover:bg-sky-50/40">
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", a.tone)}>
                      <a.icon className="size-4" />
                    </span>
                    <span className="flex-1">{a.text}</span>
                    <ArrowRight className="size-4 text-neutral-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-neutral-900">Money collected · last 30 days</h2>
            <span className="text-sm font-semibold tabular-nums text-neutral-900">{taka(last30.reduce((s, d) => s + d.value, 0))}</span>
          </div>
          <p className="text-xs text-neutral-500">Deposits, balances and extras, after refunds</p>
          <div className="mt-4">
            <ValueBars data={last30} kind="money" label="Money collected per day over the last 30 days" />
          </div>
        </Card>
        <Card>
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-neutral-900">Occupancy forecast · next 14 nights</h2>
            <span className="text-sm font-semibold tabular-nums text-neutral-900">
              {Math.round(next14.reduce((s, d) => s + d.value, 0) / next14.length)}% avg
            </span>
          </div>
          <p className="text-xs text-neutral-500">Confirmed, pending and in-house bookings · {total} rooms in service</p>
          <div className="mt-4">
            <ValueBars data={next14} kind="percent" label="Forecast occupancy for the next 14 nights" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <h2 className="font-semibold text-neutral-900">Room revenue this month</h2>
          <p className="mb-4 text-xs text-neutral-500">
            {taka(mtd.revenue)} · ADR {taka(adr)} · RevPAR {taka(revpar)}
          </p>
          <RankBars rows={typeRows} />
        </Card>
        <Card>
          <h2 className="font-semibold text-neutral-900">Where bookings come from</h2>
          <p className="mb-4 text-xs text-neutral-500">Bookings made in the last 30 days</p>
          <RankBars rows={sources} format={(n) => `${n} booking${n === 1 ? "" : "s"}`} />
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
              <LiveDot /> Latest activity
            </h2>
            <Link href={`${ADMIN}/notifications`} className="text-xs font-medium text-sky-700 hover:underline">
              View all
            </Link>
          </div>
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">Nothing yet.</p>
          ) : (
            <ul className="space-y-3">
              {activity.map((n) => {
                const b = db.bookings.find((x) => x.id === n.bookingId);
                return (
                  <li key={n.id} className="flex gap-3">
                    <CalendarClock className={cn("mt-0.5 size-4 shrink-0", n.read ? "text-neutral-300" : "text-sky-600")} />
                    <div className="min-w-0 text-sm">
                      <Link href={b ? `${ADMIN}/bookings/${b.id}` : `${ADMIN}/notifications`} className="block truncate font-medium text-neutral-900 hover:text-sky-700">
                        {n.title}
                      </Link>
                      <p className="line-clamp-1 text-xs text-neutral-500">{n.body}</p>
                      <p className="text-[11px] text-neutral-400">
                        {timeAgo(n.at, now || undefined)}
                        {b && (
                          <>
                            {" · "}
                            <StatusBadge status={b.status} className="px-1.5 py-0 text-[10px]" />
                          </>
                        )}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

const i0 = (d: string, today: string) => (d === today ? "Tonight" : relativeDay(d) === "Tomorrow" ? "Tmrw" : dateLabel(d, "dd"));
