"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { BadgeCheck, CalendarX2, Clock, Hourglass, Search } from "lucide-react";
import { dateLabel, formatDuration, payLabels, rangeLabel, sportLabels, taka } from "@/src/lib/turf-store/format";
import { cancelByCustomer, dueOf, paidOf, startMs, endMs, useHydrated, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { Booking } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { BookingStatusBadge, inputClass, LiveBadge, Loader, SportIcon, tbtn } from "./ui";

const PHONE_KEY = "turfhub:phone";

function savedPhone() {
  try {
    return localStorage.getItem(PHONE_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function MyBookings() {
  const db = useTurfDB();
  const hydrated = useHydrated();
  const now = useNow(1000);
  const params = useSearchParams();
  const code = params.get("code");
  // The page renders a loader until hydrated, so reading storage in the initializer is safe.
  const [phone, setPhone] = useState(savedPhone);
  const [input, setInput] = useState(savedPhone);

  if (!hydrated) return <Loader />;

  const mine = db.bookings
    .filter((b) => phone && b.customer.phone === phone)
    .sort((a, b) => startMs(b) - startMs(a));
  const upcoming = mine.filter((b) => endMs(b) > now && b.status !== "cancelled").sort((a, b) => startMs(a) - startMs(b));
  const past = mine.filter((b) => !upcoming.includes(b));
  const fresh = code ? db.bookings.find((b) => b.code === code) : undefined;

  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    const p = input.trim();
    setPhone(p);
    try {
      localStorage.setItem(PHONE_KEY, p);
    } catch {}
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <LiveBadge now={now} />
          <h1 className="mt-3 text-3xl font-semibold text-neutral-900">My bookings</h1>
          <p className="mt-1 text-sm text-neutral-500">Status updates here the moment the venue confirms your payment.</p>
        </div>
        <Link href="/turf/book" className={tbtn.green}>
          Book another slot
        </Link>
      </div>

      {fresh && (
        <div
          className={cn(
            "mt-6 flex flex-wrap items-center gap-4 rounded-3xl p-5",
            fresh.status === "pending" ? "bg-amber-50 ring-1 ring-amber-200" : fresh.status === "cancelled" ? "bg-rose-50 ring-1 ring-rose-200" : "bg-lime-50 ring-1 ring-lime-300"
          )}
        >
          <span className={cn("flex size-12 items-center justify-center rounded-full", fresh.status === "pending" ? "bg-amber-400 text-white" : "bg-emerald-700 text-white")}>
            {fresh.status === "pending" ? <Hourglass className="size-6" /> : <BadgeCheck className="size-6" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-neutral-900">
              {fresh.status === "pending"
                ? `Booking ${fresh.code} received — verifying your advance`
                : fresh.status === "cancelled"
                  ? `Booking ${fresh.code} was cancelled`
                  : `Booking ${fresh.code} is confirmed. See you on the turf!`}
            </p>
            <p className="text-sm text-neutral-600">
              {fresh.status === "pending"
                ? "Keep this page open — it turns green automatically once our team confirms the payment."
                : fresh.cancelReason ?? `Show code ${fresh.code} at the front desk.`}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={lookup} className="mt-6 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            aria-label="Mobile number"
            className={cn(inputClass, "pl-9")}
            inputMode="numeric"
            placeholder="Your mobile number"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, 11))}
          />
        </div>
        <button className={tbtn.green}>Find</button>
      </form>

      {phone && !mine.length && <p className="mt-10 text-center text-sm text-neutral-500">No bookings found for {phone}.</p>}
      {!phone && <p className="mt-10 text-center text-sm text-neutral-500">Enter the mobile number you booked with.</p>}

      {upcoming.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wider text-neutral-500">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingCard key={b.id} b={b} now={now} highlight={b.code === code} />
            ))}
          </div>
        </>
      )}
      {past.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wider text-neutral-500">History</h2>
          <div className="space-y-3">
            {past.map((b) => (
              <BookingCard key={b.id} b={b} now={now} highlight={b.code === code} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BookingCard({ b, now, highlight }: { b: Booking; now: number; highlight: boolean }) {
  const db = useTurfDB();
  const court = db.courts.find((c) => c.id === b.courtId);
  const until = startMs(b) - now;
  const canCancel = (b.status === "pending" || b.status === "confirmed") && until > db.settings.cancelCutoffHours * 3600_000;
  const paid = paidOf(b);

  return (
    <div className={cn("flex flex-col gap-4 rounded-3xl border bg-white p-4 sm:flex-row sm:items-center", highlight ? "border-emerald-500 ring-2 ring-emerald-100" : "border-neutral-200")}>
      {court && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={court.image} alt="" className="h-24 w-full rounded-2xl object-cover sm:w-32" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-neutral-500">{b.code}</span>
          <BookingStatusBadge status={b.status} />
        </div>
        <p className="mt-1 flex items-center gap-1.5 font-semibold text-neutral-900">
          {court && <SportIcon sport={court.sport} className="text-emerald-700" />} {court?.name ?? "Court"}
          {court && <span className="text-xs font-normal text-neutral-500">· {sportLabels[court.sport]}</span>}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-600">
          <Clock className="size-3.5" /> {dateLabel(b.date)} · {rangeLabel(b.startHour, b.duration)}
          {until > 0 && until < 86_400_000 && b.status !== "cancelled" && <span className="text-emerald-700">· starts in {formatDuration(until)}</span>}
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Paid {taka(paid)} {b.payments[0] && `via ${payLabels[b.payments[0].method]}`} · {dueOf(b) > 0 ? `${taka(dueOf(b))} due at venue` : "fully paid"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <p className="text-lg font-semibold text-neutral-900">{taka(b.total)}</p>
        {canCancel && (
          <button
            onClick={() => {
              if (!confirm(`Cancel booking ${b.code}? Your advance will be refunded per venue policy.`)) return;
              const r = cancelByCustomer(b.code, b.customer.phone);
              if (r.ok) toast.success("Booking cancelled");
              else toast.error(r.error);
            }}
            className={tbtn.danger}
          >
            <CalendarX2 className="size-4" /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}
