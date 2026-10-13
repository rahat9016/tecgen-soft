"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { chargeLabels, housekeepingLabels, nightsBetween, payLabels, taka, todayKey } from "@/src/lib/hotel-store/format";
import {
  addCharge,
  addPayment,
  assignUnits,
  cancelBooking,
  cancellationTerms,
  changeStay,
  checkInBooking,
  checkOutBooking,
  creditOf,
  dueOf,
  freeRooms,
  freeUnits,
  paidOf,
  quoteStay,
  updateBookingGuest,
  useHotelDB,
} from "@/src/lib/hotel-store/store";
import type { Booking, ChargeCategory, GuestInfo, PayMethod, PaymentKind } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { Field, hbtn, inputClass, Modal, textareaClass } from "./ui";

const methods: PayMethod[] = ["cash", "card", "bkash", "nagad", "rocket", "bank"];

export function PaymentModal({ booking, kind, onClose }: { booking: Booking; kind: PaymentKind | null; onClose: () => void }) {
  const isRefund = kind === "refund";
  const suggested = isRefund ? creditOf(booking) || paidOf(booking) : dueOf(booking);
  const firstMethod = booking.payments.find((p) => !p.void && p.kind !== "refund")?.method;
  const [amount, setAmount] = useState(String(suggested || ""));
  const [method, setMethod] = useState<PayMethod>(isRefund && firstMethod ? firstMethod : "cash");
  const [ref, setRef] = useState("");
  const [note, setNote] = useState("");

  const submit = () => {
    const r = addPayment(booking.id, { amount: Number(amount), method, kind: kind ?? "payment", ref, note });
    if (!r.ok) return toast.error(r.error);
    toast.success(isRefund ? `Refunded ${taka(Number(amount))}` : `Received ${taka(Number(amount))} via ${payLabels[method]}`);
    onClose();
  };

  return (
    <Modal open={!!kind} onClose={onClose} title={isRefund ? `Refund · ${booking.code}` : `Record payment · ${booking.code}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-neutral-50 p-3 text-center text-xs">
          <div>
            <p className="text-neutral-500">Paid</p>
            <p className="font-semibold text-neutral-900">{taka(paidOf(booking))}</p>
          </div>
          <div>
            <p className="text-neutral-500">Due</p>
            <p className="font-semibold text-rose-600">{taka(dueOf(booking))}</p>
          </div>
          <div>
            <p className="text-neutral-500">Refundable</p>
            <p className="font-semibold text-violet-700">{taka(creditOf(booking))}</p>
          </div>
        </div>
        <Field label="Amount (BDT)">
          <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} autoFocus />
        </Field>
        <div>
          <span className="mb-1 block text-xs font-medium text-neutral-600">{isRefund ? "Refund to" : "Method"}</span>
          <div className="grid grid-cols-3 gap-2">
            {methods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                aria-pressed={method === m}
                className={cn("h-9 rounded-lg border text-sm font-medium transition", method === m ? "border-sky-500 bg-sky-50 text-sky-800" : "border-neutral-200 text-neutral-600 hover:border-sky-300")}
              >
                {payLabels[m]}
              </button>
            ))}
          </div>
        </div>
        {method !== "cash" && (
          <Field label={method === "card" ? "Card / auth reference" : method === "bank" ? "Bank reference" : "Transaction ID (TrxID)"}>
            <input value={ref} onChange={(e) => setRef(e.target.value)} className={inputClass} placeholder={method === "card" ? "•••• 4242 · Auth 123456" : "e.g. 9F3K2L1M0P"} />
          </Field>
        )}
        <Field label="Note (optional)">
          <input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} placeholder={isRefund ? "Reason for the refund" : "e.g. Paid at check-out"} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className={hbtn.outline}>
            Cancel
          </button>
          <button onClick={submit} className={isRefund ? hbtn.dark : hbtn.success}>
            {isRefund ? "Refund" : "Record payment"}
          </button>
        </div>
      </div>
    </Modal>
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
                "rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
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

/** Pick physical rooms; with `checkIn` it also checks the guest in. */
export function RoomsModal({ booking, mode, onClose }: { booking: Booking; mode: "assign" | "checkin" | null; onClose: () => void }) {
  const db = useHotelDB();
  const today = todayKey();
  const from = booking.status === "checked-in" || mode === "checkin" ? (today > booking.checkIn ? today : booking.checkIn) : booking.checkIn;
  const free = freeUnits(db, booking.roomTypeId, from, booking.checkOut, booking.id);
  const options = db.units.filter((u) => u.typeId === booking.roomTypeId && (free.some((f) => f.id === u.id) || booking.unitIds.includes(u.id)));
  const others = db.units.filter((u) => u.typeId === booking.roomTypeId && !options.includes(u));
  const [picked, setPicked] = useState<string[]>(booking.unitIds);

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= booking.rooms ? [...p.slice(1), id] : [...p, id]));

  const submit = () => {
    const r = mode === "checkin" ? checkInBooking(booking.id, picked) : assignUnits(booking.id, picked);
    if (!r.ok) return toast.error(r.error);
    toast.success(mode === "checkin" ? `${booking.guest.name} checked in` : "Rooms updated");
    onClose();
  };

  return (
    <Modal open={!!mode} onClose={onClose} title={mode === "checkin" ? `Check in · ${booking.guest.name}` : booking.status === "checked-in" ? "Move room" : "Assign rooms"} wide>
      <p className="text-sm text-neutral-500">
        Pick {booking.rooms} {booking.roomName} room{booking.rooms > 1 ? "s" : ""} free from {from} to {booking.checkOut}.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {options.map((u) => {
          const on = picked.includes(u.id);
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => toggle(u.id)}
              aria-pressed={on}
              className={cn("rounded-xl border p-3 text-left transition", on ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100" : "border-neutral-200 hover:border-sky-300")}
            >
              <p className="text-lg font-bold text-neutral-900">{u.number}</p>
              <p className={cn("text-[11px] font-medium", u.housekeeping === "dirty" ? "text-amber-600" : "text-emerald-600")}>{housekeepingLabels[u.housekeeping]}</p>
              <p className="text-[11px] text-neutral-400">Floor {u.floor}</p>
            </button>
          );
        })}
        {others.map((u) => (
          <div key={u.id} className="rounded-xl border border-dashed border-neutral-200 p-3 text-left opacity-60" title={u.outOfService ? u.oosReason : "Booked for these dates"}>
            <p className="text-lg font-bold text-neutral-400">{u.number}</p>
            <p className="text-[11px] text-neutral-400">{u.outOfService ? "Out of service" : "Taken"}</p>
          </div>
        ))}
      </div>
      {options.length === 0 && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">No free {booking.roomName} rooms for these dates — change the stay or move another booking first.</p>}
      {mode === "checkin" && picked.some((id) => db.units.find((u) => u.id === id)?.housekeeping === "dirty") && (
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Heads up: a selected room is still marked as needing cleaning.</p>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className={hbtn.outline}>
          Cancel
        </button>
        <button onClick={submit} disabled={mode === "checkin" && picked.length < booking.rooms} className={mode === "checkin" ? hbtn.success : hbtn.primary}>
          {mode === "checkin" ? `Check in to ${picked.length ? db.units.filter((u) => picked.includes(u.id)).map((u) => u.number).join(", ") : "…"}` : "Save rooms"}
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
  const q = quoteStay(db.settings, form.pricePerNight, nights, form.rooms);
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
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-50 p-3 text-sm">
        <span className={free >= form.rooms ? "text-emerald-700" : "text-rose-600"}>
          {nights < 1 ? "Pick valid dates" : free >= form.rooms ? `${free} ${type?.name ?? ""} free for these dates` : `Only ${free} free for these dates`}
        </span>
        <span>
          {nights} night{nights !== 1 ? "s" : ""} · new room total <b>{taka(q.total)}</b>
          <span className="text-neutral-500"> (was {taka(booking.total)})</span>
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
        <p className={cn("rounded-xl p-3 text-sm", terms.free ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>
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

export function CheckoutModal({ booking, open, onClose, onCollect }: { booking: Booking; open: boolean; onClose: () => void; onCollect: () => void }) {
  const due = dueOf(booking);
  const out = (allowDue: boolean) => {
    const r = checkOutBooking(booking.id, { allowDue });
    if (!r.ok) return toast.error(r.error);
    toast.success(`${booking.guest.name} checked out — room marked for cleaning`);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={`Check out · ${booking.guest.name}`}>
      {due > 0 ? (
        <div className="space-y-4">
          <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            <b>{taka(due)}</b> is still due on this folio.
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={onCollect} className={hbtn.success}>
              Collect {taka(due)} first
            </button>
            <button onClick={() => out(true)} className={hbtn.outline}>
              Check out with balance owed (city ledger)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Folio is settled. The room will be marked as needing cleaning.</p>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className={hbtn.outline}>
              Not yet
            </button>
            <button onClick={() => out(false)} className={hbtn.success}>
              Check out
            </button>
          </div>
        </div>
      )}
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
