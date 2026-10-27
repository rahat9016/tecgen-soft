"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
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
  Undo2,
  Users,
  Wallet,
} from "lucide-react";
import { dateLabel, rangeLabel, sourceLabels, taka } from "@/src/lib/turf-store/format";
import {
  addPayment,
  cancelBooking,
  creditOf,
  dueOf,
  freeToCancel,
  findConflict,
  paidOf,
  phaseOf,
  refundState,
  rescheduleBooking,
  trxUsed,
  useNow,
  useTurfDB,
} from "@/src/lib/turf-store/store";
import type { Booking, PayMethod } from "@/src/lib/turf-store/types";
import { useT } from "@/src/lib/turf-store/i18n";
import { cn } from "@/src/lib/utils";
import { AmountChoice, CopyRow, MethodTiles, TRX_ID, TrxIdField, WalletDetails } from "../pay";
import SlotPicker from "./SlotPicker";
import { abtn, ADMIN, cardClass, Empty, Field, InfoRow, inputClass, labelClass, Modal, Panel, StatusBadge } from "./ui";

export default function BookingDetail({ id }: { id: string }) {
  const t = useT();
  const db = useTurfDB();
  const now = useNow(30_000);
  const params = useSearchParams();
  const [modal, setModal] = useState<"pay" | "refund" | "move" | "cancel" | null>(() => {
    const d = params.get("do");
    return d === "pay" || d === "refund" ? d : null;
  });
  const b = db.bookings.find((x) => x.id === id);

  if (!b)
    return (
      <div className={cardClass}>
        <Empty icon={ReceiptText} title="Booking not found" text="It may have been removed when the demo data was reset.">
          <Link href={`${ADMIN}/bookings`} className={cn(abtn.outline, "mt-2")}>
            {t("Back to bookings")}
          </Link>
        </Empty>
      </div>
    );

  const paid = paidOf(b);
  const due = dueOf(b);
  const phase = phaseOf(b, now);
  const closed = b.status === "cancelled";
  const credit = creditOf(b, now);
  const refund = refundState(b, now);
  const refundRow = {
    owed: { label: "To refund", tone: "border-violet-100 bg-violet-50 text-violet-800" },
    refunded: { label: "Refunded", tone: "border-emerald-100 bg-emerald-50 text-emerald-800" },
    kept: { label: "Kept · no refund", tone: "border-neutral-100 bg-neutral-50 text-neutral-700" },
    none: { label: "Nothing paid", tone: "border-neutral-100 bg-neutral-50 text-neutral-700" },
  }[refund.kind];

  return (
    <div>
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Phones: money and the next action come first; wider screens put them in a side column. */}
        <aside className="md:sticky md:top-20 md:col-start-2 md:row-start-1">
          <section className={cn(cardClass, "space-y-3 p-4")}>
            {closed && (
              <p className="rounded-md bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
                {t("Cancelled")}
                {b.cancelReason && <> — {b.cancelReason}</>}
              </p>
            )}
            <dl className="overflow-hidden rounded-md border border-neutral-200 text-sm">
              <div className="flex justify-between px-3 py-2.5">
                <dt className="text-neutral-600">{t("Total")}</dt>
                <dd className="tabular-nums">{taka(b.total)}</dd>
              </div>
              <div className="flex justify-between border-t border-neutral-100 px-3 py-2.5">
                <dt className="text-neutral-600">{t("Paid")}</dt>
                <dd className="tabular-nums text-emerald-700">{taka(paid)}</dd>
              </div>
              {closed ? (
                <div className={cn("flex items-center justify-between border-t px-3 py-3 font-semibold", refundRow.tone)}>
                  <dt>{t(refundRow.label)}</dt>
                  <dd className="text-lg tabular-nums">{taka(refund.amount)}</dd>
                </div>
              ) : (
                <>
                  <div className={cn("flex items-center justify-between border-t px-3 py-3 font-semibold", due > 0 ? "border-rose-100 bg-rose-50 text-rose-800" : "border-emerald-100 bg-emerald-50 text-emerald-800")}>
                    <dt>{due > 0 ? t("Due") : t("Fully paid")}</dt>
                    <dd className="text-lg tabular-nums">{taka(due)}</dd>
                  </div>
                  {/* Paid more than the price (e.g. a shorter game after rescheduling). */}
                  {credit > 0 && (
                    <div className="flex items-center justify-between border-t border-violet-100 bg-violet-50 px-3 py-3 font-semibold text-violet-800">
                      <dt>{t("To refund")}</dt>
                      <dd className="text-lg tabular-nums">{taka(credit)}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>
            {/* The rest of the money is taken at the ground. */}
            {!closed && due > 0 && (
              <button onClick={() => setModal("pay")} className={cn(abtn.primary, "w-full")}>
                <Wallet className="size-4" /> {t("Collect {amount}", { amount: taka(due) })}
              </button>
            )}
            {phase === "booked" && (
              <button onClick={() => setModal("cancel")} className={cn(abtn.danger, "w-full")}>
                <CalendarX className="size-4" /> {t("Cancel booking")}
              </button>
            )}
            {credit > 0 && (
              <button onClick={() => setModal("refund")} className={cn(abtn.primary, "w-full bg-violet-700 hover:bg-violet-800")}>
                <Undo2 className="size-4" /> {t("Refund {amount}", { amount: taka(credit) })}
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
              phase === "booked" && (
                <button onClick={() => setModal("move")} className={abtn.small}>
                  <CalendarClock className="size-3.5" /> {t("Reschedule")}
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
                {rangeLabel(b.startHour, b.duration)} · {t(b.duration > 1 ? "{n} hrs" : "{n} hr", { n: b.duration })}
              </InfoRow>
              <InfoRow icon={Tag} label="Price">
                {taka(b.total)}
              </InfoRow>
              <InfoRow icon={ReceiptText} label="Source">
                {t(sourceLabels[b.source])}
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

      {(modal === "pay" || modal === "refund") && <PaymentModal b={b} refund={modal === "refund"} onClose={() => setModal(null)} />}
      {modal === "move" && <RescheduleModal b={b} onClose={() => setModal(null)} />}
      {modal === "cancel" && <CancelModal b={b} onClose={() => setModal(null)} />}
    </div>
  );
}

/** Back to the list the booking was opened from — Payments when it came from there, otherwise Bookings. */
function BackButton() {
  const t = useT();
  const from = useSearchParams().get("from");
  return (
    <Link href={`${ADMIN}/${from === "payments" ? "payments" : "bookings"}`} className={cn(abtn.outline, "w-full")}>
      <ArrowLeft className="size-4" /> {t("Back")}
    </Link>
  );
}

/** Collect the balance, or (with `refund`) send money back — same layout as the booking site's payment step. */
function PaymentModal({ b, refund, onClose }: { b: Booking; refund?: boolean; onClose: () => void }) {
  const t = useT();
  const db = useTurfDB();
  const router = useRouter();
  const now = useNow(30_000);
  const due = dueOf(b);
  const credit = creditOf(b, now);
  const limit = refund ? credit : Infinity;
  const [amount, setAmount] = useState(String((refund ? credit : due) || ""));
  const [method, setMethod] = useState<PayMethod>("cash");
  const [ref, setRef] = useState("");
  const [touched, setTouched] = useState(false);
  const n = Number(amount) || 0;
  const wallet = method === "bkash" || method === "nagad";
  // Money coming in by wallet must carry the customer's transaction ID; a refund's ID is optional (it's the venue's own transfer).
  const refError =
    refund || !wallet
      ? undefined
      : !ref
        ? t("Enter the transaction ID from the SMS")
        : !TRX_ID.test(ref)
          ? t("A transaction ID is 8–10 letters and numbers")
          : trxUsed(db, method, ref)
            ? t("This transaction ID has already been used")
            : undefined;
  const close = () => {
    // Drop ?do=… so a refresh doesn't reopen the form; keep ?from for the Back button.
    const q = new URLSearchParams(window.location.search);
    q.delete("do");
    router.replace(`${ADMIN}/bookings/${b.id}${q.size ? `?${q}` : ""}`, { scroll: false });
    onClose();
  };

  return (
    <Modal open onClose={close} title={refund ? t("Refund") : t("Collect payment")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (n <= 0) return toast.error(t("Enter an amount"));
          if (n > limit) return toast.error(t("At most {amount} can be refunded", { amount: taka(limit) }));
          if (refError) return;
          addPayment(b.id, n, method, refund ? "refund" : "balance", wallet ? ref : "");
          toast.success(refund ? t("{amount} refunded to {name}", { amount: taka(n), name: b.customer.name }) : t("{amount} received", { amount: taka(n) }));
          close();
        }}
        className="space-y-4"
      >
        <Field label="Amount (৳)" hint={refund ? t("Owed back {amount}", { amount: taka(credit) }) : t("Due {amount}", { amount: taka(due) })}>
          <input autoFocus inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} className={cn(inputClass, "h-12 text-base font-semibold tabular-nums")} />
        </Field>

        <div>
          <p className="mb-2 text-sm font-medium text-neutral-800">{refund ? t("Refund by") : t("Pay with")}</p>
          <MethodTiles
            t={t}
            methods={(refund ? ["cash", "bkash", "nagad"] : ["cash", "bkash", "nagad", "card"]) as PayMethod[]}
            value={method}
            onChange={(m) => {
              setMethod(m);
              setRef("");
            }}
          />
        </div>

        {wallet &&
          (refund ? (
            <dl className="divide-y divide-neutral-200/70 rounded-lg bg-neutral-50 px-4 text-sm">
              <CopyRow label={t("Send Money to")} value={b.customer.phone || "—"} copy={b.customer.phone} />
              <CopyRow label={t("Amount")} value={taka(n)} copy={String(n)} />
            </dl>
          ) : (
            <WalletDetails t={t} venuePhone={db.settings.phone} amount={n} amountLabel={taka(n)} />
          ))}
        {wallet && (
          <TrxIdField
            t={t}
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
            {t("Cancel")}
          </button>
          <button className={refund ? cn(abtn.primary, "bg-violet-700 hover:bg-violet-800") : abtn.primary}>
            {refund ? t("Refund") : t("Collect")} {n ? taka(n) : ""}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RescheduleModal({ b, onClose }: { b: Booking; onClose: () => void }) {
  const t = useT();
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
    <Modal open onClose={onClose} title={t("Reschedule booking")}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-[13px] sm:text-sm">
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
            <p className="text-xs text-neutral-500">{t("Now")}</p>
            <p className="font-medium text-neutral-900">{slot(b.date, b.startHour, b.duration)}</p>
          </div>
          <div className={cn("rounded-md border px-3 py-2", !unchanged && req && !conflict ? "border-emerald-300 bg-emerald-50" : "border-neutral-200")}>
            <p className="text-xs text-neutral-500">{t("New")}</p>
            <p className="font-medium text-neutral-900">{start !== null ? slot(date, start, duration) : t("Pick a time")}</p>
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
            {t("Cancel")}
          </button>
          <button
            disabled={!req || unchanged || !!conflict}
            onClick={() => {
              if (!req) return;
              const r = rescheduleBooking(b.id, req);
              if (!r.ok) return toast.error(t(r.error));
              toast.success(t("{code} moved", { code: b.code }));
              onClose();
            }}
            className={abtn.primary}
          >
            {t("Move booking")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

type MoneyChoice = "now" | "later" | "keep";

/** Cancel with a reason, and decide on the money already paid: refund it now, owe it, or keep it. */
function CancelModal({ b, onClose }: { b: Booking; onClose: () => void }) {
  const t = useT();
  const db = useTurfDB();
  const now = useNow(60_000);
  const paid = paidOf(b);
  const hours = db.settings.cancelCutoffHours;
  const free = freeToCancel(b, db.settings, now);
  const [reason, setReason] = useState("");
  // Inside the free-cancellation window (Settings) the customer gets the money back; later than that the venue keeps it by default.
  const [money, setMoney] = useState<MoneyChoice>(free ? "now" : "keep");
  const [method, setMethod] = useState<PayMethod>("cash");
  const [ref, setRef] = useState("");
  const wallet = method === "bkash" || method === "nagad";
  const refundNow = paid > 0 && money === "now";

  return (
    <Modal open onClose={onClose} title={t("Cancel {code}", { code: b.code })}>
      <div className="space-y-4">
        <Field label="Reason" hint="Shown to the customer under My Bookings">
          <input autoFocus value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} placeholder={t("e.g. Rain, ground closed")} />
        </Field>

        {paid > 0 && (
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-neutral-800">{taka(paid)} paid</p>
              <p className={cn("text-xs font-medium", free ? "text-emerald-700" : "text-rose-700")}>{free ? t("Free cancellation (over {n} hrs before)", { n: hours }) : t("Late cancellation (under {n} hrs before)", { n: hours })}</p>
            </div>
            <AmountChoice
              className="sm:grid-cols-1"
              options={[
                { v: "now" as MoneyChoice, t: t("Refund now"), a: taka(paid) },
                { v: "later" as MoneyChoice, t: t("Refund later (before kick-off)"), a: taka(paid) },
                { v: "keep" as MoneyChoice, t: t("Keep the money"), a: t("No refund") },
              ]}
              value={money}
              onChange={setMoney}
            />
          </div>
        )}

        {refundNow && (
          <>
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">{t("Refund by")}</p>
              <MethodTiles
            t={t}
                methods={["cash", "bkash", "nagad"] as PayMethod[]}
                value={method}
                onChange={(m) => {
                  setMethod(m);
                  setRef("");
                }}
              />
            </div>
            {wallet && (
              <>
                <dl className="divide-y divide-neutral-200/70 rounded-lg bg-neutral-50 px-4 text-sm">
                  <CopyRow label={t("Send Money to")} value={b.customer.phone || "—"} copy={b.customer.phone} />
                  <CopyRow label={t("Amount")} value={taka(paid)} copy={String(paid)} />
                </dl>
                <TrxIdField t={t} id="cm-ref" method={method} value={ref} onChange={setRef} inputClassName={inputClass} labelClassName={labelClass} />
              </>
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 pt-4">
          <button onClick={onClose} className={abtn.outline}>
            {t("Keep booking")}
          </button>
          <button
            onClick={() => {
              cancelBooking(b.id, reason.trim() || undefined, paid > 0 && money === "keep");
              if (refundNow) addPayment(b.id, paid, method, "refund", wallet ? ref : "");
              toast.success(refundNow ? t("{code} cancelled · {amount} refunded", { code: b.code, amount: taka(paid) }) : t("{code} cancelled", { code: b.code }));
              onClose();
            }}
            className={cn(abtn.primary, "bg-rose-600 hover:bg-rose-700")}
          >
            {refundNow ? t("Cancel & refund {amount}", { amount: taka(paid) }) : t("Cancel booking")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
