"use client";

import {
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
import {
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  Footprints,
  Phone,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import DateRangeField from "@/src/components/hotel/shared/DateRangeField";
import { parseDayKey, toDayKey } from "@/src/lib/hotelDates";
import { shiftDay, taka } from "@/src/lib/hotel-store/format";
import { freeRooms, useHotelDB } from "@/src/lib/hotel-store/store";
import { cn } from "@/src/lib/utils";
import { hbtn, inputClass } from "../ui";
import {
  FieldError,
  FormField,
  Section,
  Segmented,
  Stepper,
} from "./parts";
import CommissionPanel from "./CommissionPanel";
import { computeStay, newLine, type BookingFormValues } from "./schema";

const quickNights = [1, 2, 3, 7];

export function StaySection({ step }: { step: number }) {
  const db = useHotelDB();
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { isSubmitted } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const stay = computeStay(db, v);
  const { nights } = stay;
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const opts = { shouldDirty: true, shouldValidate: isSubmitted };

  const indexOf = (typeId: string) =>
    (v.lines ?? []).findIndex((l) => l.typeId === typeId);
  const toggleType = (typeId: string) => {
    const i = indexOf(typeId);
    if (i >= 0) return remove(i);
    const t = db.roomTypes.find((x) => x.id === typeId);
    if (t) append(newLine(t));
  };

  return (
    <Section
      id="stay"
      step={step}
      icon={CalendarDays}
      title="Stay"
      aside={
        <Segmented
          value={v.source}
          onChange={(s) => setValue("source", s, opts)}
          options={[
            { value: "walk-in", label: "Walk-in", icon: Footprints },
            { value: "phone", label: "Phone", icon: Phone },
            { value: "agent", label: "Agent", icon: Building2 },
          ]}
        />
      }
    >
      <div>
        <span className="mb-1 block text-xs font-medium text-neutral-600">
          Check-in &amp; check-out
        </span>
        <DateRangeField
          checkIn={parseDayKey(v.checkIn)}
          checkOut={parseDayKey(v.checkOut)}
          onChange={(ci, co) => {
            const o = { ...opts, shouldTouch: true };
            setValue("checkIn", ci ? toDayKey(ci) : "", o);
            setValue("checkOut", co ? toDayKey(co) : "", o);
          }}
        />
        <FieldError name="checkIn" />
        <FieldError name="checkOut" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-500">Quick stay:</span>
        {quickNights.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() =>
              v.checkIn && setValue("checkOut", shiftDay(v.checkIn, n), opts)
            }
            className={cn(
              "rounded-md border px-2 py-0.5 transition",
              nights === n
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-neutral-200 text-neutral-600 hover:border-sky-300"
            )}
          >
            {n === 7 ? "1 week" : `${n} night${n > 1 ? "s" : ""}`}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <span className="mb-2 block text-xs font-medium text-neutral-600">
          Room types
        </span>
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {db.roomTypes.map((t) => {
            const left =
              nights > 0 ? freeRooms(db, t.id, v.checkIn, v.checkOut) : null;
            const on = indexOf(t.id) >= 0;
            const full = left === 0;
            return (
              <button
                key={t.id}
                type="button"
                disabled={full && !on}
                onClick={() => toggleType(t.id)}
                aria-pressed={on}
                className={cn(
                  "group flex gap-3 rounded-md border p-2.5 text-left transition disabled:cursor-not-allowed",
                  on
                    ? "border-sky-500 bg-sky-50/60 ring-2 ring-sky-100"
                    : "border-neutral-200 hover:border-sky-300",
                  full && !on && "opacity-50"
                )}
              >
                {t.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                  <img
                    src={t.images[0]}
                    alt=""
                    className="size-16 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="flex size-16 shrink-0 items-center justify-center rounded bg-neutral-100">
                    <BedDouble className="size-5 text-neutral-400" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-neutral-900">
                      {t.name}
                    </span>
                    {on ? (
                      <span className="flex shrink-0 items-center gap-0.5 rounded bg-sky-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        <Check className="size-3" />{" "}
                        {stay.lines.find((l) => l.line.typeId === t.id)
                          ?.rooms ?? 1}
                      </span>
                    ) : (
                      !full && (
                        <Plus className="size-4 shrink-0 text-neutral-300 transition group-hover:text-sky-500" />
                      )
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    <Users className="mr-1 inline size-3" />
                    Sleeps {t.capacity}
                    {t.beds && ` · ${t.beds}`}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold tabular-nums text-neutral-800">
                      {taka(t.price)}
                      <span className="font-normal text-neutral-400">
                        /night
                      </span>
                    </span>
                    {left !== null && (
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 font-medium",
                          full
                            ? "bg-rose-50 text-rose-600"
                            : left <= 2
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                        )}
                      >
                        {full ? "Full" : `${left} free`}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <FieldError name="lines" />
        <FieldError name="lines.root" />
      </div>

      {fields.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-md border border-neutral-200">
          <div className="hidden grid-cols-[minmax(0,1fr)_140px_140px_110px_36px] gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 md:grid">
            <span>Selected rooms</span>
            <span>Rooms</span>
            <span>Rate / night</span>
            <span className="text-right">Room charge</span>
            <span />
          </div>
          <ul className="divide-y divide-neutral-100">
            {fields.map((f, i) => {
              const l = stay.lines[i];
              if (!l) return null;
              return (
                <li
                  key={f.id}
                  className="grid grid-cols-2 items-start gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_140px_140px_110px_36px] md:items-center"
                >
                  <div className="col-span-2 min-w-0 md:col-span-1">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {l.type?.name ?? "Unknown room"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {nights > 0 ? `${l.free} free` : "Pick dates"} · sleeps{" "}
                      {(l.type?.capacity ?? 0) * l.rooms}
                    </p>
                    <FieldError name={`lines.${i}.unitIds`} />
                  </div>
                  <div>
                    <Stepper
                      name={`lines.${i}.rooms`}
                      label={`${l.type?.name ?? ""} rooms`}
                      min={1}
                      max={Math.max(1, l.free || 20)}
                    />
                    <FieldError name={`lines.${i}.rooms`} />
                  </div>
                  <div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                        ৳
                      </span>
                      <input
                        type="number"
                        min={1}
                        {...register(`lines.${i}.rate`)}
                        aria-label={`${l.type?.name ?? ""} rate per night`}
                        className={cn(inputClass, "pl-7 tabular-nums")}
                      />
                    </div>
                    <FieldError name={`lines.${i}.rate`} />
                    {l.type && l.rate !== l.type.price && (
                      <button
                        type="button"
                        onClick={() =>
                          setValue(`lines.${i}.rate`, l.type!.price, opts)
                        }
                        className="mt-1 text-[11px] text-sky-700 hover:underline"
                      >
                        Reset to {taka(l.type.price)}
                      </button>
                    )}
                  </div>
                  <p className="text-right text-sm font-semibold tabular-nums text-neutral-900 md:self-center">
                    {taka(l.quote.subtotal)}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label={`Remove ${l.type?.name ?? "room"}`}
                    className={cn(hbtn.iconDanger, "justify-self-end")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-6 grid max-w-md grid-cols-2 gap-4">
        <FormField label="Adults" name="adults">
          <Stepper name="adults" label="adults" min={1} max={60} />
        </FormField>
        <FormField label="Children" name="children">
          <Stepper name="children" label="children" min={0} max={30} />
        </FormField>
      </div>
      <CommissionPanel />
    </Section>
  );
}
