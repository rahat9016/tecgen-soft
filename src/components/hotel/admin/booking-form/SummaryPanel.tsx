"use client";

import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { AlertCircle, AlertTriangle, CalendarCheck, Clock, Loader2, LogIn } from "lucide-react";
import { dateLabel, taka, todayKey } from "@/src/lib/hotel-store/format";
import { unitNumbers, useHotelDB } from "@/src/lib/hotel-store/store";
import { cn } from "@/src/lib/utils";
import { Card, hbtn, textareaClass } from "../ui";
import { FieldError } from "./parts";
import { computeStay, toNum, type BookingFormValues, type BookingStatusChoice } from "./schema";

export const submitLabel = (status: BookingStatusChoice) => (status === "check-in" ? "Create & check in" : status === "tentative" ? "Hold booking" : "Confirm booking");

/** Leaf error count, e.g. guest.name and guest.phone count as two. */
export const countErrors = (e: object): number => Object.values(e).reduce((n: number, x) => n + (x && typeof x === "object" && !("message" in x && typeof x.message === "string") ? countErrors(x) : 1), 0);

export default function SummaryPanel({ saving }: { saving: boolean }) {
  const db = useHotelDB();
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { errors, isSubmitted } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const { type, nights, rooms, rate, quote } = computeStay(db, v);
  const pay = Math.min(toNum(v.payAmount), quote.total);
  const due = Math.max(0, quote.total - pay);
  const isToday = v.checkIn === todayKey();
  const dirty = (v.unitIds ?? []).map((id) => db.units.find((u) => u.id === id)).filter((u) => u?.housekeeping === "dirty");
  const errorCount = isSubmitted ? countErrors(errors) : 0;
  const discountLabel = v.discountKind === "percent" ? `Discount (${toNum(v.discountValue)}%)` : "Discount";

  const statuses: { value: BookingStatusChoice; title: string; text: string; icon: typeof LogIn; disabled?: boolean }[] = [
    { value: "check-in", title: "Check in now", text: isToday ? "Guest is at the desk" : "Only for stays starting today", icon: LogIn, disabled: !isToday },
    { value: "confirmed", title: "Confirmed", text: "Room is held, guest arrives later", icon: CalendarCheck },
    { value: "tentative", title: "Tentative", text: "Pending until a deposit comes in", icon: Clock },
  ];

  return (
    <div id="bf-summary" className="scroll-mt-24">
    <Card className="p-0">
      <div className="border-b border-neutral-100 p-5">
        <h2 className="font-semibold text-neutral-900">Booking summary</h2>
        {type ? (
          <div className="mt-3 flex gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
            {type.images[0] && <img src={type.images[0]} alt="" className="size-14 shrink-0 rounded-md object-cover" />}
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium text-neutral-900">
                {type.name}
                {rooms > 1 && ` × ${rooms}`}
              </p>
              <p className="text-neutral-500">{nights > 0 ? `${dateLabel(v.checkIn, "dd MMM")} → ${dateLabel(v.checkOut, "dd MMM")} · ${nights} night${nights > 1 ? "s" : ""}` : "Dates not set"}</p>
              <p className="text-neutral-500">
                {toNum(v.adults)} adult{toNum(v.adults) !== 1 ? "s" : ""}
                {toNum(v.children) > 0 && `, ${toNum(v.children)} child${toNum(v.children) > 1 ? "ren" : ""}`}
                {v.unitIds?.length ? ` · Room ${unitNumbers(db, v.unitIds).join(", ")}` : " · Room not assigned"}
              </p>
              {v.guest?.name && <p className="truncate font-medium text-neutral-700">{v.guest.name}</p>}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">Choose a room type to see the price.</p>
        )}
      </div>

      <dl className="space-y-2 p-5 text-sm">
        <Row label={`${taka(rate)} × ${Math.max(0, nights)} night${nights !== 1 ? "s" : ""}${rooms > 1 ? ` × ${rooms}` : ""}`} value={taka(quote.subtotal)} />
        {quote.discount > 0 && <Row label={discountLabel} value={`−${taka(quote.discount)}`} className="text-emerald-700" />}
        {quote.discount > 0 && <Row label="Room charge after discount" value={taka(quote.net)} muted />}
        <Row label={`Service charge (${db.settings.serviceFeeRate}%)`} value={taka(quote.serviceFee)} />
        <Row label={`VAT (${db.settings.vatRate}%)`} value={taka(quote.tax)} />
        <div className="flex items-baseline justify-between border-t border-neutral-100 pt-3">
          <dt className="font-semibold text-neutral-900">Total</dt>
          <dd className="text-xl font-bold tabular-nums text-neutral-900">{taka(quote.total)}</dd>
        </div>
        {pay > 0 && <Row label={`Paid now · ${v.payMethod}`} value={`−${taka(pay)}`} className="text-sky-700" />}
        <div className={cn("flex justify-between rounded-md px-3 py-2 font-semibold", due ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800")}>
          <dt>{due ? "Balance due" : "Fully paid"}</dt>
          <dd className="tabular-nums">{taka(due)}</dd>
        </div>
      </dl>

      <div className="border-t border-neutral-100 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</p>
        <div className="mt-2 space-y-2">
          {statuses.map((s) => {
            const on = v.status === s.value;
            return (
              <button
                key={s.value}
                type="button"
                disabled={s.disabled}
                onClick={() => setValue("status", s.value, { shouldDirty: true, shouldValidate: isSubmitted })}
                aria-pressed={on}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
                  on ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100" : "border-neutral-200 hover:border-sky-300"
                )}
              >
                <s.icon className={cn("size-4 shrink-0", on ? "text-sky-600" : "text-neutral-400")} />
                <span>
                  <span className="block text-sm font-medium text-neutral-900">{s.title}</span>
                  <span className="block text-xs text-neutral-500">{s.text}</span>
                </span>
              </button>
            );
          })}
        </div>
        <FieldError name="status" />

        {v.status === "check-in" && dirty.length > 0 && (
          <p className="mt-3 flex gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="size-4 shrink-0" />
            Room {dirty.map((u) => u!.number).join(", ")} still needs cleaning — make sure it&rsquo;s ready before handing over the key.
          </p>
        )}
        {v.status === "tentative" && pay > 0 && <p className="mt-3 text-xs text-neutral-500">A payment is being recorded — consider marking it Confirmed instead.</p>}

        <textarea {...register("internalNote")} rows={2} placeholder="Staff note — only the team sees this" className={cn(textareaClass, "mt-4")} />

        {errorCount > 0 && (
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-rose-600">
            <AlertCircle className="size-4" /> {errorCount} field{errorCount > 1 ? "s" : ""} need{errorCount === 1 ? "s" : ""} attention
          </p>
        )}
        <button type="submit" disabled={saving} className={cn(hbtn.primary, "mt-4 h-11 w-full")}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {submitLabel(v.status)}
        </button>
      </div>
    </Card>
    </div>
  );
}

function Row({ label, value, className, muted }: { label: string; value: string; className?: string; muted?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-3", muted ? "text-xs text-neutral-400" : "text-neutral-600", className)}>
      <dt>{label}</dt>
      <dd className="shrink-0 tabular-nums">{value}</dd>
    </div>
  );
}
