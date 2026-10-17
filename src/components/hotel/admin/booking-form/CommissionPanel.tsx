"use client";

import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { Building2, HandCoins, UserRound } from "lucide-react";
import { taka } from "@/src/lib/hotel-store/format";
import { useHotelDB } from "@/src/lib/hotel-store/store";
import { cn } from "@/src/lib/utils";
import { inputClass } from "../ui";
import { FormField, Segmented, useErrorClass } from "./parts";
import {
  commissionActive,
  computeStay,
  type BookingFormValues,
} from "./schema";

/** Who brought the booking and what the hotel owes them. Never added to the guest's bill. */
export default function CommissionPanel() {
  const db = useHotelDB();
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { isSubmitted } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const stay = computeStay(db, v);
  const c = v.commission;
  const agent = v.source === "agent";
  const active = commissionActive(v);
  const opts = { shouldDirty: true, shouldValidate: isSubmitted };
  const errName = useErrorClass("commission.name");
  const errValue = useErrorClass("commission.value");
  const percent = c.kind === "percent";

  return (
    <div
      className={cn(
        "mt-6 rounded-md border",
        active ? "border-violet-200 bg-violet-50/30" : "border-neutral-200"
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
          <HandCoins className="size-4 text-violet-600" />
          {agent ? "Agent & commission" : "Commission / referral"}
        </p>
        {agent ? (
          stay.commission > 0 && (
            <span className="text-sm font-bold tabular-nums text-violet-700">
              {taka(stay.commission)}
            </span>
          )
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={c.enabled}
            aria-label="Commission"
            onClick={() => setValue("commission.enabled", !c.enabled, opts)}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition",
              c.enabled ? "bg-violet-600" : "bg-neutral-200"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
                c.enabled ? "left-[22px]" : "left-0.5"
              )}
            />
          </button>
        )}
      </div>

      {active && (
        <div className="grid gap-4 border-t border-violet-100 px-4 py-4 md:grid-cols-2">
          {!agent && (
            <FormField label="Paid to" className="md:col-span-2">
              <Segmented
                value={c.to}
                onChange={(to) => setValue("commission.to", to, opts)}
                options={[
                  { value: "person", label: "Person", icon: UserRound },
                  { value: "agency", label: "Agency", icon: Building2 },
                ]}
                className="h-10"
              />
            </FormField>
          )}
          <FormField
            label={agent || c.to === "agency" ? "Agency name" : "Person's name"}
            name="commission.name"
          >
            <input
              {...register("commission.name")}
              placeholder={
                agent || c.to === "agency"
                  ? "e.g. ShareTrip, Bengal Tours"
                  : "e.g. Karim (driver)"
              }
              className={cn(inputClass, "bg-white", errName)}
            />
          </FormField>
          <FormField label="Phone (optional)" name="commission.phone">
            <input
              {...register("commission.phone")}
              type="tel"
              placeholder="01XXXXXXXXX"
              className={cn(inputClass, "bg-white")}
            />
          </FormField>
          <FormField
            label="Commission"
            name="commission.value"
            className="md:col-span-2"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Segmented
                value={c.kind}
                onChange={(k) => {
                  setValue("commission.kind", k, opts);
                  setValue("commission.value", "", opts);
                }}
                options={[
                  { value: "percent", label: "%" },
                  { value: "amount", label: "৳" },
                ]}
                className="h-10"
              />
              <div className="relative w-40">
                <input
                  type="number"
                  min={0}
                  step={percent ? 0.5 : 1}
                  {...register("commission.value")}
                  placeholder="0"
                  className={cn(inputClass, "bg-white pr-12", errValue)}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                  {percent ? "%" : "BDT"}
                </span>
              </div>
              {stay.commission > 0 && (
                <span className="text-sm text-neutral-600">
                  ={" "}
                  <b className="tabular-nums text-violet-700">
                    {taka(stay.commission)}
                  </b>
                </span>
              )}
            </div>
          </FormField>
        </div>
      )}
    </div>
  );
}
