"use client";

import { useState } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import {
  AlertCircle,
  CalendarDays,
  DoorOpen,
  Loader2,
  Plus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { discountLimit } from "@/src/lib/hotel-store/auth";
import { dateLabel, taka } from "@/src/lib/hotel-store/format";
import {
  unitNumbers,
  useCurrentStaff,
  useHotelDB,
} from "@/src/lib/hotel-store/store";
import { cn } from "@/src/lib/utils";
import { hbtn, inputClass, textareaClass } from "../ui";
import {
  Disclosure,
  FieldError,
  focusRing,
  Segmented,
  useErrorClass,
} from "./parts";
import {
  composeGuest,
  computeStay,
  discountReasons,
  OTHER_REASON,
  planAmountOf,
  receivedOf,
  toNum,
  type BookingFormValues,
  type BookingStatusChoice,
} from "./schema";

export const submitLabel = (status: BookingStatusChoice) =>
  status === "check-in" ? "Create booking & check in" : "Create booking";

/** Leaf error count, e.g. guest.fullName and guest.phone count as two. */
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

const fullDate = (key: string) => dateLabel(key, "EEE, d MMM yyyy");

/** Sticky summary: what's booked, what it costs, what's been paid — and the submit button. */
export default function SummaryPanel({ saving }: { saving: boolean }) {
  const db = useHotelDB();
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { errors, isSubmitted } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const stay = computeStay(db, v);
  const { nights, quote, lines, commission, extras, extraBeds, total } = stay;
  const received = receivedOf(v, stay);
  const planned = planAmountOf(v, stay);
  const balance = total - received;
  const adults = toNum(v.adults);
  const children = toNum(v.children);
  const errorCount = isSubmitted ? countErrors(errors) : 0;
  const checkingIn = v.status === "check-in";
  const name = v.guest?.fullName?.trim() ? composeGuest(v.guest).name : "";
  const { serviceFeeRate, vatRate } = db.settings;

  return (
    <aside
      id="bf-summary"
      aria-label="Booking summary"
      className="scroll-mt-24 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm"
    >
      <div className="border-b border-neutral-100 px-4 py-3">
        <h2 className="text-[15px] font-semibold text-neutral-900">
          Booking summary
        </h2>
      </div>

      <div className="space-y-4 p-4">
        <ul className="space-y-2 text-sm text-neutral-800">
          <Row icon={CalendarDays}>
            {nights > 0 ? (
              <>
                <span className="block">
                  {fullDate(v.checkIn)} → {fullDate(v.checkOut)}
                </span>
                <span className="text-xs text-neutral-600">
                  {nights} night{nights > 1 ? "s" : ""}
                </span>
              </>
            ) : (
              <span className="text-neutral-500">Dates not set</span>
            )}
          </Row>
          <Row icon={Users}>
            {adults} adult{adults !== 1 ? "s" : ""}
            {children > 0 &&
              `, ${children} ${children === 1 ? "child" : "children"}`}
          </Row>
          {name && (
            <Row icon={UserRound}>
              <span className="font-medium">{name}</span>
            </Row>
          )}
          {lines.length > 0 && (
            <Row icon={DoorOpen}>
              <ul className="space-y-0.5">
                {lines.map((l, i) => {
                  const [number] = unitNumbers(db, l.line.unitIds);
                  return (
                    <li key={i}>
                      {number ? (
                        <span className="font-medium">Room {number}</span>
                      ) : (
                        <span
                          className={
                            checkingIn
                              ? "font-medium text-rose-700"
                              : "text-amber-800"
                          }
                        >
                          Room not assigned
                        </span>
                      )}
                      <span className="block text-xs text-neutral-600">
                        {[l.type?.beds, `sleeps ${l.capacity}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Row>
          )}
        </ul>

        {!lines.length || nights <= 0 ? (
          <p className="rounded-md border border-dashed border-neutral-300 py-5 text-center text-sm text-neutral-600">
            Select dates and a room to see the price
          </p>
        ) : (
          <>
            <dl className="space-y-2 border-t border-neutral-100 pt-3 text-sm">
              {lines.map((l, i) => (
                <Line
                  key={i}
                  label={
                    <>
                      {l.line.unitIds[0]
                        ? `Room ${unitNumbers(db, l.line.unitIds)[0]}`
                        : "Room (not assigned)"}
                      <span className="block text-xs text-neutral-600">
                        {taka(l.rate)} × {nights} night{nights > 1 ? "s" : ""}
                        {l.rooms > 1 && ` × ${l.rooms} rooms`}
                      </span>
                    </>
                  }
                  value={taka(l.quote.subtotal)}
                />
              ))}
              <DiscountEditor amount={quote.discount} />
              <Line
                label={`Service charge (${serviceFeeRate}%)`}
                value={taka(quote.serviceFee)}
                muted
              />
              <Line label={`VAT (${vatRate}%)`} value={taka(quote.tax)} muted />
              {extras > 0 && (
                <Line
                  label={`Extra bed × ${extraBeds} · ${nights} night${nights > 1 ? "s" : ""}`}
                  value={taka(extras)}
                  muted
                />
              )}
            </dl>

            <div className="flex items-baseline justify-between border-t border-neutral-200 pt-3">
              <span className="font-semibold text-neutral-900">Total</span>
              <span className="text-2xl font-bold tabular-nums text-neutral-900">
                {taka(total)}
              </span>
            </div>
            <dl className="space-y-1.5 text-sm">
              <Line
                label="Amount received"
                value={received > 0 ? taka(received) : taka(0)}
                tone={received > 0 ? "text-emerald-700" : undefined}
              />
              {!v.payCollected && planned > 0 && (
                <p className="text-xs text-amber-800">
                  {taka(planned)}{" "}
                  {v.payPlan === "deposit" ? "deposit" : "payment"} requested —
                  not received
                </p>
              )}
              <div
                className={cn(
                  "flex items-baseline justify-between rounded-md px-2.5 py-2",
                  balance > 0 ? "bg-amber-50" : "bg-emerald-50"
                )}
              >
                <dt
                  className={cn(
                    "font-semibold",
                    balance > 0 ? "text-amber-900" : "text-emerald-800"
                  )}
                >
                  {balance > 0 ? "Balance due" : "Fully paid"}
                </dt>
                <dd
                  className={cn(
                    "text-base font-bold tabular-nums",
                    balance > 0 ? "text-amber-900" : "text-emerald-800"
                  )}
                >
                  {taka(balance)}
                </dd>
              </div>
            </dl>
            {commission > 0 && (
              <p className="flex justify-between gap-3 text-xs text-neutral-600">
                <span className="truncate">
                  Agent commission · {v.commission.name || "agent"} (paid by
                  hotel)
                </span>
                <span className="shrink-0 tabular-nums">
                  {taka(commission)}
                </span>
              </p>
            )}
          </>
        )}
      </div>

      <div className="space-y-3 border-t border-neutral-100 bg-neutral-50/70 p-4">
        {!checkingIn && (
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-neutral-800">
              Reservation status
            </p>
            <Segmented
              label="Reservation status"
              value={v.status}
              onChange={(s) =>
                setValue("status", s, {
                  shouldDirty: true,
                  shouldValidate: isSubmitted,
                })
              }
              options={[
                { value: "confirmed", label: "Confirmed" },
                { value: "tentative", label: "Tentative" },
              ]}
              className="w-full bg-white"
            />
            <p className="mt-1 text-xs text-neutral-600">
              {v.status === "tentative"
                ? "Rooms are held as pending until the guest confirms or pays."
                : "Rooms are held for the guest."}
            </p>
          </div>
        )}

        <Disclosure
          title="Internal note"
          summary={v.internalNote.trim() ? "Added" : "Staff only"}
          defaultOpen={!!v.internalNote}
          className="bg-white"
        >
          <textarea
            {...register("internalNote")}
            rows={2}
            aria-label="Internal note"
            placeholder="Visible to staff only"
            className={textareaClass}
          />
        </Disclosure>

        {errorCount > 0 && (
          <p
            role="alert"
            className="flex items-center gap-2 text-sm font-medium text-rose-700"
          >
            <AlertCircle className="size-4" /> {errorCount} field
            {errorCount > 1 ? "s" : ""} need{errorCount === 1 ? "s" : ""}{" "}
            attention
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          aria-busy={saving}
          className={cn(hbtn.primary, "h-11 w-full text-[15px]", focusRing)}
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving…" : submitLabel(v.status)}
        </button>
      </div>
    </aside>
  );
}

function Row({
  icon: Icon,
  children,
}: {
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-neutral-500" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

function Line({
  label,
  value,
  muted,
  tone,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  muted?: boolean;
  tone?: string;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-3",
        muted ? "text-neutral-700" : "text-neutral-900",
        tone
      )}
    >
      <dt className="min-w-0">{label}</dt>
      <dd className="shrink-0 tabular-nums">{value}</dd>
    </div>
  );
}

/** One input with a ৳ / % switch and a reason, hidden behind "Add discount" until needed. */
function DiscountEditor({ amount }: { amount: number }) {
  const staff = useCurrentStaff();
  const limit = discountLimit(staff?.role);
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { isSubmitted, errors } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const [open, setOpen] = useState(false);
  const errValue = useErrorClass("discountValue");
  const errReason = useErrorClass("discountReason");
  const errNote = useErrorClass("discountNote");
  const opts = { shouldDirty: true, shouldValidate: isSubmitted };
  const value = toNum(v.discountValue);
  const percent = v.discountKind === "percent";
  const shown = open || value > 0 || !!errors.discountValue;

  const clear = () => {
    setValue("discountValue", "", opts);
    setValue("discountReason", "", opts);
    setValue("discountNote", "", opts);
    setOpen(false);
  };

  if (!shown)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 text-[13px] font-medium text-sky-700 hover:underline",
          focusRing
        )}
      >
        <Plus className="size-3.5" /> Add discount
      </button>
    );

  return (
    <div className="rounded-md border border-neutral-200 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-neutral-800">
          Discount
        </span>
        <span className="flex items-center gap-2">
          {amount > 0 && (
            <span className="text-sm font-semibold tabular-nums text-emerald-700">
              −{taka(amount)}
            </span>
          )}
          <button
            type="button"
            onClick={clear}
            aria-label="Remove discount"
            className={cn(hbtn.icon, "size-6", focusRing)}
          >
            <X className="size-3.5" />
          </button>
        </span>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          type="number"
          min={0}
          step={percent ? 0.5 : 1}
          autoFocus={open && !value}
          {...register("discountValue")}
          placeholder="0"
          aria-label={percent ? "Discount percent" : "Discount amount in BDT"}
          className={cn(inputClass, "h-9 min-w-0 tabular-nums", errValue)}
        />
        <Segmented
          label="Discount type"
          value={v.discountKind}
          onChange={(k) => {
            setValue("discountKind", k, opts);
            setValue("discountValue", "", opts);
          }}
          options={[
            { value: "amount", label: "৳" },
            { value: "percent", label: "%" },
          ]}
          className="shrink-0 bg-white"
        />
      </div>
      <FieldError name="discountValue" />
      <p className="mt-1 text-xs text-neutral-600">
        On the room charge · your limit is {limit}%
      </p>
      {value > 0 && (
        <div className="mt-2 space-y-2">
          <div>
            <select
              {...register("discountReason")}
              aria-label="Discount reason"
              className={cn(inputClass, "h-9", errReason)}
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
          {(v.discountReason === OTHER_REASON || v.discountNote) && (
            <div>
              <input
                {...register("discountNote")}
                placeholder={
                  v.discountReason === OTHER_REASON
                    ? "Describe the reason"
                    : "Details, e.g. promo EID10"
                }
                aria-label="Discount details"
                className={cn(inputClass, "h-9", errNote)}
              />
              <FieldError name="discountNote" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
