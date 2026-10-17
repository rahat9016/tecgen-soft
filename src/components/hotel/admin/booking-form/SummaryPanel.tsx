"use client";

import { useFormContext, useFormState, useWatch } from "react-hook-form";
import {
  AlertCircle,
  AlertTriangle,
  BadgePercent,
  BedDouble,
  CalendarCheck,
  CalendarDays,
  Clock,
  DoorOpen,
  Loader2,
  LogIn,
  UserRound,
  Users,
} from "lucide-react";
import { discountLimit } from "@/src/lib/hotel-store/auth";
import { dateLabel, taka, todayKey } from "@/src/lib/hotel-store/format";
import {
  unitNumbers,
  useCurrentStaff,
  useHotelDB,
} from "@/src/lib/hotel-store/store";
import { cn } from "@/src/lib/utils";
import { hbtn, inputClass, textareaClass } from "../ui";
import { FieldError, Segmented, useErrorClass } from "./parts";
import {
  composeGuest,
  computeStay,
  discountReasons,
  OTHER_REASON,
  payNowOf,
  toNum,
  type BookingFormValues,
  type BookingStatusChoice,
} from "./schema";

const quickPercents = [5, 10, 15, 20, 25, 50];
const smallInput = "h-9 text-sm";

export const submitLabel = (status: BookingStatusChoice) =>
  status === "check-in"
    ? "Create & check in"
    : status === "tentative"
      ? "Hold booking"
      : "Confirm booking";

/** Leaf error count, e.g. guest.name and guest.phone count as two. */
export const countErrors = (e: object): number =>
  Object.values(e).reduce(
    (n: number, x) =>
      n +
      (x &&
      typeof x === "object" &&
      !("message" in x && typeof x.message === "string")
        ? countErrors(x)
        : 1),
    0
  );

