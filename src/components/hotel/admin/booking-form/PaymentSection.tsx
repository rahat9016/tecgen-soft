"use client";

import Image from "next/image";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { Banknote, Landmark, Wallet } from "lucide-react";
import { paymentMethodInfo } from "@/src/lib/hotelPayment";
import { useHotelDB } from "@/src/lib/hotel-store/store";
import type { PayMethod } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { inputClass } from "../ui";
import { FormField, Section, useErrorClass } from "./parts";
import {
  computeStay,
  payMethods,
  payNowOf,
  type BookingFormValues,
  type PayPlan,
} from "./schema";

const bdt = (n: number) => `BDT ${Math.round(n).toLocaleString()}`;
/** Methods without a logo get an icon instead. */
const methodIcons: Partial<Record<PayMethod, typeof Banknote>> = {
  cash: Banknote,
  bank: Landmark,
};

function Radio({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
        on ? "border-sky-600" : "border-neutral-300"
      )}
    >
      {on && <span className="size-2 rounded-full bg-sky-600" />}
    </span>
  );
}

export default function PaymentSection({ step }: { step: number }) {
  const db = useHotelDB();
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { isSubmitted } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const { quote } = computeStay(db, v);
  const now = payNowOf(v, quote);
  const errAmount = useErrorClass("payAmount");
  const errRef = useErrorClass("payRef");
  const opts = { shouldDirty: true, shouldValidate: isSubmitted };

  const plans: {
    value: PayPlan;
    title: string;
    amount: number;
    badge?: string;
  }[] = [
    {
      value: "deposit",
      title: `Deposit ${db.settings.depositRate}%`,
      amount: quote.deposit,
      badge: "Recommended",
    },
    { value: "full", title: "Full amount", amount: quote.total },
    {
      value: "custom",
      title: "Other amount",
      amount: v.payPlan === "custom" ? now : 0,
    },
    { value: "none", title: "Pay at the hotel", amount: 0 },
  ];

  const empty = quote.total <= 0;

  return (
    <Section id="payment" step={step} icon={Wallet} title="Secure the booking">
      {empty ? (
        <p className="rounded-md border border-dashed border-neutral-200 py-8 text-center text-sm text-neutral-400">
          Select a room type to take payment
        </p>
      ) : (
        <>
          <div
            role="radiogroup"
            aria-label="How much the guest pays now"
            className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {plans.map((p) => {
              const on = v.payPlan === p.value;
              const amount = p.value === "custom" ? now : p.amount;
              const later = quote.total - amount;
              return (
                <button
                  key={p.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setValue("payPlan", p.value, opts)}
                  className={cn(
                    "relative flex flex-col rounded-md border p-3.5 text-left transition",
                    on
                      ? "border-sky-500 bg-sky-50/60 ring-2 ring-sky-100"
                      : "border-neutral-200 hover:border-sky-200"
                  )}
                >
                  {p.badge && (
                    <span className="absolute -top-2 right-3 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {p.badge}
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                    <Radio on={on} />
                    {p.title}
                  </span>
                  <span
                    className={cn(
                      "mt-2 text-lg font-extrabold tabular-nums",
                      p.value === "custom" && !on
                        ? "text-neutral-300"
                        : "text-neutral-900"
                    )}
                  >
                    {p.value === "custom" && !on ? "BDT —" : bdt(amount)}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {p.value === "none"
                      ? `${bdt(quote.total)} at the hotel`
                      : later > 0
                        ? `${bdt(later)} later`
                        : "Fully paid"}
                  </span>
                </button>
              );
            })}
          </div>

          {v.payPlan !== "none" && (
            <div className="mt-5 border-t border-neutral-100 pt-5">
              <div
                role="radiogroup"
                aria-label="Payment method"
                className="grid grid-cols-3 gap-2 md:grid-cols-6"
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
                        "flex h-16 flex-col items-center justify-center gap-1 rounded-md border px-2 transition",
                        on
                          ? "border-sky-500 bg-sky-50/60 ring-2 ring-sky-100"
                          : "border-neutral-200 hover:border-sky-200"
                      )}
                    >
                      <span className="flex h-6 items-center justify-center gap-1">
                        {info.logos.length ? (
                          info.logos.map((logo) => (
                            <Image
                              key={logo}
                              src={logo}
                              alt=""
                              width={44}
                              height={24}
                              className="max-h-5 w-auto object-contain"
                            />
                          ))
                        ) : Icon ? (
                          <Icon className="size-5 text-neutral-500" />
                        ) : null}
                      </span>
                      <span className="text-xs font-semibold text-neutral-800">
                        {info.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {(v.payPlan === "custom" || v.payMethod !== "cash") && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {v.payPlan === "custom" && (
                    <FormField label="Amount received (BDT)" name="payAmount">
                      <input
                        type="number"
                        min={0}
                        autoFocus
                        {...register("payAmount")}
                        placeholder="0"
                        className={cn(inputClass, errAmount)}
                      />
                    </FormField>
                  )}
                  {v.payMethod !== "cash" && (
                    <FormField label="Transaction ID / reference" name="payRef">
                      <input
                        {...register("payRef")}
                        placeholder={
                          v.payMethod === "bank"
                            ? "Cheque / transfer no."
                            : "e.g. 9F7K2LQ1"
                        }
                        className={cn(inputClass, errRef)}
                      />
                    </FormField>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Section>
  );
}
