"use client";

import { useEffect, useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { AlertTriangle, Check, Search, Users, X } from "lucide-react";
import { taka } from "@/src/lib/hotel-store/format";
import { freeUnits, useHotelDB } from "@/src/lib/hotel-store/store";
import type { RoomUnit } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { hbtn, inputClass } from "../ui";
import { FieldError, focusRing, Section } from "./parts";
import { computeStay, newLine, type BookingFormValues } from "./schema";

type UnitState = "available" | "dirty" | "oos" | "booked";

const unitStates: Record<
  UnitState,
  // tile: the room card's border, left stripe and fill, so the status reads at a glance.
  { label: string; dot: string; text: string; tile: string }
> = {
  available: {
    label: "Available",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    tile: "border-emerald-200 border-l-emerald-500 bg-white hover:border-emerald-400 hover:bg-emerald-50/60",
  },
  dirty: {
    label: "Needs cleaning",
    dot: "bg-[#020C1F]",
    text: "text-[#020C1F]",
    tile: "border-[#020C1F]/20 border-l-[#020C1F] bg-[#020C1F]/[0.04]",
  },
  oos: {
    label: "Out of service",
    dot: "bg-rose-500",
    text: "text-rose-700",
    tile: "border-rose-200 border-l-rose-500 bg-rose-50/50",
  },
  booked: {
    label: "Booked",
    dot: "bg-neutral-400",
    text: "text-neutral-600",
    tile: "border-neutral-200 border-l-neutral-400 bg-neutral-100 opacity-60",
  },
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
  a.number.localeCompare(b.number, undefined, { numeric: true });

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
  const { control } = useFormContext<BookingFormValues>();
  const v = useWatch({ control }) as BookingFormValues;
  const stay = computeStay(db, v);
  const { nights } = stay;
  const { append, remove } = useFieldArray({ control, name: "lines" });
  const [query, setQuery] = useState("");
  const [queryError, setQueryError] = useState("");
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
  const lineOf = (unitId: string) =>
    (v.lines ?? []).findIndex((l) => l.unitIds[0] === unitId);
  const selectable = (u: RoomUnit) => {
    const s = stateOf(u, free);
    return valid && (s === "available" || (s === "dirty" && !checkingIn));
  };

  // New dates: drop picked rooms that are now booked or out of service, and say which.
  const [dropped, setDropped] = useState("");
  const lastDates = useRef(`${v.checkIn}|${v.checkOut}`);
  useEffect(() => {
    const dates = `${v.checkIn}|${v.checkOut}`;
    if (dates === lastDates.current) return;
    lastDates.current = dates;
    if (!valid) return;
    const gone = (v.lines ?? []).flatMap((l, i) => {
      const u = db.units.find((x) => x.id === l.unitIds[0]);
      const s = u && stateOf(u, free);
      return u && (s === "booked" || s === "oos")
        ? [{ i, number: u.number }]
        : [];
    });
    setDropped(
      gone.length
        ? `Room ${gone.map((g) => g.number).join(", ")} ${gone.length === 1 ? "is" : "are"} not free for the new dates and ${gone.length === 1 ? "was" : "were"} removed.`
        : ""
    );
    if (gone.length) remove(gone.map((g) => g.i));
    // Runs on a date change only; `free` and `lines` are read for that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.checkIn, v.checkOut]);

  const toggle = (u: RoomUnit) => {
    const i = lineOf(u.id);
    setDropped("");
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

  return (
    <Section
      id="rooms"
      step={step}
      title="Rooms"
      sub={valid ? undefined : "Pick dates to see which rooms are free"}
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

      {dropped && (
        <div
          role="status"
          className="mb-3 flex items-start gap-2.5 rounded-md border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-sm text-sky-900"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-sky-600" />
          <span className="flex-1">{dropped} Pick another room.</span>
          <button
            type="button"
            onClick={() => setDropped("")}
            aria-label="Dismiss"
            className={cn(hbtn.icon, "size-6", focusRing)}
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="mb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
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
            className={cn(inputClass, "pl-9", queryError && "border-rose-400")}
          />
        </div>
        {queryError && (
          <p role="alert" className="mt-1 text-xs font-medium text-rose-600">
            {queryError}
          </p>
        )}
      </div>

      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4"
        role="group"
        aria-label="Rooms"
      >
        {units.map((u) => {
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
              title={u.outOfService && u.oosReason ? u.oosReason : undefined}
              className={cn(
                "relative cursor-pointer rounded-md border border-l-4 px-2.5 py-2 text-left transition disabled:cursor-not-allowed",
                on
                  ? "border-sky-600 bg-sky-50 ring-1 ring-sky-600"
                  : valid
                    ? unitStates[state].tile
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
                <Users className="size-3 shrink-0" /> {t?.capacity ?? "—"}
                {t?.beds && <span className="truncate">· {t.beds}</span>}
              </span>
              <span className="mt-1 block">
                {valid ? (
                  <UnitStatus state={state} />
                ) : (
                  <span className="text-xs text-neutral-500">Pick dates</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <FieldError name="lines.root" />

      <FieldError name="lines" />
    </Section>
  );
}
