"use client";

import Link from "next/link";
import { format, subDays } from "date-fns";
import { BadgeCheck, BedDouble, Headphones, LogIn, LogOut, Moon, ShieldCheck, Star, Users } from "lucide-react";
import { getRoomById, hotel } from "@/src/data/hotels";
import { parseCheckTimes } from "@/src/components/hotel/HotelDetails/PoliciesSection";
import { ratingLabel } from "@/src/components/hotel/shared/ratingLabel";
import { toDayKey } from "@/src/lib/hotelDates";
import { currencyCodes, formatInCurrency, type CurrencyCode } from "@/src/lib/currency";
import { DEPOSIT_RATE, type PaymentPlan } from "@/src/lib/hotelPayment";
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
  currency,
  onCurrencyChange,
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
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
}) {
  const room = getRoomById(selection.roomId);
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
    <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-xl shadow-neutral-900/5">
      <div className="relative aspect-[16/9]">
        <img src={selection.hotelImage} alt={selection.roomName} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-lg font-bold">{selection.roomName}</p>
          <p className="text-xs text-white/80">
            {selection.hotelName} &middot; {selection.hotelLocation}
          </p>
        </div>
        {room && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-neutral-900 backdrop-blur-sm">
            <Star className="size-3.5 fill-amber-400 text-amber-400" /> {room.rating.toFixed(1)}
            <span className="font-medium text-neutral-500">{ratingLabel(room.rating)}</span>
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <p className="font-bold text-neutral-900">Your stay</p>
          <Link href={changeHref} className="text-sm font-semibold text-sky-700 hover:underline">
            Change
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <LogIn className="size-3.5" /> Check-in
            </p>
            <p className="mt-1 text-sm font-bold text-neutral-900">{format(checkIn, "EEE, dd MMM yyyy")}</p>
            {times && <p className="text-xs text-neutral-500">From {times.checkIn}</p>}
          </div>
          <span className="flex items-center">
            <span className="flex items-center gap-1 rounded-full bg-sky-600 px-2 py-0.5 text-[11px] font-bold text-white">
              <Moon className="size-3" /> {nights}
            </span>
          </span>
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <LogOut className="size-3.5" /> Check-out
            </p>
            <p className="mt-1 text-sm font-bold text-neutral-900">{format(checkOut, "EEE, dd MMM yyyy")}</p>
            {times && <p className="text-xs text-neutral-500">Until {times.checkOut}</p>}
          </div>
        </div>

        <ul className="mt-3 space-y-1.5 text-sm text-neutral-600">
          <li className="flex items-center gap-2">
            <Users className="size-4 text-neutral-400" />
            {selection.adults} adult{selection.adults !== 1 ? "s" : ""}
            {selection.children > 0 && `, ${selection.children} child${selection.children !== 1 ? "ren" : ""}`}
            {" "}&middot; {selection.rooms} room{selection.rooms !== 1 ? "s" : ""}
          </li>
          {room && (
            <li className="flex items-center gap-2">
              <BedDouble className="size-4 text-neutral-400" /> {room.beds} &middot; {room.size}
            </li>
          )}
        </ul>

        <div className="mt-5 space-y-3 text-sm">
          <div className="overflow-hidden rounded-2xl border border-neutral-200">
            <p className="border-b border-neutral-200 bg-neutral-50 px-3 py-2.5 font-bold text-neutral-900">
              Price details
            </p>
            <div className="divide-y divide-neutral-100">
              <div className="flex justify-between gap-3 px-3 py-2.5 text-neutral-600">
                <span>
                  BDT {selection.pricePerNight.toLocaleString()} &times; {nights} night{nights !== 1 ? "s" : ""}
                  {selection.rooms > 1 && ` × ${selection.rooms} rooms`}
                </span>
                <span className="shrink-0 text-neutral-900">BDT {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-3 py-2.5 text-neutral-600">
                <span>Service fee (3%)</span>
                <span className="text-neutral-900">BDT {serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-3 py-2.5 text-neutral-600">
                <span>VAT (5%)</span>
                <span className="text-neutral-900">BDT {tax.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-3 py-3">
              <span className="font-bold text-neutral-900">Total</span>
              <span className="text-xl font-extrabold text-neutral-900">BDT {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-sky-100">
            <div className="flex items-center justify-between bg-sky-600 px-3 py-2.5 text-white">
              <span className="text-sm font-semibold">
                {plan === "full" ? "Pay now (full amount)" : `Pay now (${DEPOSIT_RATE * 100}% deposit)`}
              </span>
              <span className="text-base font-extrabold">BDT {dueNow.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between bg-sky-50 px-3 py-2 text-sm text-sky-900">
              <span>Pay at hotel on arrival</span>
              <span className="font-semibold">BDT {(total - dueNow).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2">
            <label htmlFor="summary-currency" className="text-xs text-neutral-500">
              Approx. in
            </label>
            <span className="flex items-center gap-2">
              {currency === "BDT" ? (
                <span className="text-xs text-neutral-400">Pick a currency</span>
              ) : (
                <span className="text-sm font-semibold text-neutral-900">≈ {formatInCurrency(total, currency)}</span>
              )}
              <select
                id="summary-currency"
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-700 outline-none focus:border-sky-400"
              >
                {currencyCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            You&rsquo;ll be charged in BDT. Converted amounts are estimates and may differ from your bank&rsquo;s rate.
          </p>
        </div>

        {freeCancellation && (
          <div className="mt-4 flex gap-2.5 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
            <BadgeCheck className="mt-0.5 size-4 shrink-0" />
            <p>
              <span className="font-semibold">Free cancellation</span> until{" "}
              {format(subDays(checkIn, 1), "EEE, dd MMM")}
              {times ? `, ${times.checkIn}` : ""}.
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-neutral-600">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-sky-600" /> Secure booking
          </span>
          <a href={`tel:${hotel.phone}`} className="flex items-center gap-1.5 hover:text-sky-700">
            <Headphones className="size-4 text-sky-600" /> 24/7 guest support
          </a>
        </div>
      </div>
    </div>
  );
}
