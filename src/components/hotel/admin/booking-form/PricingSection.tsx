"use client";

import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { BadgePercent, Wallet } from "lucide-react";
import { discountLimit } from "@/src/lib/hotel-store/auth";
import { payLabels, roleLabels, taka } from "@/src/lib/hotel-store/format";
import { useCurrentStaff, useHotelDB } from "@/src/lib/hotel-store/store";
import { cn } from "@/src/lib/utils";
import { hbtn, inputClass } from "../ui";
import { FormField, Section, Segmented, useErrorClass } from "./parts";
import { computeStay, discountReasons, OTHER_REASON, payMethods, toNum, type BookingFormValues } from "./schema";

const quickPercents = [5, 10, 15, 20, 25, 50];

export function PricingSection({ step }: { step: number }) {
  const db = useHotelDB();
  const staff = useCurrentStaff();
  const limit = discountLimit(staff?.role);
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { isSubmitted } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const { type, nights, rooms, rate, quote, discountPct } = computeStay(db, v);
  const errRate = useErrorClass("rate");
  const errDisc = useErrorClass("discountValue");
  const errReason = useErrorClass("discountReason");
  const errNote = useErrorClass("discountNote");
  const opts = { shouldDirty: true, shouldValidate: isSubmitted };
  const rack = type?.price ?? 0;
  const hasDiscount = quote.discount > 0;
  const roomNights = Math.max(0, nights) * rooms;

  return (
    <Section id="pricing" step={step} icon={BadgePercent} title="Rate & discount" sub="Service charge and VAT are worked out after the discount.">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Rate per room / night (BDT)"
          name="rate"
          hint={
            type &&
            (rate !== rack ? (
              <>
                Rack rate {taka(rack)} ·{" "}
                <button type="button" onClick={() => setValue("rate", rack, opts)} className="font-medium text-sky-700 hover:underline">
                  reset
                </button>
              </>
            ) : (
              "Rack rate. Change it for a negotiated or corporate price."
            ))
          }
        >
          <input type="number" min={1} {...register("rate")} className={cn(inputClass, errRate)} />
        </FormField>
        <FormField label="Room charge" hint={roomNights ? `${taka(rate)} × ${nights} night${nights > 1 ? "s" : ""}${rooms > 1 ? ` × ${rooms} rooms` : ""}` : undefined}>
          <p className="flex h-10 items-center rounded-md bg-neutral-50 px-3 text-sm font-semibold tabular-nums text-neutral-900">{taka(quote.subtotal)}</p>
        </FormField>
      </div>

      <div className="mt-6 rounded-md border border-neutral-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-neutral-900">Discount</p>
          <span className="text-[11px] text-neutral-500">
            Your limit: <b className="text-neutral-700">{limit}%</b>
            {staff && ` (${roleLabels[staff.role]})`}
          </span>
        </div>

        <div className="mt-3 grid gap-4 sm:grid-cols-[auto_1fr]">
          <FormField label="Type">
            <Segmented
              value={v.discountKind}
              onChange={(k) => {
                setValue("discountKind", k, opts);
                setValue("discountValue", "", opts);
              }}
              options={[
                { value: "percent", label: "Percent %" },
                { value: "amount", label: "Flat ৳" },
              ]}
              className="h-10 w-full"
            />
          </FormField>
          <FormField label={v.discountKind === "percent" ? "Percent off the room charge" : "Amount off the whole stay"} name="discountValue">
            <div className="relative">
              <input
                type="number"
                min={0}
                step={v.discountKind === "percent" ? 0.5 : 1}
                {...register("discountValue")}
                placeholder="0"
                className={cn(inputClass, "pr-14", errDisc)}
                aria-label={v.discountKind === "percent" ? "Discount percent" : "Discount amount in BDT"}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">{v.discountKind === "percent" ? "%" : "BDT"}</span>
            </div>
          </FormField>
        </div>

        {v.discountKind === "percent" && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {quickPercents
              .filter((p) => p <= limit)
              .map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValue("discountValue", toNum(v.discountValue) === p ? "" : p, opts)}
                  className={cn("rounded-md border px-2.5 py-1 text-xs font-medium transition", toNum(v.discountValue) === p ? "border-sky-500 bg-sky-50 text-sky-700" : "border-neutral-200 text-neutral-600 hover:border-sky-300")}
                >
                  {p}%
                </button>
              ))}
          </div>
        )}

        {toNum(v.discountValue) > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Reason" name="discountReason">
              <select {...register("discountReason")} className={cn(inputClass, errReason)}>
                <option value="">Choose…</option>
                {discountReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={v.discountReason === OTHER_REASON ? "Describe" : "Details (optional)"} name="discountNote">
              <input {...register("discountNote")} placeholder="e.g. Approved by GM, promo code EID10" className={cn(inputClass, errNote)} />
            </FormField>
          </div>
        )}

        {hasDiscount && (
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-md bg-emerald-50 p-3 text-xs text-emerald-900">
            <div>
              <p className="text-emerald-700">Guest saves</p>
              <p className="text-sm font-bold tabular-nums">{taka(quote.discount)}</p>
            </div>
            <div>
              <p className="text-emerald-700">Effective</p>
              <p className="text-sm font-bold tabular-nums">{discountPct.toFixed(discountPct % 1 ? 1 : 0)}% off</p>
            </div>
            <div>
              <p className="text-emerald-700">Per room / night</p>
              <p className="text-sm font-bold tabular-nums">{roomNights ? taka(quote.net / roomNights) : "—"}</p>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

export function PaymentSection({ step }: { step: number }) {
  const db = useHotelDB();
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { isSubmitted } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const { quote } = computeStay(db, v);
  const amount = toNum(v.payAmount);
  const errAmount = useErrorClass("payAmount");
  const errRef = useErrorClass("payRef");
  const opts = { shouldDirty: true, shouldValidate: isSubmitted };

  const presets = [
    { label: "Nothing now", value: 0 },
    { label: `Deposit ${db.settings.depositRate}%`, value: quote.deposit },
    { label: "Full amount", value: quote.total },
  ];

  return (
    <Section id="payment" step={step} icon={Wallet} title="Payment now" sub="What the guest pays at the desk today. The rest is collected later.">
      <span className="mb-2 block text-xs font-medium text-neutral-600">Method</span>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {payMethods.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setValue("payMethod", m, opts)}
            aria-pressed={v.payMethod === m}
            className={cn("h-10 rounded-md border text-sm font-medium transition", v.payMethod === m ? "border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-100" : "border-neutral-200 text-neutral-600 hover:border-sky-300")}
          >
            {payLabels[m]}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormField label="Amount received (BDT)" name="payAmount">
          <input type="number" min={0} {...register("payAmount")} placeholder="0" className={cn(inputClass, errAmount)} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setValue("payAmount", p.value, opts)}
                className={cn(hbtn.small, amount === p.value && "border-sky-500 bg-sky-50 text-sky-700")}
              >
                {p.label}
                {p.value > 0 && <span className="tabular-nums text-neutral-400">{taka(p.value)}</span>}
              </button>
            ))}
          </div>
        </FormField>
        {v.payMethod !== "cash" && amount > 0 && (
          <FormField label="Transaction ID / reference" name="payRef" hint={v.payMethod === "card" ? "Last 4 digits or approval code" : "From the guest's confirmation SMS"}>
            <input {...register("payRef")} placeholder={v.payMethod === "bank" ? "Cheque / transfer no." : "e.g. 9F7K2LQ1"} className={cn(inputClass, errRef)} />
          </FormField>
        )}
      </div>
    </Section>
  );
}
