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
  CalendarX,
  CircleDot,
  Clock,
  Hash,
  Mail,
  NotebookPen,
  Phone,
  ReceiptText,
  Tag,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { dateLabel, rangeLabel, sourceLabels, taka } from "@/src/lib/turf-store/format";
import {
  addPayment,
  dueOf,
  findConflict,
  paidOf,
  phaseOf,
  rescheduleBooking,
  setBookingStatus,
  trxUsed,
  useNow,
  useTurfDB,
} from "@/src/lib/turf-store/store";
import type { Booking, PayMethod } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { MethodTiles, TRX_ID, TrxIdField, WalletDetails } from "../pay";
import SlotPicker from "./SlotPicker";
import { abtn, ADMIN, cardClass, Empty, Field, InfoRow, inputClass, labelClass, Modal, Panel, StatusBadge } from "./ui";

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

  const paid = paidOf(b);
  const due = dueOf(b);
  const phase = phaseOf(b, now);
  const closed = b.status === "cancelled";

  return (
    <div>
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Phones: money and the next action come first; wider screens put them in a side column. */}
        <aside className="md:sticky md:top-20 md:col-start-2 md:row-start-1">
          <section className={cn(cardClass, "space-y-3 p-4")}>
            {closed && (
              <p className="rounded-md bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
                Cancelled{b.cancelReason && <> — {b.cancelReason}</>}
              </p>
            )}
            <dl className="overflow-hidden rounded-md border border-neutral-200 text-sm">
              <div className="flex justify-between px-3 py-2.5">
                <dt className="text-neutral-600">Total</dt>
                <dd className="tabular-nums">{taka(b.total)}</dd>
              </div>
              <div className="flex justify-between border-t border-neutral-100 px-3 py-2.5">
                <dt className="text-neutral-600">Paid</dt>
                <dd className="tabular-nums text-emerald-700">{taka(paid)}</dd>
              </div>
              <div className={cn("flex items-center justify-between border-t px-3 py-3 font-semibold", due > 0 && !closed ? "border-rose-100 bg-rose-50 text-rose-800" : "border-emerald-100 bg-emerald-50 text-emerald-800")}>
                <dt>{closed ? "Nothing to collect" : due > 0 ? "Due" : "Fully paid"}</dt>
                <dd className="text-lg tabular-nums">{taka(closed ? 0 : due)}</dd>
              </div>
            </dl>
            {phase === "pending" && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setBookingStatus(b.id, "confirmed");
                    toast.success(`${b.code} confirmed`);
                  }}
                  className={abtn.primary}
                >
                  <BadgeCheck className="size-4" /> Confirm
                </button>
                <button onClick={() => setModal("cancel")} className={abtn.danger}>
                  <Ban className="size-4" /> Reject
                </button>
              </div>
            )}
            {/* Verify the online advance first; the rest is taken at the ground. */}
            {!closed && phase !== "pending" && due > 0 && (
              <button onClick={() => setModal("pay")} className={cn(abtn.primary, "w-full")}>
                <Wallet className="size-4" /> Collect {taka(due)}
              </button>
            )}
            {phase === "booked" && (
              <button onClick={() => setModal("cancel")} className={cn(abtn.danger, "w-full")}>
                <CalendarX className="size-4" /> Cancel booking
              </button>
            )}
            {closed && paid > 0 && (
              <button onClick={() => setModal("pay")} className={cn(abtn.outline, "w-full")}>
                <Wallet className="size-4" /> Refund {taka(paid)}
              </button>
            )}
            <BackButton />
          </section>
        </aside>

        <div className="min-w-0 space-y-4 md:col-start-1 md:row-start-1">
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
                <span className="font-mono font-semibold text-emerald-800">{b.code}</span>
              </InfoRow>
              <InfoRow icon={CircleDot} label="Status">
                <StatusBadge booking={b} />
              </InfoRow>
              <InfoRow icon={CalendarDays} label="Date">
                {dateLabel(b.date, { weekday: "short", day: "numeric", month: "short" })}
              </InfoRow>
              <InfoRow icon={Clock} label="Time">
                {rangeLabel(b.startHour, b.duration)} · {b.duration} hr{b.duration > 1 ? "s" : ""}
              </InfoRow>
              <InfoRow icon={Tag} label="Price">
                {taka(b.total)}
              </InfoRow>
              <InfoRow icon={ReceiptText} label="Source">
                {sourceLabels[b.source]}
              </InfoRow>
            </dl>
          </Panel>

          <Panel title="Customer" icon={User}>
            <dl>
              <InfoRow icon={User} label="Name">
                {b.customer.name}
              </InfoRow>
              {b.customer.phone && (
                <InfoRow icon={Phone} label="Phone">
                  <a href={`tel:${b.customer.phone}`} className="font-medium text-emerald-700 hover:underline">
                    {b.customer.phone}
                  </a>
                </InfoRow>
              )}
              {b.customer.email && (
                <InfoRow icon={Mail} label="Email">
                  <a href={`mailto:${b.customer.email}`} className="break-all font-medium text-emerald-700 hover:underline">
                    {b.customer.email}
                  </a>
                </InfoRow>
              )}
              {b.customer.team && (
                <InfoRow icon={Users} label="Team">
                  {b.customer.team}
                </InfoRow>
              )}
              {b.note && (
                <InfoRow icon={NotebookPen} label="Note">
                  {b.note}
                </InfoRow>
              )}
            </dl>
          </Panel>
        </div>
      </div>

      {modal === "pay" && <PaymentModal b={b} onClose={() => setModal(null)} />}
      {modal === "move" && <RescheduleModal b={b} onClose={() => setModal(null)} />}
      {modal === "cancel" && <CancelModal b={b} onClose={() => setModal(null)} />}
    </div>
  );
}

