"use client";

import { useState } from "react";
import {
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
import { AlertTriangle, Check, Trash2, Users, X } from "lucide-react";
import { taka } from "@/src/lib/hotel-store/format";
import { freeUnits, useHotelDB } from "@/src/lib/hotel-store/store";
import type { RoomUnit } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { hbtn, inputClass } from "../ui";
import { FieldError, focusRing, Section, Stepper } from "./parts";
import { computeStay, newLine, type BookingFormValues } from "./schema";

type UnitState = "available" | "dirty" | "oos" | "booked";

const unitStates: Record<
  UnitState,
  { label: string; dot: string; text: string }
> = {
  available: {
    label: "Available",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  dirty: {
    label: "Needs cleaning",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  oos: { label: "Out of service", dot: "bg-rose-500", text: "text-rose-700" },
  booked: { label: "Booked", dot: "bg-neutral-400", text: "text-neutral-600" },
};

const stateOf = (u: RoomUnit, free: Set<string>): UnitState =>
  u.outOfService
    ? "oos"
    : !free.has(u.id)
      ? "booked"
      : u.housekeeping === "dirty"
        ? "dirty"
        : "available";

const byNumber = (a: RoomUnit, b: RoomUnit) =>
  a.floor - b.floor ||
  a.number.localeCompare(b.number, undefined, { numeric: true });
const floorName = (f: number) => (f === 0 ? "Ground" : `Floor ${f}`);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function UnitStatus({ state }: { state: UnitState }) {
  const s = unitStates[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        s.text
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

/** Rooms are chosen by number; each one becomes its own line (and linked booking). */
export function RoomsSection({
  step,
  conflict,
}: {
  step: number;
  conflict?: string;
}) {
  const db = useHotelDB();
  const { control, register, setValue } = useFormContext<BookingFormValues>();
  const { isSubmitted } = useFormState({ control });
  const v = useWatch({ control }) as BookingFormValues;
  const stay = computeStay(db, v);
  const { nights } = stay;
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const [picking, setPicking] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [queryError, setQueryError] = useState("");
  const opts = { shouldDirty: true, shouldValidate: isSubmitted };
  const checkingIn = v.status === "check-in";
  const valid = nights > 0;

  const free = new Set(
    valid
      ? db.roomTypes.flatMap((t) =>
          freeUnits(db, t.id, v.checkIn, v.checkOut).map((u) => u.id)
        )
      : []
  );
  const units = [...db.units].sort(byNumber);
  const floors = [...new Set(units.map((u) => u.floor))];
  const lineOf = (unitId: string) =>
    (v.lines ?? []).findIndex((l) => l.unitIds[0] === unitId);
  const selectable = (u: RoomUnit) => {
    const s = stateOf(u, free);
    return valid && (s === "available" || (s === "dirty" && !checkingIn));
  };

  const toggle = (u: RoomUnit) => {
    const i = lineOf(u.id);
    setPicking(null);
    if (i >= 0) return remove(i);
    const t = db.roomTypes.find((x) => x.id === u.typeId);
    if (t && selectable(u)) append(newLine(t, [u.id]));
  };

  /** Typing a number and pressing Enter adds that room — quickest at a busy desk. */
  const addByNumber = () => {
    const n = query.trim();
    if (!n) return;
    const u = db.units.find((x) => x.number.toLowerCase() === n.toLowerCase());
    if (!u) return setQueryError(`No room ${n}`);
    if (lineOf(u.id) >= 0) return setQueryError(`Room ${n} is already added`);
    if (!selectable(u))
      return setQueryError(
        valid
          ? `Room ${n}: ${unitStates[stateOf(u, free)].label.toLowerCase()}`
          : "Pick dates first"
      );
    toggle(u);
    setQuery("");
    setQueryError("");
  };

  const swap = (line: number, u: RoomUnit) => {
    setValue(`lines.${line}.unitIds`, [u.id], opts);
    setValue(`lines.${line}.assignLater`, false, opts);
    setPicking(null);
  };

  return (
    <Section
      id="rooms"
      step={step}
      title="Rooms"
      sub={
        valid
          ? `Live status for ${plural(nights, "night")}`
          : "Pick dates to see which rooms are free"
      }
      aside={
        stay.rooms > 0 && (
          <span className="text-xs font-medium text-neutral-700">
            {plural(stay.rooms, "room")} selected · sleeps {stay.capacity}
          </span>
        )
      }
    >
      {conflict && (
        <div
          role="alert"
          className="mb-4 flex gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-900"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-600" />
          <span>
            <b className="font-semibold">Availability changed.</b> {conflict}{" "}
            Your other details are kept — pick another room and submit again.
          </span>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-56">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setQueryError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addByNumber();
              }
            }}
            inputMode="numeric"
            placeholder="Type room no. + Enter"
            aria-label="Add room by number"
            className={cn(inputClass, "h-9", queryError && "border-rose-400")}
          />
          {queryError && (
            <p role="alert" className="mt-1 text-xs font-medium text-rose-600">
              {queryError}
            </p>
          )}
        </div>
        <ul className="flex flex-wrap gap-x-3 gap-y-1" aria-label="Legend">
          {(["available", "dirty", "booked", "oos"] as const).map((s) => (
            <li key={s}>
              <UnitStatus state={s} />
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3" role="group" aria-label="Rooms by floor">
        {floors.map((floor) => (
          <div
            key={floor}
            className="grid gap-2 sm:grid-cols-[64px_minmax(0,1fr)]"
          >
            <p className="pt-2 text-xs font-semibold text-neutral-600">
              {floorName(floor)}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {units
                .filter((u) => u.floor === floor)
                .map((u) => {
                  const t = db.roomTypes.find((x) => x.id === u.typeId);
                  const on = lineOf(u.id) >= 0;
                  const state = stateOf(u, free);
                  const disabled = !on && !selectable(u);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggle(u)}
                      disabled={disabled}
                      aria-pressed={on}
                      aria-label={`Room ${u.number}, ${t?.beds ?? ""}, sleeps ${t?.capacity ?? 0}, ${taka(t?.price ?? 0)} per night, ${valid ? unitStates[state].label : "pick dates"}${on ? ", selected" : ""}`}
                      title={
                        u.outOfService && u.oosReason ? u.oosReason : undefined
                      }
                      className={cn(
                        "relative rounded-md border px-2.5 py-2 text-left transition disabled:cursor-not-allowed",
                        on
                          ? "border-sky-600 bg-sky-50 ring-1 ring-sky-600"
                          : disabled
                            ? "border-dashed border-neutral-300 bg-neutral-50"
                            : "border-neutral-200 bg-white hover:border-sky-400",
                        focusRing
                      )}
                    >
                      <span className="flex items-start justify-between gap-1">
                        <span
                          className={cn(
                            "text-base font-bold leading-tight",
                            disabled ? "text-neutral-600" : "text-neutral-900"
                          )}
                        >
                          {u.number}
                        </span>
                        {on ? (
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white">
                            <Check className="size-3.5" />
                          </span>
                        ) : (
                          <span className="text-xs font-semibold tabular-nums text-neutral-800">
                            {t ? taka(t.price) : "—"}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-neutral-600">
                        <Users className="size-3 shrink-0" />{" "}
                        {t?.capacity ?? "—"}
                        {t?.beds && (
                          <span className="truncate">· {t.beds}</span>
                        )}
                      </span>
                      <span className="mt-1 block">
                        {valid ? (
                          <UnitStatus state={state} />
                        ) : (
                          <span className="text-xs text-neutral-500">
                            Pick dates
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      <FieldError name="lines.root" />

      {fields.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-neutral-300 px-4 py-5 text-center text-sm text-neutral-600">
          Click a room number above to add it to this booking.
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-md border border-neutral-200">
          <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_120px_96px_32px] gap-3 border-b border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs font-semibold text-neutral-700 md:grid">
            <span>Room</span>
            <span>Details</span>
            <span>Rate/night</span>
            <span className="text-right">Subtotal</span>
            <span className="sr-only">Remove</span>
          </div>
          <ul className="divide-y divide-neutral-200">
            {fields.map((f, i) => {
              const l = stay.lines[i];
              if (!l?.type) return null;
              const type = l.type;
              const u = l.line.unitIds[0]
                ? db.units.find((x) => x.id === l.line.unitIds[0])
                : undefined;
              const over = l.adults + l.children > l.capacity;
              const label = u ? `room ${u.number}` : type.name;
              return (
                <li key={f.id} className="px-3.5 py-3">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_120px_96px_32px] md:items-start">
                    <div className="col-span-2 flex items-start justify-between gap-2 md:col-span-1">
                      <div className="min-w-0">
                        {u ? (
                          <p className="text-sm font-semibold text-neutral-900">
                            Room {u.number}{" "}
                            <span className="font-normal text-neutral-600">
                              · {floorName(u.floor)}
                            </span>
                          </p>
                        ) : (
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              checkingIn ? "text-rose-700" : "text-amber-800"
                            )}
                          >
                            Room number not assigned
                          </p>
                        )}
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                          {u && valid && (
                            <UnitStatus state={stateOf(u, free)} />
                          )}
                          <button
                            type="button"
                            disabled={!valid}
                            aria-expanded={picking === i}
                            onClick={() => setPicking(picking === i ? null : i)}
                            className={cn(
                              "font-semibold text-sky-700 hover:underline disabled:text-neutral-400",
                              focusRing
                            )}
                          >
                            {u ? "Change" : "Pick room"}
                          </button>
                          {u && !checkingIn && (
                            <button
                              type="button"
                              onClick={() => {
                                setValue(`lines.${i}.unitIds`, [], opts);
                                setValue(`lines.${i}.assignLater`, true, opts);
                              }}
                              className={cn(
                                "font-medium text-neutral-700 hover:text-sky-700 hover:underline",
                                focusRing
                              )}
                            >
                              Assign later
                            </button>
                          )}
                        </span>
                        <FieldError name={`lines.${i}.unitIds`} />
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        aria-label={`Remove ${label}`}
                        className={cn(hbtn.iconDanger, focusRing, "md:hidden")}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="col-span-2 text-xs text-neutral-700 md:col-span-1 md:pt-0.5">
                      {[type.beds, `Sleeps ${type.capacity}`]
                        .filter(Boolean)
                        .join(" · ")}
                      {!u && (
                        <span className="block text-neutral-600">
                          Holds one {type.name}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="mb-1 block text-xs font-medium text-neutral-700 md:sr-only">
                        Rate/night
                      </span>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                          ৳
                        </span>
                        <input
                          type="number"
                          min={1}
                          {...register(`lines.${i}.rate`)}
                          aria-label={`Rate per night for ${label}`}
                          className={cn(inputClass, "h-8 pl-6 tabular-nums")}
                        />
                      </div>
                      <FieldError name={`lines.${i}.rate`} />
                      {l.rate !== type.price && (
                        <button
                          type="button"
                          onClick={() =>
                            setValue(`lines.${i}.rate`, type.price, opts)
                          }
                          className="mt-1 text-xs font-medium text-sky-700 hover:underline"
                        >
                          Reset to {taka(type.price)}
                        </button>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between md:block md:text-right">
                      <span className="text-xs text-neutral-600 md:hidden">
                        Subtotal
                      </span>
                      <span>
                        <span className="block text-sm font-semibold tabular-nums text-neutral-900">
                          {taka(l.quote.subtotal)}
                        </span>
                        <span className="block text-xs tabular-nums text-neutral-600">
                          {plural(Math.max(0, nights), "night")}
                        </span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(i)}
                      aria-label={`Remove ${label}`}
                      className={cn(
                        hbtn.iconDanger,
                        focusRing,
                        "hidden md:inline-flex"
                      )}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {picking === i && (
                    <UnitPicker
                      units={units.filter((x) => x.typeId === type.id)}
                      free={free}
                      taken={(v.lines ?? []).flatMap((x, j) =>
                        j === i ? [] : x.unitIds
                      )}
                      current={u?.id}
                      checkingIn={checkingIn}
                      onPick={(x) => swap(i, x)}
                      onClose={() => setPicking(null)}
                    />
                  )}

                  {fields.length > 1 && (
                    <div
                      className={cn(
                        "mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md px-2.5 py-2 text-xs",
                        over ? "bg-rose-50" : "bg-neutral-50"
                      )}
                    >
                      <span className="font-medium text-neutral-800">
                        Guests in {u ? `room ${u.number}` : "this room"}
                      </span>
                      {l.manual ? (
                        <>
                          <span className="flex items-center gap-1.5">
                            Adults
                            <span className="w-24">
                              <Stepper
                                name={`lines.${i}.party.adults`}
                                label={`adults in ${label}`}
                                min={0}
                                max={20}
                                size="sm"
                              />
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            Children
                            <span className="w-24">
                              <Stepper
                                name={`lines.${i}.party.children`}
                                label={`children in ${label}`}
                                min={0}
                                max={20}
                                size="sm"
                              />
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setValue(`lines.${i}.party`, null, opts)
                            }
                            className="font-medium text-sky-700 hover:underline"
                          >
                            Split automatically
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-neutral-700">
                            {plural(l.adults, "adult")}
                            {l.children > 0 &&
                              `, ${l.children} ${l.children === 1 ? "child" : "children"}`}{" "}
                            <span className="text-neutral-500">(auto)</span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setValue(
                                `lines.${i}.party`,
                                { adults: l.adults, children: l.children },
                                opts
                              )
                            }
                            className="font-medium text-sky-700 hover:underline"
                          >
                            Edit
                          </button>
                        </>
                      )}
                      {over && (
                        <span className="flex items-center gap-1 font-medium text-rose-700">
                          <AlertTriangle className="size-3.5" /> Sleeps up to{" "}
                          {l.capacity} — {l.adults + l.children} placed
                        </span>
                      )}
                      <FieldError name={`lines.${i}.party`} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <FieldError name="lines" />
    </Section>
  );
}

/** Rooms with the same details as this line, to swap the number without changing the price. */
function UnitPicker({
  units,
  free,
  taken,
  current,
  checkingIn,
  onPick,
  onClose,
}: {
  units: RoomUnit[];
  free: Set<string>;
  taken: string[];
  current?: string;
  checkingIn: boolean;
  onPick: (u: RoomUnit) => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-2.5 rounded-md border border-sky-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-neutral-800">
          {checkingIn
            ? "Choose a ready room with the same details"
            : "Choose a room with the same details"}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close room picker"
          className={cn(hbtn.icon, "size-7", focusRing)}
        >
          <X className="size-4" />
        </button>
      </div>
      <div
        role="radiogroup"
        aria-label="Rooms"
        className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-4"
      >
        {units.map((u) => {
          const state = stateOf(u, free);
          const inUse = taken.includes(u.id);
          const disabled =
            state === "oos" ||
            state === "booked" ||
            inUse ||
            (checkingIn && state === "dirty");
          const on = u.id === current;
          return (
            <button
              key={u.id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={disabled}
              onClick={() => onPick(u)}
              className={cn(
                "flex flex-col items-start rounded-md border px-2.5 py-1.5 text-left transition disabled:cursor-not-allowed disabled:bg-neutral-50",
                on
                  ? "border-sky-600 bg-sky-50 ring-1 ring-sky-600"
                  : "border-neutral-200 hover:border-sky-400",
                focusRing
              )}
            >
              <span
                className={cn(
                  "text-sm font-semibold",
                  disabled ? "text-neutral-600" : "text-neutral-900"
                )}
              >
                {u.number}{" "}
                <span className="text-xs font-normal text-neutral-600">
                  · {floorName(u.floor)}
                </span>
              </span>
              {inUse ? (
                <span className="text-xs font-medium text-sky-700">
                  In this booking
                </span>
              ) : (
                <UnitStatus state={state} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
