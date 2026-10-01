"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Modal } from "@/src/components/gadgets/admin/kit";
import { hourLabel, payLabels, taka } from "@/src/lib/turf-store/format";
import { addBlock, conflictMessage, createAdminBooking, findConflict, hoursOf, quote, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { PayMethod } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { inputClass, labelClass, tbtn } from "../ui";

export type SlotDraft = { courtId: string; date: string; startHour: number };

/** Front-desk booking (walk-in / phone) or a court closure, prefilled from the clicked cell. */
export default function NewBookingModal({ draft, onClose }: { draft: SlotDraft | null; onClose: () => void }) {
  return (
    <Modal open={!!draft} onClose={onClose} title="New entry" wide>
      {draft && <Form key={`${draft.courtId}${draft.date}${draft.startHour}`} draft={draft} onClose={onClose} />}
    </Modal>
  );
}

function Form({ draft, onClose }: { draft: SlotDraft; onClose: () => void }) {
  const db = useTurfDB();
  const now = useNow(15_000);
  const [mode, setMode] = useState<"booking" | "block">("booking");
  const [courtId, setCourtId] = useState(draft.courtId);
  const [date, setDate] = useState(draft.date);
  const [start, setStart] = useState(draft.startHour);
  const [duration, setDuration] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<"walk-in" | "phone">("walk-in");
  const court = db.courts.find((c) => c.id === courtId);
  const q = court ? quote(court, start, duration, db.settings) : { total: 0, advance: 0 };
  const [price, setPrice] = useState<string>("");
  const [paid, setPaid] = useState<string>("");
  const [method, setMethod] = useState<PayMethod>("cash");
  const [reason, setReason] = useState("Maintenance");

  const req = { courtId, date, startHour: start, duration };
  const conflict = findConflict(db, req, { now, allowPast: true });
  const total = price === "" ? q.total : Number(price);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "block") {
      const r = addBlock({ ...req, reason: reason.trim() || "Closed" });
      if (!r.ok) return toast.error(r.error);
      toast.success("Court blocked");
      return onClose();
    }
    if (name.trim().length < 2) return toast.error("Enter the customer name");
    const r = createAdminBooking({
      ...req,
      customer: { name: name.trim(), phone: phone.trim() },
      source,
      total,
      paid: paid === "" ? 0 : Number(paid),
      method,
    });
    if (!r.ok) return toast.error(r.error);
    toast.success(`Booking ${r.value.code} created`);
    onClose();
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="flex gap-1 rounded-full bg-neutral-100 p-1 text-sm font-medium">
        {(
          [
            ["booking", "Booking"],
            ["block", "Block court"],
          ] as const
        ).map(([v, l]) => (
          <button type="button" key={v} onClick={() => setMode(v)} className={cn("flex-1 rounded-full py-2", mode === v ? "bg-white shadow-sm" : "text-neutral-500")}>
            {l}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Court</label>
          <select value={courtId} onChange={(e) => setCourtId(e.target.value)} className={inputClass}>
            {db.courts.filter((c) => c.active).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Date</label>
          <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Start</label>
          <select value={start} onChange={(e) => setStart(Number(e.target.value))} className={inputClass}>
            {hoursOf(db.settings).map((h) => (
              <option key={h} value={h}>
                {hourLabel(h)}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Hours</label>
          <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass}>
            {Array.from({ length: mode === "block" ? db.settings.closeHour - db.settings.openHour : db.settings.maxDuration }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {mode === "booking" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Customer name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input value={phone} inputMode="numeric" onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value as "walk-in" | "phone")} className={inputClass}>
              <option value="walk-in">Walk-in</option>
              <option value="phone">Phone call</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Price (list {taka(q.total)})</label>
            <input value={price} placeholder={String(q.total)} inputMode="numeric" onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Received now</label>
            <input value={paid} placeholder="0" inputMode="numeric" onChange={(e) => setPaid(e.target.value.replace(/\D/g, ""))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as PayMethod)} className={inputClass}>
              {Object.entries(payLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div>
          <label className={labelClass}>Reason</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} placeholder="Maintenance, tournament…" />
        </div>
      )}

      {conflict && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {conflict.kind === "booking" ? `Clashes with ${conflict.booking.code} (${conflict.booking.customer.name}).` : conflictMessage(conflict)}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={tbtn.outline}>
          Cancel
        </button>
        <button disabled={!!conflict && !(mode === "block" && conflict.kind === "hold")} className={tbtn.green}>
          {mode === "block" ? "Block court" : "Create booking"}
        </button>
      </div>
    </form>
  );
}
