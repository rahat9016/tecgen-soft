"use client";

import Link from "next/link";
import { format, subDays } from "date-fns";
import { BadgeCheck, LogIn, LogOut, Moon, Users } from "lucide-react";
import { parseCheckTimes } from "@/src/components/hotel/HotelDetails/PoliciesSection";
import { toDayKey } from "@/src/lib/hotelDates";
import type { PaymentPlan } from "@/src/lib/hotelPayment";
import { useHotelDB, useHotelSite } from "@/src/lib/hotel-store/store";
import type { HotelBookingSelection } from "@/src/lib/redux/features/hotelBooking/hotelBookingTypes";

export default function BookingSummary({
  selection,
  checkIn,
  checkOut,
  nights,
  subtotal,
  serviceFee,
  tax,
  total,
  dueNow,
  plan,
}: {
  selection: HotelBookingSelection;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  /** Taken online now: the deposit, or the full total. */
  dueNow: number;
  plan: PaymentPlan;
}) {
  const hotel = useHotelSite();
  const { settings } = useHotelDB();
  const times = parseCheckTimes(hotel.policies);
  const freeCancellation = hotel.policies.some((p) => p.toLowerCase().includes("free cancellation"));
  const changeHref = `/hotel-management/rooms/${selection.roomId}?${new URLSearchParams({
    checkIn: toDayKey(checkIn),
    checkOut: toDayKey(checkOut),
    adults: String(selection.adults),
    children: String(selection.children),
    rooms: String(selection.rooms),
  }).toString()}`;

  return (
    <div className="overflow-hidden rounded-md border border-neutral-200/80 bg-white shadow-xl shadow-neutral-900/5">
      <div className="relative aspect-[3/1] sm:aspect-[16/9]">
        <img src={selection.hotelImage} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/10 to-transparent" />
        <p className="absolute inset-x-0 bottom-0 p-4 text-lg font-bold text-white">{selection.roomName}</p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="font-bold text-neutral-900">Your stay</p>
          <Link href={changeHref} className="text-sm font-semibold text-sky-700 hover:underline">
            Change
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <div className="rounded-md border border-neutral-200 bg-white p-2.5">
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <LogIn className="size-3.5" /> Check-in
            </p>
            <p className="mt-1 text-sm font-bold text-neutral-900">{format(checkIn, "EEE, dd MMM")}</p>
            {times && <p className="text-xs text-neutral-500">{times.checkIn}</p>}
          </div>
          <span className="flex items-center">
            <span className="flex items-center gap-1 rounded-md bg-sky-600 px-2 py-0.5 text-[11px] font-bold text-white">
              <Moon className="size-3" /> {nights}
            </span>
          </span>
          <div className="rounded-md border border-neutral-200 bg-white p-2.5">
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <LogOut className="size-3.5" /> Check-out
            </p>
            <p className="mt-1 text-sm font-bold text-neutral-900">{format(checkOut, "EEE, dd MMM")}</p>
            {times && <p className="text-xs text-neutral-500">{times.checkOut}</p>}
          </div>
        </div>

        <p className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
          <Users className="size-4 text-neutral-400" />
          {selection.adults} adult{selection.adults !== 1 ? "s" : ""}
          {selection.children > 0 && `, ${selection.children} child${selection.children !== 1 ? "ren" : ""}`}
          {" "}&middot; {selection.rooms} room{selection.rooms !== 1 ? "s" : ""}
        </p>

        {/* Service charge and VAT share one line; the split is in the tooltip. */}
        <dl className="mt-4 space-y-2 text-sm text-neutral-600">
          <div className="flex justify-between gap-3">
            <dt>
              BDT {selection.pricePerNight.toLocaleString()} &times; {nights} night{nights !== 1 ? "s" : ""}
              {selection.rooms > 1 && ` × ${selection.rooms} rooms`}
            </dt>
            <dd className="shrink-0 text-neutral-900">BDT {subtotal.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between gap-3" title={`Service charge ${settings.serviceFeeRate}% · VAT ${settings.vatRate}%`}>
            <dt>Taxes &amp; fees</dt>
            <dd className="shrink-0 text-neutral-900">BDT {(serviceFee + tax).toLocaleString()}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-2.5">
            <dt className="font-bold text-neutral-900">Total</dt>
            <dd className="text-lg font-extrabold text-neutral-900">BDT {total.toLocaleString()}</dd>
          </div>
        </dl>

        <div className="mt-3 space-y-1 rounded-md border border-sky-100 bg-sky-50 px-3 py-2.5 text-sm">
          <p className="flex items-center justify-between gap-3 font-semibold text-sky-900">
            <span>{plan === "full" ? "Pay now" : `Pay now (${settings.depositRate}%)`}</span>
            <span className="font-bold">BDT {dueNow.toLocaleString()}</span>
          </p>
          {total > dueNow && (
            <p className="flex items-center justify-between gap-3 text-sky-800/80">
              <span>At the hotel</span>
              <span>BDT {(total - dueNow).toLocaleString()}</span>
            </p>
          )}
        </div>

        {freeCancellation && (
          <p className="mt-3 flex items-center gap-2 text-[13px] text-emerald-700">
            <BadgeCheck className="size-4 shrink-0" />
            <span>
              <span className="font-semibold">Free cancellation</span> until {format(subDays(checkIn, 1), "dd MMM")}
              {times ? `, ${times.checkIn}` : ""}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
