"use client";

import { useController, useFormContext, useFormState, useWatch } from "react-hook-form";
import { BedDouble, Building2, CalendarDays, Check, DoorOpen, Phone, Footprints, Users, Wrench } from "lucide-react";
import { dateLabel, housekeepingLabels, shiftDay, stayNights, taka } from "@/src/lib/hotel-store/format";
import { freeRooms, unitBookingOn, useHotelDB } from "@/src/lib/hotel-store/store";
import { cn } from "@/src/lib/utils";
import DateRangeField from "@/src/components/hotel/shared/DateRangeField";
import { parseDayKey, toDayKey } from "@/src/lib/hotelDates";
import { inputClass } from "../ui";
import { FieldError, FormField, Section, Segmented, Stepper, useErrorClass } from "./parts";
import { computeStay, type BookingFormValues } from "./schema";

export function StaySection({ step }: { step: number }) {
  const db = useHotelDB();
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { isSubmitted } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const { nights, type, free } = computeStay(db, v);
  const errAgent = useErrorClass("agentName");
  const typeField = useController({ control, name: "typeId" }).field;

  const quickNights = [1, 2, 3, 7];

  return (
    <Section
      id="stay"
      step={step}
      icon={CalendarDays}
      title="Stay"
      sub="Dates, room type and party size."
      aside={
        <Segmented
          value={v.source}
          onChange={(s) => setValue("source", s, { shouldDirty: true, shouldValidate: isSubmitted })}
          options={[
            { value: "walk-in", label: "Walk-in", icon: Footprints },
            { value: "phone", label: "Phone", icon: Phone },
            { value: "agent", label: "Agent", icon: Building2 },
          ]}
        />
      }
    >
      {v.source === "agent" && (
        <FormField label="Agent / company" name="agentName" className="mb-4 max-w-md">
          <input {...register("agentName")} placeholder="e.g. ShareTrip, Bengal Tours Ltd." className={cn(inputClass, errAgent)} />
        </FormField>
      )}

      <div>
        <span className="mb-1 block text-xs font-medium text-neutral-600">Check-in &amp; check-out</span>
        <DateRangeField
          checkIn={parseDayKey(v.checkIn)}
          checkOut={parseDayKey(v.checkOut)}
          onChange={(ci, co) => {
            const opts = { shouldDirty: true, shouldTouch: true, shouldValidate: isSubmitted };
            setValue("checkIn", ci ? toDayKey(ci) : "", opts);
            setValue("checkOut", co ? toDayKey(co) : "", opts);
          }}
        />
        <FieldError name="checkIn" />
        <FieldError name="checkOut" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium text-neutral-700">
          {nights > 0 ? `${nights} night${nights > 1 ? "s" : ""} · ${dateLabel(v.checkIn)} → ${dateLabel(v.checkOut)}` : "Pick the dates"}
        </span>
        <span className="text-neutral-300">|</span>
        {quickNights.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => v.checkIn && setValue("checkOut", shiftDay(v.checkIn, n), { shouldDirty: true, shouldValidate: isSubmitted })}
            className={cn("rounded-md border px-2 py-0.5 transition", nights === n ? "border-sky-500 bg-sky-50 text-sky-700" : "border-neutral-200 text-neutral-600 hover:border-sky-300")}
          >
            {n === 7 ? "1 week" : `${n} night${n > 1 ? "s" : ""}`}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <span className="mb-2 block text-xs font-medium text-neutral-600">Room type</span>
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {db.roomTypes.map((t) => {
            const left = nights > 0 ? freeRooms(db, t.id, v.checkIn, v.checkOut) : null;
            const on = typeField.value === t.id;
            const full = left === 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => typeField.onChange(t.id)}
                aria-pressed={on}
                className={cn(
                  "group flex gap-3 rounded-md border p-2.5 text-left transition",
                  on ? "border-sky-500 bg-sky-50/60 ring-2 ring-sky-100" : "border-neutral-200 hover:border-sky-300",
                  full && !on && "opacity-60"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                {t.images[0] ? <img src={t.images[0]} alt="" className="size-16 shrink-0 rounded object-cover" /> : <span className="flex size-16 shrink-0 items-center justify-center rounded bg-neutral-100"><BedDouble className="size-5 text-neutral-400" /></span>}
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-neutral-900">{t.name}</span>
                    {on && <Check className="size-4 shrink-0 text-sky-600" />}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    <Users className="mr-1 inline size-3" />
                    Sleeps {t.capacity}
                    {t.beds && ` · ${t.beds}`}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold tabular-nums text-neutral-800">{taka(t.price)}<span className="font-normal text-neutral-400">/night</span></span>
                    {left !== null && (
                      <span className={cn("rounded px-1.5 py-0.5 font-medium", full ? "bg-rose-50 text-rose-600" : left <= 2 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")}>
                        {full ? "Full" : `${left} free`}
                      </span>
                    )}
                  </span>
                  {!t.active && <span className="mt-1 block text-[10px] text-neutral-400">Hidden on website</span>}
                </span>
              </button>
            );
          })}
        </div>
        <FieldError name="typeId" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <FormField label="Rooms" name="rooms" hint={type && nights > 0 ? `${free} available` : undefined}>
          <Stepper name="rooms" label="rooms" min={1} max={Math.max(1, free || 20)} />
        </FormField>
        <FormField label="Adults" name="adults" hint={type ? `Up to ${type.capacity * Math.max(1, Number(v.rooms) || 1)} guests in ${v.rooms} room${Number(v.rooms) > 1 ? "s" : ""}` : undefined}>
          <Stepper name="adults" label="adults" min={1} max={40} />
        </FormField>
        <FormField label="Children" name="children" hint="Under 12">
          <Stepper name="children" label="children" min={0} max={20} />
        </FormField>
      </div>
    </Section>
  );
}

/** Physical rooms for the stay: free ones can be picked, taken and out-of-service ones are shown for context. */
export function RoomsSection({ step }: { step: number }) {
  const db = useHotelDB();
  const { control } = useFormContext<BookingFormValues>();
  const v = useWatch({ control }) as BookingFormValues;
  const { field } = useController({ control, name: "unitIds" });
  const { nights, type, rooms } = computeStay(db, v);
  const chosen: string[] = field.value ?? [];
  const nightsList = nights > 0 ? stayNights(v.checkIn, v.checkOut) : [];
  const units = type ? db.units.filter((u) => u.typeId === type.id).sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })) : [];

  const toggle = (id: string) => {
    if (chosen.includes(id)) return field.onChange(chosen.filter((x) => x !== id));
    // At the limit, the oldest pick makes way for the new one.
    field.onChange(chosen.length >= rooms ? [...chosen.slice(1), id] : [...chosen, id]);
  };

  return (
    <Section
      id="rooms"
      step={step}
      icon={DoorOpen}
      title="Room assignment"
      sub="We pick clean rooms first — tap to change. Can be left for later unless checking in now."
      aside={
        <span className={cn("rounded-md px-2.5 py-1 text-xs font-semibold", chosen.length === rooms ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
          {chosen.length} of {rooms} assigned
        </span>
      }
    >
      {!type || nights < 1 ? (
        <p className="text-sm text-neutral-500">Pick dates and a room type to see rooms.</p>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-2">
            {units.map((u) => {
              const clash = nightsList.map((n) => unitBookingOn(db, u.id, n)).find(Boolean);
              const blocked = u.outOfService || !!clash;
              const on = chosen.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  disabled={blocked}
                  onClick={() => toggle(u.id)}
                  aria-pressed={on}
                  title={u.outOfService ? `Out of service${u.oosReason ? ` — ${u.oosReason}` : ""}` : clash ? `Taken by ${clash.code} (${clash.guest.name})` : undefined}
                  className={cn(
                    "rounded-md border p-2 text-left transition",
                    on && "border-sky-500 bg-sky-50 ring-2 ring-sky-100",
                    !on && !blocked && "border-neutral-200 hover:border-sky-300",
                    blocked && "cursor-not-allowed border-dashed border-neutral-200 bg-neutral-50"
                  )}
                >
                  <span className={cn("flex items-center justify-between text-base font-bold", blocked ? "text-neutral-400" : "text-neutral-900")}>
                    {u.number}
                    {on && <Check className="size-4 text-sky-600" />}
                    {u.outOfService && <Wrench className="size-3.5 text-neutral-400" />}
                  </span>
                  <span className="block text-[10px] text-neutral-400">Floor {u.floor}</span>
                  <span
                    className={cn(
                      "mt-0.5 block truncate text-[10px] font-medium",
                      u.outOfService ? "text-neutral-400" : clash ? "text-rose-500" : u.housekeeping === "dirty" ? "text-amber-600" : "text-emerald-600"
                    )}
                  >
                    {u.outOfService ? "Out of service" : clash ? clash.code : housekeepingLabels[u.housekeeping]}
                  </span>
                </button>
              );
            })}
          </div>
          {!units.length && <p className="text-sm text-neutral-500">No rooms are set up for {type.name} yet.</p>}
          <FieldError name="unitIds" />
          <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-neutral-500">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> Ready</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" /> Needs cleaning</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-500" /> Booked on these dates</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-neutral-300" /> Out of service</span>
          </div>
        </>
      )}
    </Section>
  );
}
