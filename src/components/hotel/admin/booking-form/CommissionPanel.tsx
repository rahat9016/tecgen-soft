"use client";

import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { taka } from "@/src/lib/hotel-store/format";
import { useHotelDB } from "@/src/lib/hotel-store/store";
import { cn } from "@/src/lib/utils";
import { inputClass } from "../ui";
import { FormField, Segmented, useErrorClass } from "./parts";
import { computeStay, type BookingFormValues } from "./schema";

/** Agency that brought the booking and what the hotel owes it. Never added to the guest's bill. */
export default function CommissionPanel() {
  const db = useHotelDB();
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { isSubmitted } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const stay = computeStay(db, v);
  const c = v.commission;
  const percent = c.kind === "percent";
  const opts = { shouldDirty: true, shouldValidate: isSubmitted };
  const errName = useErrorClass("commission.name");
  const errValue = useErrorClass("commission.value");

  return (
    <div className="mt-5 rounded-md border border-neutral-200 bg-neutral-50/60 p-4">
      <p className="mb-3 flex items-center justify-between gap-3 text-sm font-semibold text-neutral-900">
        Agent &amp; commission
        <span className="text-xs font-normal text-neutral-600">
          Paid by the hotel · not on the guest&rsquo;s bill
        </span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.3fr)]">
        <FormField label="Agency name" name="commission.name">
          <input
            {...register("commission.name")}
            placeholder="e.g. ShareTrip, Bengal Tours"
            className={cn(inputClass, errName)}
          />
        </FormField>
        <FormField label="Agent phone (optional)" name="commission.phone">
          <input
            {...register("commission.phone")}
            type="tel"
            inputMode="tel"
            placeholder="01XXXXXXXXX"
            className={inputClass}
          />
        </FormField>
        <FormField
          label="Commission"
          name="commission.value"
          hint={
            stay.commission > 0
              ? `= ${taka(stay.commission)} on the room charge`
              : "On the room charge after discount"
          }
          className="sm:col-span-2 lg:col-span-1"
        >
          <div className="flex gap-2">
            <Segmented
              label="Commission type"
              value={c.kind}
              onChange={(k) => {
                setValue("commission.kind", k, opts);
                setValue("commission.value", "", opts);
              }}
              options={[
                { value: "percent", label: "%" },
                { value: "amount", label: "৳" },
              ]}
              className="h-10 shrink-0"
            />
            <input
              type="number"
              min={0}
              step={percent ? 0.5 : 1}
              {...register("commission.value")}
              placeholder={percent ? "e.g. 10" : "e.g. 500"}
              aria-label={
                percent ? "Commission percent" : "Commission amount in BDT"
              }
              className={cn(inputClass, "min-w-0 tabular-nums", errValue)}
            />
          </div>
        </FormField>
      </div>
    </div>
  );
}