/** Back to the list the booking was opened from — Payments when it came from there, otherwise Bookings. */
function BackButton() {
  const from = useSearchParams().get("from");
  return (
    <Link href={`${ADMIN}/${from === "payments" ? "payments" : "bookings"}`} className={cn(abtn.outline, "w-full")}>
      <ArrowLeft className="size-4" /> Back
    </Link>
  );
}

function PaymentModal({ b, onClose }: { b: Booking; onClose: () => void }) {
  const db = useTurfDB();
  const router = useRouter();
  const due = dueOf(b);
  const paid = paidOf(b);
  const [kind, setKind] = useState<"balance" | "refund">(due > 0 ? "balance" : "refund");
  const [amount, setAmount] = useState(String(due || ""));
  const [method, setMethod] = useState<PayMethod>("cash");
  const [ref, setRef] = useState("");
  const [touched, setTouched] = useState(false);
  const n = Number(amount) || 0;
  const collect = kind === "balance";
  const wallet = method === "bkash" || method === "nagad";
  // Money coming in by wallet must carry the customer's transaction ID; a refund is the venue's own transfer.
  const refError =
    !collect || !wallet ? undefined : !ref ? "Enter the transaction ID from the SMS" : !TRX_ID.test(ref) ? "A transaction ID is 8–10 letters and numbers" : trxUsed(db, method, ref) ? "This transaction ID has already been used" : undefined;
  const close = () => {
    // Drop ?do=pay so a refresh doesn't reopen the form; keep ?from for the Back button.
    const q = new URLSearchParams(window.location.search);
    q.delete("do");
    router.replace(`${ADMIN}/bookings/${b.id}${q.size ? `?${q}` : ""}`, { scroll: false });
    onClose();
  };

  return (
    <Modal open onClose={close} title={collect ? "Collect payment" : "Refund"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (n <= 0) return toast.error("Enter an amount");
          if (!collect && n > paid) return toast.error("Refund is more than what was paid");
          if (refError) return;
          addPayment(b.id, n, method, kind, wallet ? ref : "");
          toast.success(collect ? `${taka(n)} received` : `${taka(n)} refunded`);
          close();
        }}
        className="space-y-4"
      >
        <div className="flex h-10 gap-1 rounded-xl bg-neutral-100 p-1">
          {(
            [
              ["balance", "Collect"],
              ["refund", "Refund"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setKind(v);
                setAmount(String(v === "balance" ? due || "" : ""));
              }}
              aria-pressed={kind === v}
              className={cn("flex-1 rounded-lg text-sm font-medium transition", kind === v ? "bg-emerald-800 text-white" : "text-neutral-600 hover:bg-white")}
            >
              {l}
            </button>
          ))}
        </div>

        <Field label="Amount (৳)" hint={collect ? `Due ${taka(due)}` : `Paid ${taka(paid)}`}>
          <input autoFocus inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} className={cn(inputClass, "h-12 text-base font-semibold tabular-nums")} />
        </Field>

        <div>
          <p className="mb-2 text-sm font-medium text-neutral-800">{collect ? "Pay with" : "Refund by"}</p>
          <MethodTiles
            methods={["cash", "bkash", "nagad", "card"] as PayMethod[]}
            value={method}
            onChange={(m) => {
              setMethod(m);
              setRef("");
            }}
          />
        </div>

        {wallet && collect && <WalletDetails venuePhone={db.settings.phone} amount={n} amountLabel={taka(n)} />}
        {wallet && (
          <TrxIdField
            id="pm-ref"
            method={method}
            value={ref}
            onChange={setRef}
            error={touched ? refError : undefined}
            inputClassName={inputClass}
            labelClassName={labelClass}
          />
        )}

        <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 pt-4">
          <button type="button" onClick={close} className={abtn.outline}>
            Cancel
          </button>
          <button className={collect ? abtn.primary : cn(abtn.primary, "bg-violet-700 hover:bg-violet-800")}>{collect ? `Collect ${n ? taka(n) : ""}` : `Refund ${n ? taka(n) : ""}`}</button>
        </div>
      </form>
    </Modal>
  );
}

