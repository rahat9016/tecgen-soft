"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { AlertCircle, AlertTriangle, Check, Loader2, Minus, Wallet } from "lucide-react";
import { can } from "@/src/lib/hotel-store/auth";
import { chargeLabels, dateLabel, housekeepingLabels, nightsBetween, payLabels, taka, todayKey } from "@/src/lib/hotel-store/format";
import { checkInBlockers, type Blocker } from "@/src/lib/hotel-store/frontDesk";
import {
  addCharge,
  addPayment,
  assignUnits,
  cancelBooking,
  cancellationTerms,
  cancelRoom,
  changeStay,
  checkInBooking,
  checkOutBooking,
  creditOf,
  dueOf,
  folioTotal,
  freeRooms,
  freeUnits,
  groupOf,
  paidOf,
  quoteStay,
  ratesFor,
  setHousekeeping,
  unitNumbers,
  updateBookingGuest,
  useCurrentStaff,
  useHotelDB,
} from "@/src/lib/hotel-store/store";
import type { Booking, ChargeCategory, GuestInfo, HotelDB, PayMethod, PaymentKind, RoomUnit } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, Field, hbtn, inputClass, Modal, textareaClass, useSaving } from "./ui";

const methods: PayMethod[] = ["cash", "card", "bkash", "nagad", "rocket", "bank"];

const mobileWallets: PayMethod[] = ["bkash", "nagad", "rocket"];
const refLabel = (m: PayMethod) => (m === "card" ? "Card / auth reference" : m === "bank" ? "Bank reference" : "Transaction ID (TrxID)");

/** Field-level checks, shown under each field once the user has tried to submit (or touched it). */
function paymentErrors(input: { amount: string; method: PayMethod; ref: string; note: string; isRefund: boolean; max: number }) {
  const e: { amount?: string; ref?: string; note?: string } = {};
  const raw = input.amount.trim();
  const n = Number(raw);
  if (!raw) e.amount = "Enter an amount.";
  else if (!Number.isFinite(n) || n <= 0) e.amount = "Amount must be more than ৳0.";
  else if (!Number.isInteger(n)) e.amount = "Use whole taka — no paisa.";
  else if (input.max <= 0) e.amount = input.isRefund ? "Nothing has been paid, so nothing can be refunded." : "Nothing is due on this bill.";
  else if (n > input.max) e.amount = input.isRefund ? `Can't refund more than ${taka(input.max)}.` : `Can't be more than the balance due (${taka(input.max)}).`;

  const ref = input.ref.trim();
  if (input.method !== "cash") {
    if (!ref) e.ref = `Enter the ${refLabel(input.method).toLowerCase()}.`;
    else if (mobileWallets.includes(input.method) && !/^[A-Z0-9]{8,12}$/i.test(ref)) e.ref = "TrxID is 8–12 letters and numbers, e.g. 9F3K2L1M0P.";
    else if (ref.length < 4) e.ref = "Reference looks too short.";
  }

  if (input.isRefund && !input.note.trim()) e.note = "Add a reason for the refund.";
  else if (input.note.length > 200) e.note = "Keep the note under 200 characters.";
  return e;
}