/** The admin twin of the website's "Your stay" card: what is being booked, the price, and how it's settled. */
export default function SummaryPanel({ saving }: { saving: boolean }) {
  const db = useHotelDB();
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { errors, isSubmitted } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const { nights, rooms, quote, lines, commission } = computeStay(db, v);
  const type = lines[0]?.type;
  const single = lines.length === 1;
  const unitIds = lines.flatMap((l) => l.line.unitIds);
  const now = payNowOf(v, quote);
  const later = quote.total - now;
  const isToday = v.checkIn === todayKey();
  const dirty = unitIds
    .map((id) => db.units.find((u) => u.id === id))
    .filter((u) => u?.housekeeping === "dirty");
  const errorCount = isSubmitted ? countErrors(errors) : 0;
  const adults = toNum(v.adults);
  const children = toNum(v.children);
  const hasDates = nights > 0;

  const statuses: {
    value: BookingStatusChoice;
    title: string;
    text: string;
    icon: typeof LogIn;
    disabled?: boolean;
  }[] = [
    {
      value: "check-in",
      title: "Check in",
      text: isToday
        ? "Guest is at the desk — keys handed over now."
        : "Only for stays starting today.",
      icon: LogIn,
      disabled: !isToday,
    },
    {
      value: "confirmed",
      title: "Confirmed",
      text: "Room is held, guest arrives later.",
      icon: CalendarCheck,
    },
    {
      value: "tentative",
      title: "Tentative",
      text: "Stays pending until a deposit comes in.",
      icon: Clock,
    },
  ];

  const title = !lines.length
    ? "New booking"
    : single
      ? type!.name
      : `${rooms} rooms`;
  const subtitle = single
    ? rooms > 1
      ? `${rooms} rooms`
      : db.content.hotel.name
    : lines.map((l) => l.type?.name).join(", ");

  return (
    <div
      id="bf-summary"
      className="scroll-mt-24 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm"
    >
      <div className="flex items-center gap-3 border-b border-neutral-100 p-4">
        {type?.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
          <img
            src={type.images[0]}
            alt=""
            className="size-14 shrink-0 rounded-md object-cover"
          />
        ) : (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600">
            <BedDouble className="size-6" />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-bold text-neutral-900">{title}</p>
          <p className="truncate text-xs text-neutral-500" title={subtitle}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="p-4">
        <ul className="space-y-2 text-sm text-neutral-700">
          <li className="flex items-center gap-2.5">
            <CalendarDays className="size-4 shrink-0 text-neutral-400" />
            {hasDates ? (
              <span>
                {dateLabel(v.checkIn, "dd MMM")} →{" "}
                {dateLabel(v.checkOut, "dd MMM")}
                <span className="text-neutral-400">
                  {" "}
                  · {nights} night{nights > 1 ? "s" : ""}
                </span>
              </span>
            ) : (
              <span className="text-neutral-400">Dates not set</span>
            )}
          </li>
          <li className="flex items-center gap-2.5">
            <Users className="size-4 shrink-0 text-neutral-400" />
            {adults} adult{adults !== 1 ? "s" : ""}
            {children > 0 &&
              `, ${children} child${children !== 1 ? "ren" : ""}`}
          </li>
          {lines.length > 0 && (
            <li className="flex items-center gap-2.5">
              <DoorOpen className="size-4 shrink-0 text-neutral-400" />
              {unitIds.length ? (
                `Room ${unitNumbers(db, unitIds).join(", ")}`
              ) : (
                <span className="text-amber-700">Room not assigned yet</span>
              )}
            </li>
          )}
          {(v.guest?.firstName?.trim() || v.guest?.lastName?.trim()) && (
            <li className="flex items-center gap-2.5">
              <UserRound className="size-4 shrink-0 text-neutral-400" />
              <span className="truncate font-medium text-neutral-900">
                {composeGuest(v.guest).name}
              </span>
            </li>
          )}
        </ul>

        {!lines.length ? (
          <p className="mt-4 rounded-md border border-dashed border-neutral-200 py-6 text-center text-sm text-neutral-400">
            Select a room type to see the price
          </p>
        ) : (
          <>
            <dl className="mt-4 space-y-2.5 border-t border-neutral-100 pt-4 text-sm">
              {lines.map((l) => (
                <div key={l.line.typeId} className="flex justify-between gap-3">
                  <dt className="min-w-0">
                    <span className="block truncate text-neutral-800">
                      {l.type?.name ?? "Room"}
                      {l.rooms > 1 && (
                        <span className="text-neutral-400"> × {l.rooms}</span>
                      )}
                    </span>
                    <span className="block text-xs text-neutral-400">
                      {taka(l.rate)} × {Math.max(0, nights)} night
                      {nights !== 1 ? "s" : ""}
                    </span>
                  </dt>
                  <dd className="shrink-0 tabular-nums text-neutral-900">
                    {taka(l.quote.subtotal)}
                  </dd>
                </div>
              ))}
              {quote.discount > 0 && (
                <div className="flex justify-between gap-3 text-emerald-700">
                  <dt>
                    Discount
                    {v.discountKind === "percent"
                      ? ` (${toNum(v.discountValue)}%)`
                      : ""}
                  </dt>
                  <dd className="tabular-nums">−{taka(quote.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3 text-neutral-500">
                <dt>Service charge & VAT</dt>
                <dd className="tabular-nums">
                  {taka(quote.serviceFee + quote.tax)}
                </dd>
              </div>
            </dl>

            <div className="mt-3">
              <DiscountEditor />
            </div>

            <div className="mt-4 flex items-baseline justify-between border-t border-neutral-200 pt-4">
              <span className="font-semibold text-neutral-900">Total</span>
              <span className="text-2xl font-extrabold tabular-nums text-neutral-900">
                {taka(quote.total)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md bg-sky-50 px-3 py-2">
                <p className="text-xs text-sky-700">Paid now</p>
                <p className="font-bold tabular-nums text-sky-900">
                  {taka(now)}
                </p>
              </div>
              <div
                className={cn(
                  "rounded-md px-3 py-2",
                  later > 0 ? "bg-amber-50" : "bg-emerald-50"
                )}
              >
                <p
                  className={cn(
                    "text-xs",
                    later > 0 ? "text-amber-700" : "text-emerald-700"
                  )}
                >
                  {later > 0 ? "Balance due" : "Fully paid"}
                </p>
                <p
                  className={cn(
                    "font-bold tabular-nums",
                    later > 0 ? "text-amber-900" : "text-emerald-900"
                  )}
                >
                  {taka(later)}
                </p>
              </div>
            </div>
            {commission > 0 && (
              <p className="mt-3 flex justify-between gap-3 rounded-md border border-violet-100 bg-violet-50/50 px-3 py-2 text-xs text-violet-800">
                <span className="truncate">
                  Commission ·{" "}
                  {v.commission.name ||
                    (v.source === "agent" ? "agent" : "referral")}
                </span>
                <b className="shrink-0 tabular-nums">{taka(commission)}</b>
              </p>
            )}
          </>
        )}
      </div>

      <div className="border-t border-neutral-100 bg-neutral-50/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Status
        </p>
        <div role="radiogroup" className="mt-2 grid grid-cols-3 gap-1.5">
          {statuses.map((s) => {
            const on = v.status === s.value;
            return (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={s.disabled}
                title={s.text}
                onClick={() =>
                  setValue("status", s.value, {
                    shouldDirty: true,
                    shouldValidate: isSubmitted,
                  })
                }
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md border bg-white px-1 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
                  on
                    ? "border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-100"
                    : "border-neutral-200 text-neutral-600 hover:border-sky-300"
                )}
              >
                <s.icon
                  className={cn(
                    "size-4",
                    on ? "text-sky-600" : "text-neutral-400"
                  )}
                />
                {s.title}
              </button>
            );
          })}
        </div>
        <FieldError name="status" />

        {v.status === "check-in" && dirty.length > 0 && (
          <p className="mt-3 flex gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="size-4 shrink-0" />
            Room {dirty.map((u) => u!.number).join(", ")} still needs cleaning —
            make sure it&rsquo;s ready before handing over the key.
          </p>
        )}

        <textarea
          {...register("internalNote")}
          rows={1}
          placeholder="Staff note"
          className={cn(textareaClass, "mt-4 bg-white")}
        />

        {errorCount > 0 && (
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-rose-600">
            <AlertCircle className="size-4" /> {errorCount} field
            {errorCount > 1 ? "s" : ""} need{errorCount === 1 ? "s" : ""}{" "}
            attention
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className={cn(hbtn.primary, "mt-4 h-11 w-full")}
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {submitLabel(v.status)}
        </button>
      </div>
    </div>
  );
}

/** Percent or flat discount on the room charge, with a reason; hidden behind a link until needed. */
function DiscountEditor() {
  const staff = useCurrentStaff();
  const limit = discountLimit(staff?.role);
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { isSubmitted } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const errValue = useErrorClass("discountValue");
  const errReason = useErrorClass("discountReason");
  const errNote = useErrorClass("discountNote");
  const opts = { shouldDirty: true, shouldValidate: isSubmitted };
  const value = toNum(v.discountValue);
  const percent = v.discountKind === "percent";

  return (
    <div className="rounded-md border border-neutral-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
          <BadgePercent className="size-4 text-emerald-600" /> Discount
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <Segmented
          value={v.discountKind}
          onChange={(k) => {
            setValue("discountKind", k, opts);
            setValue("discountValue", "", opts);
          }}
          options={[
            { value: "percent", label: "%" },
            { value: "amount", label: "৳" },
          ]}
          className="h-9 shrink-0"
        />
        <div className="relative min-w-0 flex-1">
          <input
            type="number"
            min={0}
            step={percent ? 0.5 : 1}
            {...register("discountValue")}
            placeholder={
              percent ? "Percent off room charge" : "Amount off whole stay"
            }
            aria-label={percent ? "Discount percent" : "Discount amount in BDT"}
            className={cn(inputClass, smallInput, "pr-10", errValue)}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
            {percent ? "%" : "BDT"}
          </span>
        </div>
      </div>
      <FieldError name="discountValue" />

      {percent && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {quickPercents
            .filter((p) => p <= limit)
            .map((p) => (
              <button
                key={p}
                type="button"
                onClick={() =>
                  setValue("discountValue", value === p ? "" : p, opts)
                }
                className={cn(
                  "rounded-md border px-2 py-0.5 text-xs font-medium transition",
                  value === p
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-neutral-200 text-neutral-600 hover:border-sky-300"
                )}
              >
                {p}%
              </button>
            ))}
        </div>
      )}

      {value > 0 && (
        <div className="mt-3 space-y-2">
          <div>
            <select
              {...register("discountReason")}
              aria-label="Discount reason"
              className={cn(inputClass, smallInput, errReason)}
            >
              <option value="">Reason for discount…</option>
              {discountReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <FieldError name="discountReason" />
          </div>
          <div>
            <input
              {...register("discountNote")}
              placeholder={
                v.discountReason === OTHER_REASON
                  ? "Describe the reason"
                  : "Details (optional), e.g. promo EID10"
              }
              aria-label="Discount details"
              className={cn(inputClass, smallInput, errNote)}
            />
            <FieldError name="discountNote" />
          </div>
        </div>
      )}
    </div>
  );
}
