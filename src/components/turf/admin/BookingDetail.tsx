"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Ban,
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  Check,
  Clock,
  Hash,
  Hourglass,
  Mail,
  MapPin,
  NotebookPen,
  Phone,
  Plus,
  ReceiptText,
  Tag,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { addDays, dateLabel, formatDateTime, hourLabel, payLabels, rangeLabel, sourceLabels, taka } from "@/src/lib/turf-store/format";
import {
  addPayment,
  conflictMessage,
  dueOf,
  findConflict,
  hoursOf,
  paidOf,
  phaseOf,
  priceAt,
  rescheduleBooking,
  setBookingStatus,
  useNow,
  useTurfDB,
} from "@/src/lib/turf-store/store";
import type { Booking, PayMethod, Payment, Phase } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { abtn, ADMIN, cardClass, Empty, Field, InfoRow, inputClass, Modal, Panel, StatusBadge } from "./ui";

const kindBadge: Record<Payment["kind"], string> = {
  advance: "bg-sky-50 text-sky-700",
  balance: "bg-emerald-50 text-emerald-700",
  refund: "bg-violet-50 text-violet-700",
};
const kindLabels: Record<Payment["kind"], string> = { advance: "Advance", balance: "Balance", refund: "Refund" };

export default function BookingDetail({ id }: { id: string }) {
  const db = useTurfDB();
  const now = useNow(30_000);
  const params = useSearchParams();
  const [modal, setModal] = useState<"pay" | "move" | "cancel" | null>(params.get("do") === "pay" ? "pay" : null);
  const b = db.bookings.find((x) => x.id === id);

  if (!b)
    return (
      <div className={cardClass}>
        <Empty icon={ReceiptText} title="Booking not found" text="It may have been removed when the demo data was reset.">
          <Link href={`${ADMIN}/bookings`} className={cn(abtn.outline, "mt-2")}>
            Back to bookings
          </Link>
        </Empty>
      </div>
    );

  const court = db.courts.find((c) => c.id === b.courtId);
  const paid = paidOf(b);
  const due = dueOf(b);
  const phase = phaseOf(b, now);
  const closed = b.status === "cancelled";

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <header className={cn(cardClass, "p-4 sm:p-5")}>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`${ADMIN}/bookings`} aria-label="Back to bookings" className={cn(abtn.outline, "size-10 shrink-0 px-0")}>
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2">
              <span className="font-mono font-semibold text-emerald-800">{b.code}</span>
              <StatusBadge booking={b} />
            </p>
            <p className="truncate text-neutral-700">{b.customer.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {b.status === "pending" && (
              <>
                <button
                  onClick={() => {
                    setBookingStatus(b.id, "confirmed");
                    toast.success(`${b.code} confirmed — the customer sees it live`);
                  }}
                  className={cn(abtn.primary, "bg-emerald-600 hover:bg-emerald-700")}
                >
                  <BadgeCheck className="size-4" /> Verify & confirm
                </button>
                <button onClick={() => setModal("cancel")} className={abtn.danger}>
                  <Ban className="size-4" /> Reject
                </button>
              </>
            )}
            {phase === "booked" && (
              <button onClick={() => setModal("cancel")} className={abtn.danger}>
                <Ban className="size-4" /> Cancel
              </button>
            )}
            {/* Verify the online advance first; the rest is taken at the ground. */}
            {!closed && phase !== "pending" && due > 0 && (
              <button onClick={() => setModal("pay")} className={abtn.primary}>
                <Wallet className="size-4" /> Collect {taka(due)}
              </button>
            )}
          </div>
        </div>
        {closed ? (
          <p className="mt-4 rounded-md bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
            Cancelled
            {b.cancelReason && <> — {b.cancelReason}</>} · {formatDateTime(b.updatedAt)}
          </p>
        ) : (
          <Stepper b={b} phase={phase} paid={paid} due={due} />
        )}
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Panel
            title="Slot"
            icon={CalendarDays}
            action={
              (phase === "pending" || phase === "booked") && (
                <button onClick={() => setModal("move")} className={abtn.small}>
                  <CalendarClock className="size-3.5" /> Reschedule
                </button>
              )
            }
          >
            <dl>
              <InfoRow icon={Hash} label="Booking">
                <span className="font-mono">{b.code}</span>
              </InfoRow>
              <InfoRow icon={MapPin} label="Ground">
                <b className="font-semibold">{court?.name}</b> {court && <span className="text-neutral-600">· {court.size}</span>}
              </InfoRow>
              <InfoRow icon={CalendarDays} label="Date">
                {dateLabel(b.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </InfoRow>
              <InfoRow icon={Clock} label="Time">
                {rangeLabel(b.startHour, b.duration)}
                <span className="block text-xs text-neutral-500">
                  {b.duration} hour{b.duration > 1 ? "s" : ""}
                </span>
              </InfoRow>
              <InfoRow icon={Tag} label="Price">
                {taka(b.total)}
                {court && (
                  <span className="block text-xs text-neutral-500">
                    {Array.from({ length: b.duration }, (_, i) => b.startHour + i)
                      .map((h) => `${hourLabel(h)} ${taka(priceAt(court, h, db.settings))}`)
                      .join(" · ")}
                  </span>
                )}
              </InfoRow>
              <InfoRow icon={ReceiptText} label="Source">
                {sourceLabels[b.source]} · booked {formatDateTime(b.createdAt)}
              </InfoRow>
            </dl>
          </Panel>

          <Panel title="Customer" icon={User}>
            <dl>
              <InfoRow icon={User} label="Name">
                {b.customer.name}
              </InfoRow>
              <InfoRow icon={Phone} label="Phone">
                {b.customer.phone ? (
                  <a href={`tel:${b.customer.phone}`} className="font-medium text-emerald-700 hover:underline">
                    {b.customer.phone}
                  </a>
                ) : (
                  "—"
                )}
              </InfoRow>
              <InfoRow icon={Mail} label="Email">
                {b.customer.email ? (
                  <a href={`mailto:${b.customer.email}`} className="font-medium text-emerald-700 hover:underline">
                    {b.customer.email}
                  </a>
                ) : (
                  "—"
                )}
              </InfoRow>
              <InfoRow icon={Users} label="Team">
                {b.customer.team ?? "—"}
              </InfoRow>
              <InfoRow icon={NotebookPen} label="Note">
                {b.note ?? "—"}
              </InfoRow>
            </dl>
          </Panel>

          <Panel
            title="Payments"
            icon={Wallet}
            action={
              <button onClick={() => setModal("pay")} className={abtn.small}>
                <Plus className="size-3.5" /> Record payment
              </button>
            }
          >
            {b.payments.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-500">No payments yet.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {b.payments.map((p) => (
                  <li key={p.id} className="flex items-start gap-3 py-3">
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", kindBadge[p.kind])}>
                      <Wallet className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-medium text-neutral-900">
                        {payLabels[p.method]}
                        <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold", kindBadge[p.kind])}>{kindLabels[p.kind]}</span>
                      </p>
                      {p.ref && <p className="font-mono text-xs text-neutral-600">TrxID {p.ref}</p>}
                      <p className="text-xs text-neutral-500">{formatDateTime(p.at)}</p>
                    </div>
                    <p className={cn("font-semibold tabular-nums", p.kind === "refund" ? "text-violet-700" : "text-neutral-900")}>
                      {p.kind === "refund" ? "−" : ""}
                      {taka(p.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <section className={cn(cardClass, "p-4")}>
            <dl className="overflow-hidden rounded-md border border-neutral-200 text-sm">
              <div className="flex justify-between px-3 py-2.5">
                <dt className="text-neutral-600">Total</dt>
                <dd className="tabular-nums">{taka(b.total)}</dd>
              </div>
              <div className="flex justify-between border-t border-neutral-100 px-3 py-2.5">
                <dt className="text-neutral-600">Advance required</dt>
                <dd className="tabular-nums">{taka(b.advanceDue)}</dd>
              </div>
              <div className="flex justify-between border-t border-neutral-100 px-3 py-2.5">
                <dt className="text-neutral-600">Paid (net)</dt>
                <dd className="tabular-nums text-emerald-700">{taka(paid)}</dd>
              </div>
              <div className={cn("flex justify-between border-t px-3 py-3 font-semibold", due > 0 && !closed ? "border-rose-100 bg-rose-50 text-rose-800" : "border-emerald-100 bg-emerald-50 text-emerald-800")}>
                <dt>{closed ? "Nothing to collect" : due > 0 ? "Balance due" : "Fully paid"}</dt>
                <dd className="text-lg tabular-nums">{taka(closed ? 0 : due)}</dd>
              </div>
            </dl>
            {!closed && phase !== "pending" && due > 0 && (
              <button onClick={() => setModal("pay")} className={cn(abtn.primary, "mt-3 w-full")}>
                <Wallet className="size-4" /> Collect balance
              </button>
            )}
          </section>

          <section className={cn(cardClass, "p-4 sm:p-5")}>
            <h2 className="font-semibold text-neutral-900">Activity</h2>
            <Activity b={b} />
          </section>
        </aside>
      </div>

      {modal === "pay" && <PaymentModal b={b} onClose={() => setModal(null)} />}
      {modal === "move" && <RescheduleModal b={b} onClose={() => setModal(null)} />}
      {modal === "cancel" && <CancelModal b={b} onClose={() => setModal(null)} />}
    </div>
  );
}

/** Book → pay the booking money → play, with the next step highlighted. */
function Stepper({ b, phase, paid, due }: { b: Booking; phase: Phase; paid: number; due: number }) {
  const advance = b.payments.find((p) => p.kind === "advance");
  const steps = [
    { label: "Booked", sub: `${sourceLabels[b.source]} · ${dateLabel(b.createdAt.slice(0, 10), { day: "numeric", month: "short" })}`, done: true },
    {
      label: "Booking money",
      sub: phase === "pending" ? "Awaiting verification" : advance ? `${taka(advance.amount)} · ${payLabels[advance.method]}` : paid > 0 ? `${taka(paid)} paid` : "Pay at the ground",
      done: phase !== "pending",
    },
    {
      label: phase === "played" ? "Played" : "Play",
      sub: phase === "playing" ? "Playing now" : phase === "played" ? (due > 0 ? `${taka(due)} still due` : "Fully paid") : `${dateLabel(b.date, { day: "numeric", month: "short" })} · ${hourLabel(b.startHour)}`,
      done: phase === "played",
    },
  ];
  const current = steps.findIndex((s) => !s.done);
  return (
    <ol className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-0">
      {steps.map((s, i) => (
        <li key={i} className="flex items-center gap-3 sm:pr-3">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
              s.done ? "bg-emerald-600 text-white" : i === current ? "bg-emerald-700 text-white ring-4 ring-emerald-100" : "bg-neutral-100 text-neutral-500"
            )}
          >
            {s.done ? <Check className="size-4" /> : i + 1}
          </span>
          <span className="min-w-0">
            <span className={cn("block text-sm font-semibold", i === current ? "text-emerald-800" : "text-neutral-900")}>{s.label}</span>
            <span className="block truncate text-xs text-neutral-500">{s.sub}</span>
          </span>
          {i < steps.length - 1 && <span aria-hidden className={cn("ml-auto hidden h-0.5 min-w-6 flex-1 rounded sm:block", s.done ? "bg-emerald-500" : "bg-neutral-200")} />}
        </li>
      ))}
    </ol>
  );
}

/** Built from what the booking records: when it was made, each payment, and a cancellation. */
function Activity({ b }: { b: Booking }) {
  const items = [
    { at: b.createdAt, text: `Booking made (${sourceLabels[b.source].toLowerCase()})` },
    ...b.payments.map((p) => ({ at: p.at, text: p.kind === "refund" ? `Refunded ${taka(p.amount)} via ${payLabels[p.method]}` : `Received ${taka(p.amount)} via ${payLabels[p.method]}` })),
    ...(b.status === "cancelled" ? [{ at: b.updatedAt, text: `Cancelled${b.cancelReason ? ` — ${b.cancelReason}` : ""}` }] : []),
  ].sort((x, y) => y.at.localeCompare(x.at));
  return (
    <ul className="mt-3 space-y-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", i === 0 ? "bg-emerald-500" : "bg-neutral-300")} />
          <span>
            <span className="block text-sm text-neutral-900">{it.text}</span>
            <span className="block text-xs text-neutral-500">{formatDateTime(it.at)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function PaymentModal({ b, onClose }: { b: Booking; onClose: () => void }) {
  const router = useRouter();
  const due = dueOf(b);
  const paid = paidOf(b);
  const [kind, setKind] = useState<"balance" | "refund">(due > 0 ? "balance" : "refund");
  const [amount, setAmount] = useState(String(due || ""));
  const [method, setMethod] = useState<PayMethod>("cash");
  const [ref, setRef] = useState("");
  const close = () => {
    // Drop ?do=pay so a refresh doesn't reopen the form.
    router.replace(`${ADMIN}/bookings/${b.id}`, { scroll: false });
    onClose();
  };

  return (
    <Modal open onClose={close} title="Record payment">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(amount);
          if (!n || n <= 0) return toast.error("Enter an amount");
          if (kind === "refund" && n > paid) return toast.error("Refund is more than what was paid");
          addPayment(b.id, n, method, kind, ref.trim());
          toast.success(kind === "refund" ? "Refund recorded" : `${taka(n)} received`);
          close();
        }}
        className="space-y-3"
      >
        <div className="grid grid-cols-2 gap-1 rounded-md bg-neutral-100 p-1 text-sm font-medium">
          {(
            [
              ["balance", "Collect"],
              ["refund", "Refund"],
            ] as const
          ).map(([v, l]) => (
            <button key={v} type="button" onClick={() => setKind(v)} className={cn("rounded py-2", kind === v ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500")}>
              {l}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Amount (৳)" hint={kind === "balance" ? `Balance due ${taka(due)}` : `Paid so far ${taka(paid)}`}>
            <input autoFocus inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} className={inputClass} />
          </Field>
          <Field label="Method">
            <select value={method} onChange={(e) => setMethod(e.target.value as PayMethod)} className={inputClass}>
              {Object.entries(payLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {method !== "cash" && (
          <Field label="Transaction ID" hint="Optional">
            <input value={ref} onChange={(e) => setRef(e.target.value)} className={cn(inputClass, "font-mono")} />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3">
          <button type="button" onClick={close} className={abtn.outline}>
            Cancel
          </button>
          <button className={abtn.primary}>{kind === "refund" ? "Record refund" : "Record payment"}</button>
        </div>
      </form>
    </Modal>
  );
}

function RescheduleModal({ b, onClose }: { b: Booking; onClose: () => void }) {
  const db = useTurfDB();
  const now = useNow(15_000);
  const [date, setDate] = useState(b.date);
  const [start, setStart] = useState(b.startHour);
  const [duration, setDuration] = useState(b.duration);
  const req = { courtId: b.courtId, date, startHour: start, duration };
  const conflict = findConflict(db, req, { ignoreBookingId: b.id, now });
  const unchanged = date === b.date && start === b.startHour && duration === b.duration;

  return (
    <Modal open onClose={onClose} title="Reschedule booking">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Date">
            <input type="date" value={date} min={addDays(b.date, -365)} onChange={(e) => e.target.value && setDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Start">
            <select value={start} onChange={(e) => setStart(Number(e.target.value))} className={inputClass}>
              {hoursOf(db.settings).map((h) => (
                <option key={h} value={h}>
                  {hourLabel(h)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hours">
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass}>
              {Array.from({ length: db.settings.maxDuration }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {!unchanged && (
          <p className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm", conflict ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800")}>
            {conflict ? <Hourglass className="size-4" /> : <Check className="size-4" />}
            {conflict ? (conflict.kind === "booking" ? `Clashes with ${conflict.booking.code} (${conflict.booking.customer.name}).` : conflictMessage(conflict)) : "That slot is free."}
          </p>
        )}
        <p className="text-xs text-neutral-500">The price stays as booked; record any difference under Payments.</p>
        <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3">
          <button onClick={onClose} className={abtn.outline}>
            Cancel
          </button>
          <button
            disabled={unchanged || !!conflict}
            onClick={() => {
              const r = rescheduleBooking(b.id, req);
              if (!r.ok) return toast.error(r.error);
              toast.success(`${b.code} moved`);
              onClose();
            }}
            className={abtn.primary}
          >
            Move booking
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CancelModal({ b, onClose }: { b: Booking; onClose: () => void }) {
  const reject = b.status === "pending";
  const [reason, setReason] = useState(reject ? "Payment could not be verified" : "");
  const paid = paidOf(b);
  return (
    <Modal open onClose={onClose} title={reject ? `Reject ${b.code}` : `Cancel ${b.code}`}>
      <div className="space-y-3">
        <Field label="Reason" hint="Shown to the customer under My Bookings">
          <input autoFocus value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} placeholder="e.g. Rain, ground closed" />
        </Field>
        {paid > 0 && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">{taka(paid)} was paid. Record a refund under Payments if you return it.</p>}
        <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3">
          <button onClick={onClose} className={abtn.outline}>
            Keep booking
          </button>
          <button
            onClick={() => {
              setBookingStatus(b.id, "cancelled", reason.trim() || "Cancelled by venue");
              toast.success(`${b.code} ${reject ? "rejected" : "cancelled"}`);
              onClose();
            }}
            className={cn(abtn.primary, "bg-rose-600 hover:bg-rose-700")}
          >
            {reject ? "Reject booking" : "Cancel booking"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