export function PaymentModal({ booking, kind, onClose }: { booking: Booking; kind: PaymentKind | null; onClose: () => void }) {
  const db = useHotelDB();
  const isRefund = kind === "refund";
  const due = dueOf(booking);
  const paid = paidOf(booking);
  const credit = creditOf(booking);
  const max = isRefund ? paid : due;
  const suggested = isRefund ? credit || paid : due;
  const firstMethod = booking.payments.find((p) => !p.void && p.kind !== "refund")?.method;
  const [amount, setAmount] = useState(String(suggested || ""));
  const [method, setMethod] = useState<PayMethod>(isRefund && firstMethod ? firstMethod : "cash");
  const [ref, setRef] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [tried, setTried] = useState(false);
  const { saving, run } = useSaving();

  const errors = paymentErrors({ amount, method, ref, note, isRefund, max });
  const show = (k: keyof typeof errors) => (tried ? errors[k] : undefined);
  const value = Number(amount) || 0;
  const after = isRefund ? paid - value : due - value;
  const rooms = unitNumbers(db, booking.unitIds);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (Object.keys(errors).length) return;
    run(() => {
      setError("");
      const r = addPayment(booking.id, { amount: value, method, kind: kind ?? "payment", ref, note });
      if (!r.ok) return setError(r.error);
      toast.success(isRefund ? `Refunded ${taka(value)}` : `Received ${taka(value)} via ${payLabels[method]}`);
      onClose();
    });
  };

  return (
    <Modal open={!!kind} onClose={onClose} title={isRefund ? `Refund · ${booking.guest.name}` : `Collect payment · ${booking.guest.name}`}>
      <form onSubmit={submit} noValidate className="space-y-5">
        <dl className="divide-y divide-neutral-100 rounded-md border border-neutral-200 text-sm">
          <div className="flex justify-between px-3.5 py-2">
            <dt className="text-neutral-600">Bill total{rooms.length > 0 && ` · Room ${rooms.join(", ")}`}</dt>
            <dd className="tabular-nums text-neutral-900">{taka(folioTotal(booking))}</dd>
          </div>
          <div className="flex justify-between px-3.5 py-2">
            <dt className="text-neutral-600">Paid so far</dt>
            <dd className="tabular-nums text-emerald-700">{taka(paid)}</dd>
          </div>
          {credit > 0 && (
            <div className="flex justify-between px-3.5 py-2">
              <dt className="text-neutral-600">Overpaid (refundable)</dt>
              <dd className="tabular-nums text-violet-700">{taka(credit)}</dd>
            </div>
          )}
          <div className="flex justify-between bg-neutral-50 px-3.5 py-2.5 font-medium">
            <dt className="text-neutral-900">Balance due</dt>
            <dd className={cn("tabular-nums", due > 0 ? "text-rose-600" : "text-emerald-600")}>{taka(due)}</dd>
          </div>
        </dl>

        <div>
          <label htmlFor="pay-amount" className="mb-1 block text-xs font-medium text-neutral-600">
            {isRefund ? "Refund amount" : "Amount received"}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-lg font-medium text-neutral-500">৳</span>
            <input
              id="pay-amount"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={!!show("amount")}
              aria-describedby="pay-amount-msg"
              className={cn(inputClass, "h-12 pl-8 text-lg font-medium tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none", show("amount") && "border-rose-400 focus:border-rose-500 focus:ring-rose-200")}
              autoFocus
            />
          </div>
          <p id="pay-amount-msg" className={cn("mt-1.5 text-xs", show("amount") ? "font-medium text-rose-600" : "text-neutral-500")}>
            {show("amount") ??
              (value > 0 && after >= 0
                ? isRefund
                  ? `Paid after refund: ${taka(after)}`
                  : after === 0
                    ? "Clears the balance in full."
                    : `Still due after this: ${taka(after)}`
                : "\u00a0")}
          </p>
        </div>

        <fieldset>
          <legend className="mb-1 block text-xs font-medium text-neutral-600">{isRefund ? "Refund to" : "Payment method"}</legend>
          <div className="grid grid-cols-3 gap-2">
            {methods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                aria-pressed={method === m}
                className={cn(
                  "relative h-10 rounded-md border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                  method === m ? "border-sky-600 bg-sky-50 text-sky-800 ring-1 ring-sky-600" : "border-neutral-200 text-neutral-700 hover:border-sky-300"
                )}
              >
                {method === m && <Check className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-sky-600" aria-hidden />}
                {payLabels[m]}
              </button>
            ))}
          </div>
        </fieldset>

        {method !== "cash" && (
          <div>
            <label htmlFor="pay-ref" className="mb-1 block text-xs font-medium text-neutral-600">
              {refLabel(method)}
            </label>
            <input
              id="pay-ref"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              aria-invalid={!!show("ref")}
              className={cn(inputClass, show("ref") && "border-rose-400")}
              placeholder={method === "card" ? "•••• 4242 · Auth 123456" : method === "bank" ? "e.g. DBBL-20261019-001" : "e.g. 9F3K2L1M0P"}
            />
            {show("ref") && <p className="mt-1 text-xs font-medium text-rose-600">{show("ref")}</p>}
          </div>
        )}

        <div>
          <label htmlFor="pay-note" className="mb-1 block text-xs font-medium text-neutral-600">
            {isRefund ? "Reason" : "Note"} {!isRefund && <span className="font-normal text-neutral-400">(optional)</span>}
          </label>
          <input
            id="pay-note"
            value={note}
            maxLength={200}
            onChange={(e) => setNote(e.target.value)}
            aria-invalid={!!show("note")}
            className={cn(inputClass, show("note") && "border-rose-400")}
            placeholder={isRefund ? "Reason for the refund" : "e.g. Paid at check-out"}
          />
          {show("note") && <p className="mt-1 text-xs font-medium text-rose-600">{show("note")}</p>}
        </div>

        <FormError text={error} />
        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <button type="button" onClick={onClose} className={hbtn.outline}>
            Cancel
          </button>
          <button type="submit" disabled={saving || max <= 0} className={cn(isRefund ? hbtn.dark : hbtn.primary, "min-w-40")}>
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Wallet className="size-4" aria-hidden />}
            {saving ? "Saving…" : `${isRefund ? "Refund" : "Record"} ${value > 0 && !errors.amount ? taka(value) : "payment"}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/** A save that didn't go through, explained next to the button that tried it. */
export function FormError({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p role="alert" className="flex gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {text}
    </p>
  );
}

const chargeCategories = Object.keys(chargeLabels) as ChargeCategory[];

export function ChargeModal({ booking, open, onClose }: { booking: Booking; open: boolean; onClose: () => void }) {
  const [category, setCategory] = useState<ChargeCategory>("restaurant");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const submit = () => {
    const r = addCharge(booking.id, { category, description: description || chargeLabels[category], amount: Number(amount) });
    if (!r.ok) return toast.error(r.error);
    toast.success(category === "discount" ? "Discount applied" : "Charge added to the folio");
    setDescription("");
    setAmount("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Add to folio · ${booking.code}`}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {chargeCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium ring-1 transition",
                category === c ? (c === "discount" ? "bg-emerald-600 text-white ring-emerald-600" : "bg-sky-600 text-white ring-sky-600") : "bg-white text-neutral-600 ring-neutral-200 hover:ring-sky-300"
              )}
            >
              {chargeLabels[c]}
            </button>
          ))}
        </div>
        <Field label="Description">
          <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder={category === "discount" ? "e.g. Loyalty discount" : "e.g. Dinner for two"} />
        </Field>
        <Field label={category === "discount" ? "Discount (BDT)" : "Amount (BDT)"}>
          <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
        </Field>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className={hbtn.outline}>
            Cancel
          </button>
          <button onClick={submit} className={hbtn.primary}>
            {category === "discount" ? "Apply discount" : "Add charge"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

type UnitState = "free" | "held" | "taken" | "oos";

const unitStateText: Record<Exclude<UnitState, "free">, string> = {
  held: "Held for other bookings",
  taken: "Taken",
  oos: "Out of service",
};

/** Pick physical rooms of any type; with `checkIn` it also checks the guest in. */
export function RoomsModal({ booking, mode, onClose }: { booking: Booking; mode: "assign" | "checkin" | null; onClose: () => void }) {
  const db = useHotelDB();
  const today = todayKey();
  const from = booking.status === "checked-in" || mode === "checkin" ? (today > booking.checkIn ? today : booking.checkIn) : booking.checkIn;
  const freeIds = new Set(db.roomTypes.flatMap((t) => freeUnits(db, t.id, from, booking.checkOut, booking.id).map((u) => u.id)));
  // Another type's free room can still be promised to a booking that has no room number yet.
  const spare = new Map(db.roomTypes.map((t) => [t.id, t.id === booking.roomTypeId || freeRooms(db, t.id, from, booking.checkOut, booking.id) > 0]));
  const stateOf = (u: RoomUnit): UnitState =>
    booking.unitIds.includes(u.id) ? "free" : freeIds.has(u.id) ? (spare.get(u.typeId) ? "free" : "held") : u.outOfService ? "oos" : "taken";
  // The booked type first, then the rest in their usual order. Draft rooms aren't ready for guests.
  const groups = db.roomTypes
    .filter((t) => t.id === booking.roomTypeId || !t.draft)
    .sort((a, b) => Number(b.id === booking.roomTypeId) - Number(a.id === booking.roomTypeId))
    .map((t) => ({ t, units: db.units.filter((u) => u.typeId === t.id).sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })) }))
    .filter((g) => g.units.length);
  const anyFree = groups.some((g) => g.units.some((u) => stateOf(u) === "free"));
  const [picked, setPicked] = useState<string[]>(booking.unitIds);
  const typeOf = (id: string) => db.units.find((u) => u.id === id)?.typeId;
  // Rooms of another type move the whole booking to that type, re-priced at a rate staff can adjust.
  const newType = picked.length ? db.roomTypes.find((t) => t.id === typeOf(picked[0]) && t.id !== booking.roomTypeId) : undefined;
  const [rateEdit, setRateEdit] = useState<{ typeId: string; value: number } | null>(null);
  const rate = newType ? (rateEdit?.typeId === newType.id ? rateEdit.value : newType.price) : booking.pricePerNight;
  const quote = newType ? quoteStay(ratesFor(db.settings, booking), Math.max(1, Math.round(rate)), booking.nights, booking.rooms, booking.discount) : null;
  const diff = quote ? quote.total - booking.total : 0;
  const [error, setError] = useState("");
  const { saving, run } = useSaving();

  const toggle = (id: string) =>
    setPicked((p) =>
      p.includes(id)
        ? p.filter((x) => x !== id)
        : p.length && typeOf(p[0]) !== typeOf(id)
          ? [id] // one room type per booking
          : p.length >= booking.rooms
            ? [...p.slice(1), id]
            : [...p, id]
    );

  const submit = () =>
    run(() => {
      setError("");
      const nightly = newType ? Math.round(rate) : undefined;
      const r = mode === "checkin" ? checkInBooking(booking.id, picked, nightly) : assignUnits(booking.id, picked, nightly);
      if (!r.ok) return setError(r.error);
      const numbers = unitNumbers(db, picked).join(", ");
      const repriced = newType ? ` · now ${newType.name} at ${taka(Math.round(rate))}/night` : "";
      toast.success((mode === "checkin" ? `${booking.guest.name} checked in to room ${numbers}` : picked.length ? `Room ${numbers} assigned to ${booking.guest.name}` : "Rooms updated") + repriced);
      onClose();
    });

  return (
    <Modal open={!!mode} onClose={onClose} title={mode === "checkin" ? `Check in · ${booking.guest.name}` : booking.status === "checked-in" ? "Move room" : "Assign rooms"} wide>
      <p className="text-sm text-neutral-500">
        Pick {booking.rooms} room{booking.rooms > 1 ? "s" : ""} free from {dateLabel(from, "EEE dd MMM")} to {dateLabel(booking.checkOut, "EEE dd MMM")}. Booked as{" "}
        <b className="font-medium text-neutral-700">{booking.roomName}</b>.
      </p>
      <div className="mt-4 space-y-5">
        {groups.map(({ t, units }) => {
          const booked = t.id === booking.roomTypeId;
          const freeCount = units.filter((u) => stateOf(u) === "free").length;
          return (
            <section key={t.id} aria-label={t.name}>
              <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="text-sm font-semibold text-neutral-900">{t.name}</h3>
                {booked && <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">Booked type</span>}
                <span className="ml-auto text-xs text-neutral-500">
                  {freeCount} of {units.length} free · {taka(t.price)}/night
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {units.map((u) => {
                  const state = stateOf(u);
                  if (state !== "free")
                    return (
                      <div key={u.id} className="rounded-md border border-dashed border-neutral-200 p-3 text-left opacity-60" title={state === "oos" ? u.oosReason : undefined}>
                        <p className="text-lg font-bold text-neutral-400">{u.number}</p>
                        <p className="text-[11px] text-neutral-400">{unitStateText[state]}</p>
                      </div>
                    );
                  const on = picked.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggle(u.id)}
                      aria-pressed={on}
                      className={cn(
                        "rounded-md border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                        on ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100" : "border-neutral-200 hover:border-sky-300"
                      )}
                    >
                      <p className="text-lg font-bold text-neutral-900">{u.number}</p>
                      <p className={cn("text-xs font-medium", u.housekeeping === "dirty" ? "text-amber-700" : "text-emerald-700")}>{housekeepingLabels[u.housekeeping]}</p>
                      <p className="text-xs text-neutral-500">Floor {u.floor}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      {!anyFree && <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">No rooms are free for these dates — change the stay or move another booking first.</p>}
      {newType && quote && (
        <div className="mt-4 rounded-md border border-sky-200 bg-sky-50/60 p-3">
          <p className="text-sm text-sky-900">
            The booking changes from <b className="font-semibold">{booking.roomName}</b> to <b className="font-semibold">{newType.name}</b>
            {booking.status === "checked-in" ? " — the new rate applies to every night of the stay." : "."}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[180px_1fr] sm:items-start">
            <Field label="Rate per night (BDT)" hint={Math.round(rate) !== newType.price ? `Rack rate ${taka(newType.price)}` : undefined}>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={rate || ""}
                onChange={(e) => setRateEdit({ typeId: newType.id, value: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
            <dl className="grid grid-cols-3 gap-2 rounded-md bg-white p-2.5 text-sm ring-1 ring-sky-100 sm:mt-5">
              <div>
                <dt className="text-xs text-neutral-600">Was</dt>
                <dd className="font-semibold tabular-nums text-neutral-700">{taka(booking.total)}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-600">New total</dt>
                <dd className="font-semibold tabular-nums text-neutral-900">{taka(quote.total)}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-600">Difference</dt>
                <dd className={cn("font-semibold tabular-nums", diff > 0 ? "text-amber-800" : diff < 0 ? "text-emerald-700" : "text-neutral-700")}>
                  {diff > 0 ? "+" : diff < 0 ? "−" : ""}
                  {taka(Math.abs(diff))}
                </dd>
              </div>
            </dl>
          </div>
          <p className="mt-2 text-xs text-neutral-600">
            {taka(Math.max(1, Math.round(rate)))} × {booking.nights} night{booking.nights > 1 ? "s" : ""}
            {booking.rooms > 1 ? ` × ${booking.rooms} rooms` : ""}
            {booking.discount ? ", less the discount," : ""} plus service charge and VAT.
          </p>
        </div>
      )}
      {mode === "checkin" && picked.some((id) => db.units.find((u) => u.id === id)?.housekeeping === "dirty") && (
        <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">Heads up: a selected room is still marked as needing cleaning.</p>
      )}
      <div className="mt-3">
        <FormError text={error} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className={hbtn.outline}>
          Cancel
        </button>
        <button onClick={submit} disabled={saving || (mode === "checkin" && picked.length < booking.rooms) || (!!newType && !(rate >= 1))} className={mode === "checkin" ? hbtn.success : hbtn.primary}>
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {saving ? "Saving…" : mode === "checkin" ? `Check in to ${picked.length ? db.units.filter((u) => picked.includes(u.id)).map((u) => u.number).join(", ") : "…"}` : "Save rooms"}
        </button>
      </div>
    </Modal>
  );
}

export function ChangeStayModal({ booking, open, onClose }: { booking: Booking; open: boolean; onClose: () => void }) {
  const db = useHotelDB();
  const inHouse = booking.status === "checked-in";
  const [form, setForm] = useState({
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    roomTypeId: booking.roomTypeId,
    rooms: booking.rooms,
    adults: booking.adults,
    children: booking.children,
    pricePerNight: booking.pricePerNight,
  });
  const type = db.roomTypes.find((t) => t.id === form.roomTypeId);
  const nights = nightsBetween(form.checkIn, form.checkOut);
  const q = quoteStay(ratesFor(db.settings, booking), form.pricePerNight, nights, form.rooms, booking.discount);
  const free = nights > 0 ? freeRooms(db, form.roomTypeId, form.checkIn, form.checkOut, booking.id) : 0;
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const r = changeStay(booking.id, form);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Stay updated — new total ${taka(r.value.total)}`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={inHouse ? "Extend or shorten stay" : "Change stay"} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Check-in">
          <input type="date" value={form.checkIn} disabled={inHouse} onChange={(e) => set("checkIn", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Check-out">
          <input type="date" value={form.checkOut} min={form.checkIn} onChange={(e) => set("checkOut", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Room type">
          <select
            value={form.roomTypeId}
            disabled={inHouse}
            onChange={(e) => {
              const t = db.roomTypes.find((x) => x.id === e.target.value);
              setForm((f) => ({ ...f, roomTypeId: e.target.value, pricePerNight: t?.price ?? f.pricePerNight }));
            }}
            className={inputClass}
          >
            {db.roomTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {taka(t.price)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rate per night (BDT)" hint={type && form.pricePerNight !== type.price ? `Rack rate ${taka(type.price)}` : undefined}>
          <input type="number" min={1} value={form.pricePerNight} onChange={(e) => set("pricePerNight", Number(e.target.value))} className={inputClass} />
        </Field>
        <div className="grid grid-cols-3 gap-2 sm:col-span-2">
          <Field label="Rooms">
            <input type="number" min={1} value={form.rooms} disabled={inHouse} onChange={(e) => set("rooms", Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="Adults">
            <input type="number" min={1} value={form.adults} onChange={(e) => set("adults", Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="Children">
            <input type="number" min={0} value={form.children} onChange={(e) => set("children", Number(e.target.value))} className={inputClass} />
          </Field>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-neutral-50 p-3 text-sm">
        <span className={free >= form.rooms ? "text-emerald-700" : "text-rose-600"}>
          {nights < 1 ? "Pick valid dates" : free >= form.rooms ? `${free} ${type?.name ?? ""} free for these dates` : `Only ${free} free for these dates`}
        </span>
        <span>
          {nights} night{nights !== 1 ? "s" : ""} · new room total <b>{taka(q.total)}</b>
          <span className="text-neutral-500"> (was {taka(booking.total)})</span>
          {booking.discount && <span className="block text-right text-xs text-emerald-700">Discount kept: −{taka(q.discount)}</span>}
        </span>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className={hbtn.outline}>
          Cancel
        </button>
        <button onClick={submit} className={hbtn.primary}>
          Save changes
        </button>
      </div>
    </Modal>
  );
}

export function CancelModal({ booking, open, onClose }: { booking: Booking; open: boolean; onClose: () => void }) {
  const db = useHotelDB();
  const terms = cancellationTerms(db, booking);
  const paid = paidOf(booking);
  const [reason, setReason] = useState("");
  const [fee, setFee] = useState(String(terms.fee));

  const submit = () => {
    const r = cancelBooking(booking.id, { reason: reason.trim() || "Cancelled by hotel", fee: Number(fee) || 0 });
    if (!r.ok) return toast.error(r.error);
    toast.success(creditOf(r.value) > 0 ? `${booking.code} cancelled — refund ${taka(creditOf(r.value))} from the folio` : `${booking.code} cancelled`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Cancel ${booking.code}`}>
      <div className="space-y-4">
        <p className={cn("rounded-md p-3 text-sm", terms.free ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>
          {terms.free
            ? "Inside the free-cancellation window — nothing is kept by default."
            : `Free cancellation has ended — policy keeps ${db.settings.lateCancellationFeeRate}% (up to what was paid).`}
        </p>
        <Field label="Reason (the guest sees this)">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className={textareaClass} placeholder="e.g. Guest asked to cancel by phone" />
        </Field>
        <Field label="Cancellation fee to keep (BDT)" hint={`Paid so far ${taka(paid)} · refund after fee ${taka(Math.max(0, paid - (Number(fee) || 0)))}`}>
          <input type="number" min={0} max={paid} value={fee} onChange={(e) => setFee(e.target.value)} className={inputClass} />
        </Field>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className={hbtn.outline}>
            Keep booking
          </button>
          <button onClick={submit} className={cn(hbtn.danger, "border-rose-600 bg-rose-600 text-white hover:bg-rose-700")}>
            Cancel booking
          </button>
        </div>
      </div>
    </Modal>
  );
}

type RoomChoice = { key: string; booking: Booking; unitId?: string; number?: string };

/** Rooms that can still be cancelled: every room, before check-in, on this booking and the ones made with it. */
export function cancellableRooms(db: HotelDB, booking: Booking): RoomChoice[] {
  const upcoming = (x: Booking) => x.status === "pending" || x.status === "confirmed";
  return [booking, ...groupOf(db, booking)].filter(upcoming).flatMap((x) => [
    ...x.unitIds.map((unitId) => ({ key: `${x.id}:${unitId}`, booking: x, unitId, number: unitNumbers(db, [unitId])[0] })),
    ...Array.from({ length: Math.max(0, x.rooms - x.unitIds.length) }, (_, i) => ({ key: `${x.id}:open${i}`, booking: x })),
  ]);
}

/** Cancel one room and keep the rest. The last room on a booking cancels that booking. */
export function CancelRoomModal({ booking, open, onClose }: { booking: Booking; open: boolean; onClose: () => void }) {
  const db = useHotelDB();
  const choices = cancellableRooms(db, booking);
  const [key, setKey] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [fee, setFee] = useState("");
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [error, setError] = useState("");
  const { saving, run } = useSaving();

  const pick = choices.find((c) => c.key === key);
  const x = pick?.booking;
  const whole = !!x && x.rooms === 1;
  const after = x && !whole ? quoteStay(ratesFor(db.settings, x), x.pricePerNight, x.nights, x.rooms - 1, x.discount) : null;
  const paid = x ? paidOf(x) : 0;
  const capacity = (c: RoomChoice) => (db.roomTypes.find((t) => t.id === c.booking.roomTypeId)?.capacity ?? 0) * (c.booking.rooms - 1);

  // Fee and guests start from the policy and what still fits; staff can change both.
  const choose = (c: RoomChoice) => {
    const terms = cancellationTerms(db, c.booking);
    const left = c.booking.rooms > 1 ? quoteStay(ratesFor(db.settings, c.booking), c.booking.pricePerNight, c.booking.nights, c.booking.rooms - 1, c.booking.discount).total : 0;
    const share = c.booking.total - left;
    const cap = capacity(c);
    const a = Math.max(c.booking.groupId ? 0 : 1, Math.min(c.booking.adults, cap));
    setKey(c.key);
    setFee(String(c.booking.rooms === 1 ? terms.fee : terms.free ? 0 : Math.ceil((share * db.settings.lateCancellationFeeRate) / 100)));
    setAdults(a);
    setChildren(Math.max(0, Math.min(c.booking.children, cap - a)));
    setError("");
  };

  const submit = () =>
    run(() => {
      if (!pick || !x) return;
      setError("");
      const r = whole
        ? cancelBooking(x.id, { reason: reason.trim() || "Cancelled by hotel", fee: Number(fee) || 0 })
        : cancelRoom(x.id, { unitId: pick.unitId, reason, fee: Number(fee) || 0, adults, children });
      if (!r.ok) return setError(r.error);
      toast.success(`${pick.number ? `Room ${pick.number}` : "Room"} cancelled${whole ? ` — ${x.code} is cancelled` : ""}`);
      onClose();
    });

  return (
    <Modal open={open} onClose={onClose} title="Cancel a room" wide>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Which room?</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {choices.map((c) => {
          const on = c.key === key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => choose(c)}
              aria-pressed={on}
              className={cn(
                "rounded-md border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500",
                on ? "border-rose-500 bg-rose-50 ring-2 ring-rose-100" : "border-neutral-200 hover:border-rose-300"
              )}
            >
              <p className="text-lg font-bold text-neutral-900">{c.number ?? "—"}</p>
              <p className="text-xs text-neutral-600">{c.number ? c.booking.roomName : `${c.booking.roomName} · not assigned`}</p>
              {c.booking.id !== booking.id && <p className="mt-1 font-mono text-[11px] text-neutral-500">{c.booking.code}</p>}
            </button>
          );
        })}
      </div>

      {x && (
        <div className="mt-5 space-y-4">
          <dl className="divide-y divide-neutral-100 rounded-md border border-neutral-200 text-sm">
            {whole ? (
              <div className="flex justify-between gap-3 px-3 py-2">
                <dt className="text-neutral-600">{x.code}</dt>
                <dd className="font-medium text-rose-700">Cancelled</dd>
              </div>
            ) : (
              <>
                <div className="flex justify-between gap-3 px-3 py-2">
                  <dt className="text-neutral-600">Rooms on {x.code}</dt>
                  <dd className="font-medium tabular-nums text-neutral-900">
                    {x.rooms} → {x.rooms - 1}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 px-3 py-2">
                  <dt className="text-neutral-600">Room total</dt>
                  <dd className="tabular-nums">
                    <span className="mr-2 text-neutral-400 line-through">{taka(x.total)}</span>
                    <span className="font-medium text-neutral-900">{taka(after!.total)}</span>
                  </dd>
                </div>
              </>
            )}
            <div className="flex justify-between gap-3 px-3 py-2">
              <dt className="text-neutral-600">Paid so far</dt>
              <dd className="font-medium tabular-nums text-neutral-900">{taka(paid)}</dd>
            </div>
          </dl>

          {!whole && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Adults staying">
                <input type="number" min={x.groupId ? 0 : 1} value={adults} onChange={(e) => setAdults(Math.max(0, Number(e.target.value)))} className={inputClass} />
              </Field>
              <Field label="Children staying">
                <input type="number" min={0} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))} className={inputClass} />
              </Field>
            </div>
          )}
          <Field label="Reason (the guest sees this)">
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className={textareaClass} placeholder="e.g. Guest needs one room less" />
          </Field>
          <Field label="Cancellation fee (BDT)" hint={cancellationTerms(db, x).free ? "Free cancellation period" : `Late cancellation · policy ${db.settings.lateCancellationFeeRate}%`}>
            <input type="number" min={0} max={whole ? paid : undefined} value={fee} onChange={(e) => setFee(e.target.value)} className={inputClass} />
          </Field>
        </div>
      )}

      <div className="mt-3">
        <FormError text={error} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={hbtn.outline}>
          Keep rooms
        </button>
        <button type="button" onClick={submit} disabled={!pick || saving} className={cn(hbtn.danger, "border-rose-600 bg-rose-600 text-white hover:bg-rose-700")}>
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {pick ? `Cancel ${pick.number ? `room ${pick.number}` : "this room"}` : "Cancel room"}
        </button>
      </div>
    </Modal>
  );
}

/** Review the bill, then check out. Collecting money is its own step, so nobody checks out a balance by accident. */
export function CheckoutModal({ booking, open, onClose, onCollect }: { booking: Booking; open: boolean; onClose: () => void; onCollect: () => void }) {
  const db = useHotelDB();
  const due = dueOf(booking);
  const credit = creditOf(booking);
  const rooms = unitNumbers(db, booking.unitIds).join(", ");
  const [leaveOwed, setLeaveOwed] = useState(false);
  const [error, setError] = useState("");
  const { saving, run } = useSaving();

  const out = () =>
    run(() => {
      setError("");
      const r = checkOutBooking(booking.id, { allowDue: due > 0 && leaveOwed });
      if (!r.ok) return setError(r.error);
      toast.success(`${booking.guest.name} checked out — room ${rooms} marked for cleaning`);
      onClose();
    });

  return (
    <Modal open={open} onClose={onClose} title={`Review & check out · ${booking.guest.name}`}>
      <div className="space-y-4">
        <dl className="divide-y divide-neutral-100 rounded-md border border-neutral-200 text-sm">
          {[
            ["Room", rooms || "—"],
            ["Stay", `${dateLabel(booking.checkIn, "dd MMM")} → ${dateLabel(booking.checkOut, "dd MMM")} · ${booking.nights} night${booking.nights > 1 ? "s" : ""}`],
            ["Bill total", taka(folioTotal(booking))],
            ["Paid", taka(paidOf(booking))],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 px-3 py-2">
              <dt className="text-neutral-600">{k}</dt>
              <dd className="text-right font-medium tabular-nums text-neutral-900">{v}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-3 bg-neutral-50 px-3 py-2.5">
            <dt className="font-semibold text-neutral-900">{credit > 0 ? "Refund due to guest" : "Balance due"}</dt>
            <dd className={cn("text-right font-bold tabular-nums", due > 0 ? "text-amber-800" : credit > 0 ? "text-violet-700" : "text-emerald-700")}>
              {due > 0 ? taka(due) : credit > 0 ? taka(credit) : "Paid in full"}
            </dd>
          </div>
        </dl>

        {due > 0 ? (
          <>
            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <b>{taka(due)}</b> is still due. Collect it first, or check out and keep it as an unpaid balance on this booking.
            </p>
            <label className="flex items-start gap-2.5 text-sm text-neutral-800">
              <input type="checkbox" checked={leaveOwed} onChange={(e) => setLeaveOwed(e.target.checked)} className="mt-0.5 size-4 accent-sky-600" />
              Check out with {taka(due)} unpaid — the guest or their company will settle later.
            </label>
          </>
        ) : credit > 0 ? (
          <p className="rounded-md bg-violet-50 p-3 text-sm text-violet-900">The guest paid {taka(credit)} more than the bill. Send the refund from Payments after check-out.</p>
        ) : (
          <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">The bill is settled.</p>
        )}
        <p className="text-[13px] text-neutral-600">Room {rooms || "—"} will be marked as needing cleaning.</p>
        <FormError text={error} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={hbtn.outline}>
            Not yet
          </button>
          {due > 0 && (
            <button type="button" onClick={onCollect} className={leaveOwed ? hbtn.outline : hbtn.primary}>
              <Wallet className="size-4" aria-hidden /> Collect payment
            </button>
          )}
          <button type="button" onClick={out} disabled={saving || (due > 0 && !leaveOwed)} className={due > 0 && !leaveOwed ? hbtn.outline : hbtn.primary}>
            {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {saving ? "Checking out…" : due > 0 ? "Check out with balance owed" : "Complete check-out"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Check-in with a checklist: every room assigned, in service, vacant and clean. Anything that isn't is explained,
 * with the fix one click away, and the check-in button stays off until it's sorted.
 */
export function CheckInModal({
  booking,
  onClose,
  onAssign,
  onViewRoom,
}: {
  booking: Booking;
  onClose: () => void;
  /** Open room assignment; the caller brings this checklist back afterwards. */
  onAssign: () => void;
  /** Show the room's status (the dashboard's rooms board); hidden where there's nowhere to show it. */
  onViewRoom?: (unitId: string) => void;
}) {
  const db = useHotelDB();
  const staff = useCurrentStaff();
  const [error, setError] = useState("");
  const { saving, run } = useSaving();
  const blockers = checkInBlockers(db, booking);
  const units = booking.unitIds.map((id) => db.units.find((u) => u.id === id)).filter(Boolean) as RoomUnit[];
  const numbers = units.map((u) => u.number).join(", ");
  const of = <K extends Blocker["kind"]>(kind: K) => blockers.filter((b): b is Extract<Blocker, { kind: K }> => b.kind === kind);
  const unassigned = of("unassigned");
  const oos = of("oos");
  const occupied = of("occupied");
  const dirty = of("dirty");
  const noRooms = units.length === 0;
  const canClean = can(staff?.role, "rooms.housekeeping");
  const due = dueOf(booking);

  const checks: { label: string; ok: boolean | null; detail: string; fix?: React.ReactNode }[] = [
    {
      label: "Room assigned",
      ok: unassigned.length === 0,
      detail: unassigned.length ? unassigned[0].text : `Room ${numbers}`,
      fix: unassigned.length > 0 && (
        <button type="button" onClick={onAssign} className={hbtn.small}>
          Assign room
        </button>
      ),
    },
    {
      label: "In service",
      ok: noRooms ? null : oos.length === 0,
      detail: noRooms ? "Checked once a room is assigned." : oos.length ? oos.map((b) => b.text).join(" ") : "No maintenance holds.",
      fix: oos.length > 0 && (
        <button type="button" onClick={onAssign} className={hbtn.small}>
          Change room
        </button>
      ),
    },
    {
      label: "Previous guest has left",
      ok: noRooms ? null : occupied.length === 0,
      detail: noRooms ? "Checked once a room is assigned." : occupied.length ? occupied.map((b) => b.text).join(" ") : "Room is vacant.",
      fix: occupied.length > 0 && (
        <Link href={`${ADMIN}/bookings/${occupied[0].booking.id}?from=${encodeURIComponent(ADMIN)}`} className={hbtn.small}>
          Open their stay
        </Link>
      ),
    },
    {
      label: "Clean and ready",
      ok: noRooms ? null : dirty.length === 0,
      detail: noRooms ? "Checked once a room is assigned." : dirty.length ? dirty.map((b) => b.text).join(" ") : units.map((u) => `${u.number}: ${housekeepingLabels[u.housekeeping]}`).join(" · "),
      fix: dirty.length > 0 && (
        <span className="flex flex-wrap gap-2">
          {canClean && (
            <button
              type="button"
              onClick={() => {
                dirty.forEach((b) => setHousekeeping(b.unit.id, "clean"));
                toast.success(`Room ${dirty.map((b) => b.unit.number).join(", ")} marked clean`);
              }}
              className={hbtn.small}
            >
              Housekeeping done — mark clean
            </button>
          )}
          {onViewRoom && (
            <button type="button" onClick={() => onViewRoom(dirty[0].unit.id)} className={hbtn.small}>
              View room
            </button>
          )}
        </span>
      ),
    },
  ];

  const submit = () =>
    run(() => {
      setError("");
      const r = checkInBooking(booking.id);
      if (!r.ok) return setError(r.error);
      toast.success(`${booking.guest.name} checked in to room ${unitNumbers(db, r.value.unitIds).join(", ")}`);
      onClose();
    });

  return (
    <Modal open onClose={onClose} title={`Check in · ${booking.guest.name}`} wide>
      <p className="text-sm text-neutral-600">
        {booking.roomName}
        {booking.rooms > 1 ? ` ×${booking.rooms}` : ""} · {dateLabel(booking.checkIn, "dd MMM")} → {dateLabel(booking.checkOut, "dd MMM")} · {booking.nights} night
        {booking.nights > 1 ? "s" : ""} · {booking.adults + booking.children} guest{booking.adults + booking.children > 1 ? "s" : ""}
      </p>

      <ul className="mt-4 divide-y divide-neutral-100 rounded-md border border-neutral-200" aria-label="Check-in checklist">
        {checks.map((c) => (
          <li key={c.label} className="flex flex-wrap items-start gap-3 p-3">
            <span
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                c.ok === true ? "bg-emerald-100 text-emerald-700" : c.ok === false ? "bg-amber-100 text-amber-800" : "bg-neutral-100 text-neutral-500"
              )}
            >
              {c.ok === true ? <Check className="size-3.5" aria-label="Done" /> : c.ok === false ? <AlertTriangle className="size-3.5" aria-label="Needs attention" /> : <Minus className="size-3.5" aria-label="Not checked yet" />}
            </span>
            <span className="min-w-0 flex-1 basis-48">
              <span className="block text-sm font-semibold text-neutral-900">{c.label}</span>
              <span className={cn("block text-sm", c.ok === false ? "text-amber-900" : "text-neutral-600")}>{c.detail}</span>
            </span>
            {c.ok === false && c.fix}
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 text-sm">
        {booking.status === "pending" && <p className="rounded-md bg-sky-50 p-3 text-sky-900">This booking hasn&rsquo;t been confirmed yet — checking in confirms it.</p>}
        {!booking.guest.idNumber && <p className="rounded-md bg-neutral-50 p-3 text-neutral-700">No ID on file — ask for an NID or passport before handing over the key.</p>}
        {booking.guest.note && <p className="rounded-md bg-neutral-50 p-3 text-neutral-700">Guest request: {booking.guest.note}</p>}
        {due > 0 && <p className="rounded-md bg-neutral-50 p-3 text-neutral-700">{taka(due)} still to pay — collect now from the booking, or at check-out.</p>}
      </div>

      <div className="mt-3">
        <FormError text={error} />
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        {blockers.length > 0 && (
          <p id="checkin-blocked" className="text-sm text-amber-900 sm:mr-auto">
            Sort out the {blockers.length === 1 ? "item" : "items"} above to check in.
          </p>
        )}
        <button type="button" onClick={onClose} className={hbtn.outline}>
          Cancel
        </button>
        <button type="button" onClick={submit} disabled={saving || blockers.length > 0} aria-describedby={blockers.length ? "checkin-blocked" : undefined} className={hbtn.primary}>
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {saving ? "Checking in…" : `Complete check-in${numbers ? ` · ${numbers}` : ""}`}
        </button>
      </div>
    </Modal>
  );
}

export function GuestModal({ booking, open, onClose }: { booking: Booking; open: boolean; onClose: () => void }) {
  const [g, setG] = useState<GuestInfo>(booking.guest);
  const set = (k: keyof GuestInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setG((x) => ({ ...x, [k]: e.target.value }));
  const submit = () => {
    const r = updateBookingGuest(booking.id, g);
    if (!r.ok) return toast.error(r.error);
    toast.success("Guest details saved");
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Guest details" wide>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input value={g.name} onChange={set("name")} className={inputClass} />
        </Field>
        <Field label="Phone">
          <input value={g.phone} onChange={set("phone")} className={inputClass} />
        </Field>
        <Field label="Email">
          <input value={g.email} onChange={set("email")} className={inputClass} />
        </Field>
        <Field label="Country">
          <input value={g.country ?? ""} onChange={set("country")} className={inputClass} />
        </Field>
        <Field label="ID type">
          <select value={g.idType ?? "nid"} onChange={set("idType")} className={inputClass}>
            <option value="nid">National ID</option>
            <option value="passport">Passport</option>
          </select>
        </Field>
        <Field label="ID number">
          <input value={g.idNumber ?? ""} onChange={set("idNumber")} className={inputClass} />
        </Field>
        <Field label="Arrival time">
          <input value={g.arrivalTime ?? ""} onChange={set("arrivalTime")} className={inputClass} placeholder="e.g. 4:00 PM – 6:00 PM" />
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700">
          <input type="checkbox" checked={!!g.airportPickup} onChange={(e) => setG((x) => ({ ...x, airportPickup: e.target.checked }))} className="size-4 accent-sky-600" />
          Airport pickup requested
        </label>
        <Field label="Requests" className="sm:col-span-2">
          <textarea value={g.note ?? ""} onChange={set("note")} rows={2} className={textareaClass} />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className={hbtn.outline}>
          Cancel
        </button>
        <button onClick={submit} className={hbtn.primary}>
          Save
        </button>
      </div>
    </Modal>
  );
}
