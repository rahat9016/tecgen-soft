"use client";

import Image from "next/image";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { Banknote, CircleCheck, Landmark } from "lucide-react";
import { paymentMethodInfo } from "@/src/lib/hotelPayment";
import { taka } from "@/src/lib/hotel-store/format";
import { useHotelDB } from "@/src/lib/hotel-store/store";
import type { PayMethod } from "@/src/lib/hotel-store/types";
import { useT } from "@/src/lib/hotel-store/i18n";
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
  const t = useT();
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
    { value: "none", title: "Nothing now — pays at the hotel" },
    {
      value: "deposit",
      title: t("Deposit ({n}%)", { n: db.settings.depositRate }),
      amount: stay.deposit,
    },
    { value: "full", title: "Full payment", amount: stay.total },
    { value: "custom", title: "Other amount" },
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
          {t("Select dates and a room to set up payment.")}
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
      <p className={fieldLabel}>{t("How much is the guest paying now?")}</p>
      <div
        role="radiogroup"
        aria-label="Payment"
        className="grid gap-2 sm:grid-cols-2"
      >
        {plans.map((p) => {
          const on = plan === p.value;
          return (
            <div
              key={p.value}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-md border px-3.5 py-2 transition",
                on
                  ? "border-sky-600 bg-sky-50 ring-1 ring-sky-600"
                  : "border-neutral-200 bg-white hover:border-sky-300"
              )}
            >
              <button
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => choosePlan(p.value)}
                className={cn(
                  "flex flex-1 items-center gap-3 self-stretch text-left text-sm",
                  on ? "font-medium text-neutral-900" : "text-neutral-700",
                  focusRing
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                    on ? "border-sky-600" : "border-neutral-300"
                  )}
                >
                  {on && <span className="size-2 rounded-full bg-sky-600" />}
                </span>
                {t(p.title)}
                {p.amount !== undefined && (
                  <span className="ml-auto font-semibold tabular-nums text-neutral-900">
                    {taka(p.amount)}
                  </span>
                )}
              </button>
              {p.value === "custom" && on && (
                <div className="relative w-36 shrink-0">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                    ৳
                  </span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    autoFocus
                    value={v.payAmount}
                    onChange={(e) => setAmount(e.target.value)}
                    name="payAmount"
                    placeholder="0"
                    aria-label={t("Other amount")}
                    className={cn(
                      inputClass,
                      "h-9 pl-7 text-right font-semibold tabular-nums",
                      errAmount
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <FieldError name="payAmount" />

      {collecting && (
        <div className="mt-5 space-y-4">
          {/* Choosing an amount only plans it; money counts as paid once staff say it's in hand. */}
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={!v.payCollected}
              onChange={(e) =>
                setValue("payCollected", !e.target.checked, opts)
              }
              className="mt-0.5 size-4 rounded border-neutral-300 accent-sky-600"
            />
            <span>
              {t("Not received yet — collect later")}
              <span className="block text-xs text-neutral-500">
                {v.payCollected
                  ? t("Leave unticked when the money is in hand now.")
                  : t(plan === "deposit" ? "{amount} is noted as the deposit to collect. Nothing is recorded as paid." : "{amount} is noted as the amount to collect. Nothing is recorded as paid.", { amount: taka(planned) })}
              </span>
            </span>
          </label>

          {v.payCollected && (
            <>
              <div>
                <span className={fieldLabel}>{t("Paid by")}</span>
                <div
                  role="radiogroup"
                  aria-label={t("Payment method")}
                  className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5"
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
                          "flex h-10 min-w-0 items-center justify-center gap-2 rounded-md border bg-white px-3 text-[13px] font-medium text-neutral-800 transition",
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
                            width={40}
                            height={16}
                            className="h-4 w-10 shrink-0 object-contain"
                          />
                        ) : Icon ? (
                          <Icon className="size-4 shrink-0 text-neutral-500" />
                        ) : null}
                        <span className="truncate">{t(info.label)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {v.payMethod !== "cash" && (
                <FormField label="Transaction reference" name="payRef">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-neutral-500">
                      ৳
                    </span>
                    <input
                      {...register("payRef")}
                      placeholder={
                        v.payMethod === "bank"
                          ? t("Cheque or transfer no.")
                          : v.payMethod === "card"
                            ? t("Approval code")
                            : t("TrxID, e.g. 9F7K2LQ1")
                      }
                      className={cn(
                        inputClass,
                        "h-11 pl-9 uppercase placeholder:normal-case",
                        errRef
                      )}
                    />
                  </div>
                </FormField>
              )}
            </>
          )}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-200 pt-3.5">
        <span className="text-sm text-neutral-700">
          {t("Balance due")}
          {received > 0 && (
            <span className="ml-2 text-xs tabular-nums text-neutral-500">
              {taka(stay.total)} − {taka(received)} {t("paid")}
            </span>
          )}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-base font-semibold tabular-nums",
            balance > 0 ? "text-neutral-900" : "text-emerald-700"
          )}
        >
          {balance > 0 ? (
            taka(balance)
          ) : (
            <>
              {t("Fully paid")} <CircleCheck className="size-4" />
            </>
          )}
        </span>
      </div>
      <FieldError name="payPlan" />
    </Section>
  );
}
