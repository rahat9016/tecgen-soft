"use client";

import Image from "next/image";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { Banknote, CircleCheck, Clock, Landmark } from "lucide-react";
import { paymentMethodInfo } from "@/src/lib/hotelPayment";
import { taka } from "@/src/lib/hotel-store/format";
import { useHotelDB } from "@/src/lib/hotel-store/store";
import type { PayMethod } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { inputClass } from "../ui";
import {
  FieldError,
  fieldLabel,
  focusRing,
  FormField,
  Section,
  useErrorClass,
} from "./parts";
import {
  computeStay,
  payMethods,
  planAmountOf,
  receivedOf,
  type BookingFormValues,
  type PayPlan,
} from "./schema";

/** Methods without a logo get an icon instead. */
const methodIcons: Partial<Record<PayMethod, typeof Banknote>> = {
  cash: Banknote,
  bank: Landmark,
};

export default function PaymentSection({ step }: { step: number }) {
  const db = useHotelDB();
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { isSubmitted } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const stay = computeStay(db, v);
  const planned = planAmountOf(v, stay);
  const received = receivedOf(v, stay);
  const balance = stay.total - received;
  const errAmount = useErrorClass("payAmount");
  const errRef = useErrorClass("payRef");
  const opts = { shouldDirty: true, shouldValidate: isSubmitted };
  const plan = v.payPlan;
  const collecting = plan !== "none";

  const plans: { value: PayPlan; title: string; amount?: number }[] = [
    { value: "none", title: "No payment collected" },
    {
      value: "deposit",
      title: `Deposit (${db.settings.depositRate}%)`,
      amount: stay.deposit,
    },
    { value: "full", title: "Full amount", amount: stay.total },
    { value: "custom", title: "Custom amount" },
  ];

  const choosePlan = (p: PayPlan) => {
    setValue("payPlan", p, opts);
    if (p === "none") setValue("payCollected", false, opts);
  };

  /** Typing over a deposit or full amount turns it into a custom amount. */
  const setAmount = (raw: string) => {
    if (plan !== "custom") setValue("payPlan", "custom", opts);
    setValue("payAmount", raw, opts);
  };

  if (stay.total <= 0) {
    return (
      <Section id="payment" step={step} title="Payment">
        <p className="rounded-md border border-dashed border-neutral-300 px-4 py-5 text-center text-sm text-neutral-600">
          Select dates and a room to set up payment.
        </p>
      </Section>
    );
  }

  return (
    <Section
      id="payment"
      step={step}
      title="Payment"
      sub={`Total ${taka(stay.total)}`}
    >
      <div
        role="radiogroup"
        aria-label="Payment"
        className="grid grid-cols-2 gap-2 lg:grid-cols-4"
      >
        {plans.map((p) => {
          const on = plan === p.value;
          return (
            <button
              key={p.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => choosePlan(p.value)}
              className={cn(
                "flex min-h-15 flex-col justify-center rounded-md border px-3 py-2 text-left transition",
                on
                  ? "border-sky-600 bg-sky-50 ring-1 ring-sky-600"
                  : "border-neutral-200 bg-white hover:border-sky-300",
                focusRing
              )}
            >
              <span className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
                <span
                  className={cn(
                    "flex size-3.5 shrink-0 items-center justify-center rounded-full border-2",
                    on ? "border-sky-600" : "border-neutral-400"
                  )}
                >
                  {on && <span className="size-1.5 rounded-full bg-sky-600" />}
                </span>
                {p.title}
              </span>
              {p.amount !== undefined && (
                <span className="mt-0.5 pl-5.5 text-sm font-semibold tabular-nums text-neutral-700">
                  {taka(p.amount)}
                </span>
              )}
              {p.value === "custom" && (
                <span className="mt-0.5 pl-5.5 text-xs text-neutral-600">
                  {plan === "custom" ? taka(planned) : "Enter any amount"}
                </span>
              )}
              {p.value === "none" && (
                <span className="mt-0.5 pl-5.5 text-xs text-neutral-600">
                  Pays at the hotel
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!collecting ? (
        <p className="mt-4 flex items-center justify-between gap-3 rounded-md bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-700">
          Nothing recorded now. The guest pays at the hotel.
          <span className="shrink-0 font-semibold tabular-nums text-neutral-900">
            Balance {taka(stay.total)}
          </span>
        </p>
      ) : (
        <div className="mt-4 rounded-md border border-neutral-200">
          {/* Choosing an amount only plans it; money counts as paid once staff say it's in hand. */}
          <div
            role="radiogroup"
            aria-label="Has the money been received?"
            className="grid grid-cols-2 border-b border-neutral-200 text-sm"
          >
            {[
              {
                value: true,
                title: "Received now",
                text: "Record the payment",
                icon: CircleCheck,
              },
              {
                value: false,
                title: "Not received yet",
                text:
                  plan === "deposit"
                    ? "Deposit is requested only"
                    : "Amount is requested only",
                icon: Clock,
              },
            ].map((o) => {
              const on = v.payCollected === o.value;
              return (
                <button
                  key={String(o.value)}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setValue("payCollected", o.value, opts)}
                  className={cn(
                    "flex items-start gap-2 px-3.5 py-2.5 text-left transition first:rounded-tl-md last:rounded-tr-md first:border-r first:border-neutral-200",
                    on
                      ? o.value
                        ? "bg-emerald-50 text-emerald-900"
                        : "bg-amber-50 text-amber-900"
                      : "bg-white text-neutral-700 hover:bg-neutral-50",
                    focusRing
                  )}
                >
                  <o.icon
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      on
                        ? o.value
                          ? "text-emerald-700"
                          : "text-amber-700"
                        : "text-neutral-400"
                    )}
                  />
                  <span>
                    <span className="block font-semibold">{o.title}</span>
                    <span className="block text-xs opacity-80">{o.text}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-4 p-3.5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label={v.payCollected ? "Amount received" : "Amount requested"}
                name="payAmount"
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                    ৳
                  </span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={plan === "custom" ? v.payAmount : planned}
                    onChange={(e) => setAmount(e.target.value)}
                    name="payAmount"
                    placeholder="0"
                    className={cn(
                      inputClass,
                      "pl-7 font-semibold tabular-nums",
                      errAmount
                    )}
                  />
                </div>
              </FormField>
              <div>
                <span className={fieldLabel}>Remaining balance</span>
                <p className="flex h-10 items-center justify-between rounded-md bg-neutral-50 px-3 text-sm">
                  <span className="text-neutral-600">
                    {taka(stay.total)} − {taka(received)}
                  </span>
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      balance > 0 ? "text-amber-800" : "text-emerald-700"
                    )}
                  >
                    {taka(balance)}
                  </span>
                </p>
              </div>
            </div>

            {v.payCollected ? (
              <>
                <div>
                  <span className={fieldLabel}>Payment method</span>
                  <div
                    role="radiogroup"
                    aria-label="Payment method"
                    className="grid grid-cols-3 gap-2 sm:grid-cols-5"
                  >
                    {payMethods.map((m) => {
                      const info = paymentMethodInfo[m];
                      const Icon = methodIcons[m];
                      const on = v.payMethod === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setValue("payMethod", m, opts)}
                          className={cn(
                            "flex h-10 items-center justify-center gap-1.5 rounded-md border px-2 text-[13px] font-semibold text-neutral-800 transition",
                            on
                              ? "border-sky-600 bg-sky-50 ring-1 ring-sky-600"
                              : "border-neutral-200 hover:border-sky-300",
                            focusRing
                          )}
                        >
                          {info.logos.length ? (
                            <Image
                              src={info.logos[0]}
                              alt=""
                              width={36}
                              height={20}
                              className="max-h-4 w-auto object-contain"
                            />
                          ) : Icon ? (
                            <Icon className="size-4 text-neutral-600" />
                          ) : null}
                          {info.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {v.payMethod !== "cash" && (
                  <FormField
                    label="Transaction reference"
                    name="payRef"
                    className="sm:max-w-sm"
                  >
                    <input
                      {...register("payRef")}
                      placeholder={
                        v.payMethod === "bank"
                          ? "Cheque or transfer no."
                          : v.payMethod === "card"
                            ? "Approval code"
                            : "TrxID, e.g. 9F7K2LQ1"
                      }
                      className={cn(
                        inputClass,
                        "uppercase placeholder:normal-case",
                        errRef
                      )}
                    />
                  </FormField>
                )}
              </>
            ) : (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {taka(planned)} is noted as{" "}
                {plan === "deposit"
                  ? "the deposit to collect"
                  : "the amount to collect"}
                . Nothing is recorded as paid until it&rsquo;s received.
              </p>
            )}
          </div>
        </div>
      )}
      <FieldError name="payPlan" />
    </Section>
  );
}
