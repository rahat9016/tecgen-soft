"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Ban, BadgeCheck, CalendarClock, CheckCheck, LogIn, Phone, UserX, Wallet } from "lucide-react";
import { Drawer } from "@/src/components/gadgets/admin/kit";
import { addDays, dateLabel, formatDateTime, hourLabel, payLabels, rangeLabel, sportLabels, taka } from "@/src/lib/turf-store/format";
import {
  addPayment,
  conflictMessage,
  dueOf,
  findConflict,
  hoursOf,
  paidOf,
  rescheduleBooking,
  setBookingStatus,
  startMs,
  useNow,
  useTurfDB,
} from "@/src/lib/turf-store/store";
import type { PayMethod, Payment } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { BookingStatusBadge, inputClass, labelClass, SportIcon, tbtn } from "../ui";

export default function BookingDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const db = useTurfDB();
  const now = useNow(15_000);
  const b = db.bookings.find((x) => x.id === id);
  const [tab, setTab] = useState<"details" | "payment" | "move">("details");

  if (!b) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;

  const court = db.courts.find((c) => c.id === b.courtId);
  const paid = paidOf(b);
  const due = dueOf(b);
  const started = startMs(b) <= now;

  const cancel = (label: string) => {
    const reason = prompt(`${label} ${b.code} — reason (shown to the customer):`, b.status === "pending" ? "Payment could not be verified" : "");
    if (reason === null) return;
    setBookingStatus(b.id, "cancelled", reason || "Cancelled by venue");
    toast.success(`${b.code} cancelled`);
  };

  return (
    <Drawer
      open={!!b}
      onClose={() => {
        setTab("details");
        onClose();
      }}
      title={
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-neutral-500">{b.code}</span>
            <BookingStatusBadge status={b.status} />
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] capitalize text-neutral-600">{b.source}</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-neutral-900">{b.customer.name}</p>
        </div>
      }
      footer={
        <div className="flex flex-wrap gap-2">
          {b.status === "pending" && (
            <>
              <button
                onClick={() => {
                  setBookingStatus(b.id, "confirmed");
                  toast.success(`${b.code} confirmed — customer sees it live`);
                }}
                className={tbtn.green}
              >
                <BadgeCheck className="size-4" /> Verify advance & confirm
              </button>
              <button onClick={() => cancel("Reject")} className={tbtn.danger}>
                <Ban className="size-4" /> Reject
              </button>
            </>
          )}
          {b.status === "confirmed" && (
            <>
              <button onClick={() => setBookingStatus(b.id, "checked-in")} className={tbtn.green}>
                <LogIn className="size-4" /> Check in
              </button>
              {started && (
                <button onClick={() => setBookingStatus(b.id, "no-show")} className={tbtn.outline}>
                  <UserX className="size-4" /> No-show
                </button>
              )}
              <button onClick={() => cancel("Cancel")} className={tbtn.danger}>
                <Ban className="size-4" /> Cancel
              </button>
            </>
          )}
          {b.status === "checked-in" && (
            <button
              onClick={() => {
                if (due > 0 && !confirm(`${taka(due)} is still due. Mark as completed anyway?`)) return;
                setBookingStatus(b.id, "completed");
              }}
              className={tbtn.green}
            >
              <CheckCheck className="size-4" /> Complete game
            </button>
          )}
          {(b.status === "cancelled" || b.status === "no-show") && (
            <p className="text-sm text-neutral-500">{b.cancelReason ?? "No further actions."}</p>
          )}
          {b.status === "completed" && <p className="text-sm text-neutral-500">Game finished.</p>}
        </div>
      }
    >
      <div className="flex gap-3 rounded-2xl bg-emerald-950 p-3 text-white">
        {court && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={court.image} alt="" className="size-16 rounded-xl object-cover" />
        )}
        <div>
          <p className="flex items-center gap-1.5 text-xs text-lime-300">
            {court && <SportIcon sport={court.sport} className="size-3.5" />} {court ? sportLabels[court.sport] : ""}
          </p>
          <p className="font-semibold">{court?.name}</p>
          <p className="text-sm text-white/80">
            {dateLabel(b.date, { weekday: "short", day: "numeric", month: "short" })} · {rangeLabel(b.startHour, b.duration)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["Total", taka(b.total), ""],
          ["Paid", taka(paid), "text-emerald-700"],
          ["Due", taka(due), due > 0 ? "text-rose-600" : ""],
        ].map(([k, v, c]) => (
          <div key={k} className="rounded-xl bg-neutral-50 py-2.5">
            <p className="text-[11px] text-neutral-500">{k}</p>
            <p className={cn("font-semibold text-neutral-900", c)}>{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-1 rounded-full bg-neutral-100 p-1 text-xs font-medium">
        {(
          [
            ["details", "Details"],
            ["payment", "Payments"],
            ["move", "Reschedule"],
          ] as const
        ).map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} className={cn("flex-1 rounded-full py-2", tab === v ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500")}>
            {l}
          </button>
        ))}
      </div>

      {tab === "details" && (
        <dl className="mt-4 divide-y divide-neutral-100 text-sm">
          {[
            ["Phone", <a key="p" href={`tel:${b.customer.phone}`} className="inline-flex items-center gap-1 text-emerald-700 hover:underline"><Phone className="size-3.5" />{b.customer.phone}</a>],
            ["Email", b.customer.email ?? "—"],
            ["Team", b.customer.team ?? "—"],
            ["Note", b.note ?? "—"],
            ["Advance required", taka(b.advanceDue)],
            ["Booked", formatDateTime(b.createdAt)],
            ["Last update", formatDateTime(b.updatedAt)],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex justify-between gap-4 py-2.5">
              <dt className="text-neutral-500">{k}</dt>
              <dd className="text-right text-neutral-900">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {tab === "payment" && <PaymentsTab bookingId={b.id} due={due} paid={paid} payments={b.payments} />}
      {tab === "move" && <RescheduleTab bookingId={b.id} />}
    </Drawer>
  );
}

function PaymentsTab({ bookingId, due, paid, payments }: { bookingId: string; due: number; paid: number; payments: Payment[] }) {
  const [amount, setAmount] = useState(String(due || ""));
  const [method, setMethod] = useState<PayMethod>("cash");
  const [kind, setKind] = useState<"balance" | "refund">(due > 0 ? "balance" : "refund");
  const [ref, setRef] = useState("");

  return (
    <div className="mt-4 space-y-4">
      <ul className="space-y-2">
        {payments.length === 0 && <li className="text-sm text-neutral-500">No payments yet.</li>}
        {payments.map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-xl border border-neutral-100 px-3 py-2.5 text-sm">
            <div>
              <p className="font-medium capitalize text-neutral-900">
                {p.kind} · {payLabels[p.method]}
              </p>
              <p className="text-xs text-neutral-500">
                {formatDateTime(p.at)} {p.ref && `· ${p.ref}`}
              </p>
            </div>
            <p className={cn("font-semibold", p.kind === "refund" ? "text-rose-600" : "text-emerald-700")}>
              {p.kind === "refund" ? "−" : "+"}
              {taka(p.amount)}
            </p>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(amount);
          if (!n || n <= 0) return toast.error("Enter an amount");
          if (kind === "refund" && n > paid) return toast.error("Refund is more than what was paid");
          addPayment(bookingId, n, method, kind, ref.trim());
          toast.success(kind === "refund" ? "Refund recorded" : "Payment recorded");
          setAmount("");
          setRef("");
        }}
        className="rounded-2xl bg-neutral-50 p-4"
      >
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
          <Wallet className="size-4" /> Record payment
        </p>
        <div className="grid grid-cols-2 gap-2">
          <select aria-label="Type" value={kind} onChange={(e) => setKind(e.target.value as "balance" | "refund")} className={inputClass}>
            <option value="balance">Collect</option>
            <option value="refund">Refund</option>
          </select>
          <select aria-label="Method" value={method} onChange={(e) => setMethod(e.target.value as PayMethod)} className={inputClass}>
            {Object.entries(payLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <input aria-label="Amount" className={inputClass} inputMode="numeric" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
          <input aria-label="Reference" className={inputClass} placeholder="Ref / TrxID (optional)" value={ref} onChange={(e) => setRef(e.target.value)} />
        </div>
        <button className={cn(tbtn.green, "mt-3 w-full")}>Save</button>
      </form>
    </div>
  );
}

function RescheduleTab({ bookingId }: { bookingId: string }) {
  const db = useTurfDB();
  const now = useNow(15_000);
  const b = db.bookings.find((x) => x.id === bookingId)!;
  const [courtId, setCourtId] = useState(b.courtId);
  const [date, setDate] = useState(b.date);
  const [start, setStart] = useState(b.startHour);
  const [duration, setDuration] = useState(b.duration);
  const req = { courtId, date, startHour: start, duration };
  const conflict = findConflict(db, req, { ignoreBookingId: b.id, now });
  const unchanged = courtId === b.courtId && date === b.date && start === b.startHour && duration === b.duration;

  return (
    <div className="mt-4 space-y-3">
      <div>
        <label className={labelClass}>Court</label>
        <select value={courtId} onChange={(e) => setCourtId(e.target.value)} className={inputClass}>
          {db.courts.filter((c) => c.active).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" value={date} min={addDays(date, -365)} onChange={(e) => e.target.value && setDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Start</label>
          <select value={start} onChange={(e) => setStart(Number(e.target.value))} className={inputClass}>
            {hoursOf(db.settings).map((h) => (
              <option key={h} value={h}>
                {hourLabel(h)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Hours</label>
          <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass}>
            {Array.from({ length: db.settings.maxDuration }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
      {!unchanged && (
        <p className={cn("rounded-xl px-3 py-2 text-xs", conflict ? "bg-rose-50 text-rose-700" : "bg-lime-50 text-emerald-800")}>
          {conflict ? (conflict.kind === "booking" ? `Clashes with ${conflict.booking.code} (${conflict.booking.customer.name}).` : conflictMessage(conflict)) : "Slot is free."}
        </p>
      )}
      <button
        disabled={unchanged || !!conflict}
        onClick={() => {
          const r = rescheduleBooking(b.id, req);
          if (r.ok) toast.success(`${b.code} moved`);
          else toast.error(r.error);
        }}
        className={cn(tbtn.green, "w-full")}
      >
        <CalendarClock className="size-4" /> Move booking
      </button>
      <p className="text-xs text-neutral-500">The price stays as booked; record any difference under Payments.</p>
    </div>
  );
}
