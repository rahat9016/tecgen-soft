"use client";

import { useController, useFormContext, useWatch } from "react-hook-form";
import { Check } from "lucide-react";
import { countries } from "@/src/data/countries";
import { cn } from "@/src/lib/utils";
import { inputClass, textareaClass } from "../ui";
import { FormField, Segmented, useErrorClass } from "./parts";
import {
  arrivalOptions,
  requestOptions,
  titles,
  type BookingFormValues,
} from "./schema";

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-neutral-100 pt-5 first:border-0 first:pt-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </p>
      {children}
    </div>
  );
}

/** The website's "Who's checking in / Identification / Arrival & requests" fields, for the front desk. */
export default function GuestFields() {
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const [country, phoneCountry, idType, status] = useWatch({
    control,
    name: ["guest.country", "guest.phoneCountry", "guest.idType", "status"],
  });
  const requests = useController({ control, name: "guest.requests" }).field;
  const picked: string[] = requests.value ?? [];
  const local = country === "BD";
  const idKind = local ? idType : "passport";
  const err = {
    firstName: useErrorClass("guest.firstName"),
    otherCountry: useErrorClass("guest.otherCountry"),
    customDial: useErrorClass("guest.customDial"),
    phone: useErrorClass("guest.phone"),
    email: useErrorClass("guest.email"),
    id: useErrorClass("guest.idNumber"),
  };

  return (
    <div className="space-y-5">
      <Group title="Who's checking in">
        <div className="grid gap-4 sm:grid-cols-[100px_1fr_1fr]">
          <FormField label="Title">
            <select {...register("guest.title")} className={inputClass}>
              {titles.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </FormField>
          <FormField label="First name" name="guest.firstName">
            <input
              {...register("guest.firstName")}
              placeholder="e.g. Tamim"
              autoComplete="off"
              className={cn(inputClass, err.firstName)}
            />
          </FormField>
          <FormField label="Last name" name="guest.lastName">
            <input
              {...register("guest.lastName")}
              placeholder="e.g. Rahman"
              autoComplete="off"
              className={inputClass}
            />
          </FormField>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Mobile number" name="guest.phone">
            <div className="flex gap-2">
              <select
                {...register("guest.phoneCountry")}
                aria-label="Country code"
                className={cn(inputClass, "w-28 shrink-0 sm:w-32")}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    +{c.dial} {c.code}
                  </option>
                ))}
                <option value="OTHER">Other</option>
              </select>
              {phoneCountry === "OTHER" && (
                <input
                  {...register("guest.customDial")}
                  placeholder="+971"
                  aria-label="Dial code"
                  className={cn(inputClass, "w-20 shrink-0", err.customDial)}
                />
              )}
              <input
                {...register("guest.phone")}
                type="tel"
                inputMode="tel"
                placeholder={
                  phoneCountry === "BD" ? "01XXXXXXXXX" : "Phone number"
                }
                autoComplete="off"
                className={cn(inputClass, "min-w-0", err.phone)}
              />
            </div>
          </FormField>
          <FormField label="Email (optional)" name="guest.email">
            <input
              {...register("guest.email")}
              type="email"
              placeholder="guest@example.com"
              autoComplete="off"
              className={cn(inputClass, err.email)}
            />
          </FormField>
          <FormField label="Country of residence" name="guest.country">
            <select
              {...register("guest.country", {
                // Picking a country pre-fills its dialling code.
                onChange: (e) =>
                  e.target.value !== "OTHER" &&
                  setValue("guest.phoneCountry", e.target.value),
              })}
              className={inputClass}
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
              <option value="OTHER">Other country…</option>
            </select>
          </FormField>
          {country === "OTHER" && (
            <FormField label="Country name" name="guest.otherCountry">
              <input
                {...register("guest.otherCountry")}
                placeholder="e.g. Brazil"
                className={cn(inputClass, err.otherCountry)}
              />
            </FormField>
          )}
        </div>
      </Group>

      <Group title="Identification">
        <div className="flex flex-wrap items-end gap-4">
          {local && (
            <FormField label="Document">
              <Segmented
                value={idType}
                onChange={(t) =>
                  setValue("guest.idType", t, { shouldDirty: true })
                }
                options={[
                  { value: "nid", label: "National ID (NID)" },
                  { value: "passport", label: "Passport" },
                ]}
                className="h-10"
              />
            </FormField>
          )}
          <FormField
            label={`${idKind === "nid" ? "NID" : "Passport"} number${status === "check-in" ? "" : " (optional)"}`}
            name="guest.idNumber"
            className="min-w-0 flex-1 sm:max-w-sm"
          >
            <input
              {...register("guest.idNumber")}
              placeholder={
                idKind === "nid" ? "10, 13 or 17 digits" : "e.g. A01234567"
              }
              autoComplete="off"
              className={cn(
                inputClass,
                "uppercase placeholder:normal-case",
                err.id
              )}
            />
          </FormField>
        </div>
      </Group>

      <Group title="Arrival & requests">
        {status !== "check-in" && (
          <FormField
            label="Estimated arrival (optional)"
            className="mb-4 sm:max-w-xs"
          >
            <select {...register("guest.arrivalTime")} className={inputClass}>
              <option value="">Not sure yet</option>
              {arrivalOptions.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </FormField>
        )}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {requestOptions.map((r) => {
            const on = picked.includes(r);
            return (
              <button
                key={r}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() =>
                  requests.onChange(
                    on ? picked.filter((x) => x !== r) : [...picked, r]
                  )
                }
                className={cn(
                  "flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-sm transition",
                  on
                    ? "border-sky-400 bg-sky-50/60 text-sky-900"
                    : "border-neutral-200 text-neutral-700 hover:border-sky-300"
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border",
                    on
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-neutral-300"
                  )}
                >
                  {on && <Check className="size-3" />}
                </span>
                {r}
              </button>
            );
          })}
        </div>
        <textarea
          {...register("guest.note")}
          rows={2}
          placeholder="Anything else we should know?"
          className={cn(textareaClass, "mt-3")}
        />
      </Group>
    </div>
  );
}