function RescheduleModal({ b, onClose }: { b: Booking; onClose: () => void }) {
  const db = useTurfDB();
  const now = useNow(15_000);
  const [date, setDate] = useState(b.date);
  const [start, setStart] = useState<number | null>(b.startHour);
  const [duration, setDuration] = useState(b.duration);
  const req = start !== null ? { courtId: b.courtId, date, startHour: start, duration } : null;
  const conflict = req ? findConflict(db, req, { ignoreBookingId: b.id, now }) : null;
  const unchanged = date === b.date && start === b.startHour && duration === b.duration;
  const slot = (d: string, h: number, n: number) => `${dateLabel(d, { weekday: "short", day: "numeric", month: "short" })} · ${rangeLabel(h, n)}`;

  return (
    <Modal open onClose={onClose} title="Reschedule booking">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-[13px] sm:text-sm">
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
            <p className="text-xs text-neutral-500">Now</p>
            <p className="font-medium text-neutral-900">{slot(b.date, b.startHour, b.duration)}</p>
          </div>
          <div className={cn("rounded-md border px-3 py-2", !unchanged && req && !conflict ? "border-emerald-300 bg-emerald-50" : "border-neutral-200")}>
            <p className="text-xs text-neutral-500">New</p>
            <p className="font-medium text-neutral-900">{start !== null ? slot(date, start, duration) : "Pick a time"}</p>
          </div>
        </div>

        <SlotPicker
          date={date}
          start={start}
          duration={duration}
          onDate={(d) => {
            setDate(d);
            setStart(d === b.date ? b.startHour : null);
          }}
          onStart={setStart}
          onDuration={setDuration}
          conflict={conflict}
          bookingId={b.id}
        />

        <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 pt-4">
          <button onClick={onClose} className={abtn.outline}>
            Cancel
          </button>
          <button
            disabled={!req || unchanged || !!conflict}
            onClick={() => {
              if (!req) return;
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
