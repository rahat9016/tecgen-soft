"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Ban,
  BedDouble,
  CalendarCog,
  CalendarPlus,
  Check,
  Clock3,
  Globe2,
  Hash,
  IdCard,
  LogIn,
  LogOut,
  Mail,
  Moon,
  Phone,
  Plane,
  Plus,
  Printer,
  Receipt,
  SearchX,
  StickyNote,
  Tag,
  Trash2,
  Undo2,
  UserRound,
  Users,
  UserX,
  Wallet,
} from "lucide-react";
import { can } from "@/src/lib/hotel-store/auth";
import { chargeLabels, dateLabel, formatDateTime, hotelDayOf, hotelTime, payLabels, paymentKindLabels, sourceLabels, taka, todayKey } from "@/src/lib/hotel-store/format";
import { checkInBlockers, isArrival } from "@/src/lib/hotel-store/frontDesk";
import {
  cancellationTerms,
  confirmBooking,
  creditOf,
  dueOf,
  folioTotal,
  groupOf,
  isLive,
  markNoShow,
  paidOf,
  refundedOf,
  removeCharge,
  setInternalNote,
  unitNumbers,
  useCurrentStaff,
  useHotelDB,
  voidPayment,
} from "@/src/lib/hotel-store/store";
import type { Booking, HotelDB, PaymentKind } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import PrintableInvoice, { invoiceNumber, printWithTitle } from "@/src/components/hotel/Booking/PrintableInvoice";
import { CancelModal, CancelRoomModal, cancellableRooms, ChangeStayModal, ChargeModal, CheckInModal, CheckoutModal, GuestModal, PaymentModal, RoomsModal } from "./BookingModals";
import ExtendStayModal from "./ExtendStayModal";
import { ADMIN, Card, Empty, hbtn, textareaClass } from "./ui";

export default function BookingDetail({ id }: { id: string }) {
  const db = useHotelDB();
  const staff = useCurrentStaff();
  // The bookings list links here with ?do=… to open the matching dialog straight away, and ?from=… to come back to.
  const params = useSearchParams();
  const action = params.get("do");
  const from = params.get("from");
  const back = from?.startsWith(`${ADMIN}/`) ? from : `${ADMIN}/bookings`;
  const [payKind, setPayKind] = useState<PaymentKind | null>(action === "pay" ? "payment" : null);
  const [rooms, setRooms] = useState<"assign" | null>(null);
  // Assigning a room from the check-in checklist brings the checklist back afterwards.
  const [resumeCheckIn, setResumeCheckIn] = useState(false);
  const [modal, setModal] = useState<"charge" | "stay" | "extend" | "cancel" | "cancelRoom" | "checkout" | "checkin" | "guest" | null>(
    action === "checkout" ? "checkout" : action === "checkin" ? "checkin" : null
  );
  const b = db.bookings.find((x) => x.id === id) ?? db.bookings.find((x) => x.code === id);
  const [note, setNote] = useState<string | null>(null);

  if (!b) {
    return (
      <Card>
        <Empty icon={SearchX} title="Booking not found" text="It may have been removed when the demo data was reset.">
          <Link href={`${ADMIN}/bookings`} className={hbtn.outline}>
            Back to bookings
          </Link>
        </Empty>
      </Card>
    );
  }

  const role = staff?.role;
  const today = todayKey();
  const user = db.users.find((u) => u.id === b.userId);
  const linked = groupOf(db, b);
  const otherStays = user ? db.bookings.filter((x) => x.userId === user.id && x.id !== b.id) : [];
  const unitList = unitNumbers(db, b.unitIds);
  const due = dueOf(b);
  const credit = creditOf(b);
  const paid = paidOf(b);
  const total = folioTotal(b);
  const live = isLive(b);
  const upcoming = b.status === "pending" || b.status === "confirmed";
  const terms = cancellationTerms(db, b);
  const canRefund = can(role, "payments.refund");
  const canVoid = can(role, "payments.void");

  const startCheckIn = () => setModal("checkin");

  const actions = (
    <div className="flex flex-wrap gap-2">
      {b.status === "pending" && (
        <button
          onClick={() => {
            const r = confirmBooking(b.id);
            if (r.ok) toast.success(`${b.code} confirmed — the guest is notified`);
            else toast.error(r.error);
          }}
          className={hbtn.primary}
        >
          <BadgeCheck className="size-4" /> Confirm booking
        </button>
      )}
      {upcoming && b.checkIn <= today && b.checkOut > today && (
        <button onClick={startCheckIn} className={hbtn.success}>
          <LogIn className="size-4" /> Check in
        </button>
      )}
      {b.status === "checked-in" && (
        <button onClick={() => setModal("checkout")} className={hbtn.success}>
          <LogOut className="size-4" /> Check out
        </button>
      )}
      {credit > 0 && canRefund && (
        <button onClick={() => setPayKind("refund")} className={cn(hbtn.outline, "border-violet-200 text-violet-700")}>
          <Undo2 className="size-4" /> Refund {taka(credit)}
        </button>
      )}
      {(upcoming || b.status === "checked-in") && (
        <button onClick={() => setModal("stay")} className={hbtn.outline}>
          <CalendarCog className="size-4" /> {b.status === "checked-in" ? "Extend stay" : "Change stay"}
        </button>
      )}
      {upcoming && (
        <button onClick={() => setModal("extend")} className={hbtn.outline}>
          <CalendarPlus className="size-4" /> Extend stay
        </button>
      )}
      <button onClick={() => printWithTitle(`${invoiceNumber(b.code)} - ${db.content.hotel.name}`)} className={hbtn.outline}>
        <Printer className="size-4" /> {b.status === "checked-in" ? "Interim bill" : "Invoice"}
      </button>
      {upcoming && b.checkIn <= today && (
        <button
          onClick={() => {
            if (!confirm(`Mark ${b.guest.name} as a no-show? The policy fee is kept and the room is released.`)) return;
            const r = markNoShow(b.id);
            if (r.ok) toast.success("Marked as no-show");
            else toast.error(r.error);
          }}
          className={hbtn.outline}
        >
          <UserX className="size-4" /> No-show
        </button>
      )}
      {upcoming && (
        <button onClick={() => setModal("cancel")} className={hbtn.danger}>
          <Ban className="size-4" /> Cancel
        </button>
      )}
    </div>
  );

  const at = (iso: string) => `${dateLabel(hotelDayOf(iso), "dd MMM")}, ${hotelTime(iso)}`;
  const missing = b.rooms - unitList.length;
  const stayRows: InfoRow[] = [
    { icon: Hash, label: "Booking", value: <span className="font-mono">{b.code}</span> },
    {
      icon: BedDouble,
      label: b.rooms + linked.reduce((s, x) => s + x.rooms, 0) > 1 ? "Rooms" : "Room",
      // Rooms of other types picked at the same time live on linked bookings with their own bill; they're listed here too.
      value: (
        <ul className="space-y-1.5">
          {[b, ...linked].map((x) => {
            const nums = x.id === b.id ? unitList : unitNumbers(db, x.unitIds);
            const gap = x.id === b.id ? missing : x.rooms - nums.length;
            return (
              <li key={x.id}>
                {nums.length > 0 && <b className="text-base text-neutral-900">{nums.join(", ")}</b>}
                <span className="text-neutral-600">
                  {nums.length ? " · " : ""}
                  {x.roomName}
                  {x.rooms > 1 ? ` ×${x.rooms}` : ""}
                </span>
                {x.id !== b.id && (
                  <Link href={`${ADMIN}/bookings/${x.id}`} title="Open its bill" className="ml-1.5 rounded-sm font-mono text-xs text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
                    {x.code}
                  </Link>
                )}
                {gap > 0 && <span className="block text-xs font-medium text-rose-700">{gap === x.rooms ? "Not assigned yet" : `${gap} not assigned yet`}</span>}
              </li>
            );
          })}
        </ul>
      ),
    },
    {
      icon: LogIn,
      label: "Check-in",
      value: (
        <>
          {dateLabel(b.checkIn, "EEE, dd MMM yyyy")}
          <span className="block text-xs font-normal text-neutral-500">{b.checkedInAt ? `Arrived ${at(b.checkedInAt)}` : `From ${db.settings.checkInTime}`}</span>
        </>
      ),
    },
    {
      icon: LogOut,
      label: "Check-out",
      value: (
        <>
          {dateLabel(b.checkOut, "EEE, dd MMM yyyy")}
          <span className="block text-xs font-normal text-neutral-500">{b.checkedOutAt ? `Left ${at(b.checkedOutAt)}` : `Until ${db.settings.checkOutTime}`}</span>
        </>
      ),
    },
    { icon: Moon, label: "Nights", value: `${b.nights} night${b.nights > 1 ? "s" : ""}` },
    { icon: Users, label: "Guests", value: `${b.adults} adult${b.adults > 1 ? "s" : ""}${b.children ? `, ${b.children} child${b.children > 1 ? "ren" : ""}` : ""}` },
    { icon: Tag, label: "Rate", value: `${taka(b.pricePerNight)} / ${b.rooms > 1 ? "room / " : ""}night` },
    ...(b.guest.note
      ? [
          {
            icon: StickyNote,
            label: "Request",
            value: (
              <>
                {b.guest.note}
                <span className="block text-xs font-normal text-neutral-500">Guest request — not guaranteed</span>
              </>
            ),
          },
        ]
      : []),
  ];

  const guestRows: InfoRow[] = [
    { icon: UserRound, label: "Name", value: b.guest.name },
    { icon: Phone, label: "Phone", value: b.guest.phone, href: `tel:${b.guest.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: b.guest.email || "—", href: b.guest.email ? `mailto:${b.guest.email}` : undefined },
    { icon: Globe2, label: "Country", value: b.guest.country || "—" },
    { icon: IdCard, label: b.guest.idType === "passport" ? "Passport" : "NID", value: b.guest.idNumber || "Not given" },
    { icon: Clock3, label: "Arrival", value: b.guest.arrivalTime || "Not given" },
    { icon: Plane, label: "Airport pickup", value: b.guest.airportPickup ? "Requested" : "No" },
  ];

  return (
    <>
      <PrintableInvoice booking={b} db={db} />
      <div className="space-y-6 print:hidden">
        <div>
          {/* Status, payment, room and dates are on the steps and cards below. */}
          <h1 className="sr-only">Booking {b.code}</h1>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href={back} className={hbtn.outline}>
              <ArrowLeft className="size-4" /> Bookings
            </Link>
            {actions}
          </div>
          {b.commission && (
            <div>
              <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 rounded-md bg-violet-50 px-2.5 py-1 text-xs text-violet-800">
                Commission <b className="tabular-nums">{taka(b.commission.amount)}</b>
                {b.commission.kind === "percent" && ` (${b.commission.value}%)`} to {b.commission.name}
                <span className="text-violet-600">· {b.commission.to === "agency" ? "Agency" : "Person"}</span>
                {b.commission.phone && <span className="text-violet-600">· {b.commission.phone}</span>}
              </p>
            </div>
          )}
          <ProcessSteps db={db} b={b} />
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
                    <BedDouble className="size-4 text-sky-600" /> Stay
                  </h2>
                  <div className="flex gap-2">
                    {/* Only while another room would be left — cancelling the last one is cancelling the booking. */}
                    {cancellableRooms(db, b).length > 1 && (
                      <button onClick={() => setModal("cancelRoom")} className={cn(hbtn.small, "text-rose-600 hover:border-rose-300 hover:text-rose-700")}>
                        Cancel a room
                      </button>
                    )}
                    {(upcoming || b.status === "checked-in") && (
                      <button onClick={() => setRooms("assign")} className={hbtn.small}>
                        {b.status === "checked-in" ? "Move room" : unitList.length ? "Change rooms" : "Assign rooms"}
                      </button>
                    )}
                  </div>
                </div>
                <InfoTable rows={stayRows} />
                {b.status === "checked-in" && b.checkOut < today && (
                  <p className="mt-3 rounded-md bg-rose-50 p-3 text-sm text-rose-700">Past check-out date — extend the stay or check the guest out.</p>
                )}
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
                    <UserRound className="size-4 text-sky-600" /> Guest
                  </h2>
                  <button onClick={() => setModal("guest")} className={hbtn.small}>
                    Edit
                  </button>
                </div>
                <InfoTable rows={guestRows} />
                {user && (
                  <div className="mt-4 rounded-md bg-neutral-50 p-3 text-xs text-neutral-600">
                    <p>
                      {user.passwordHash ? "Registered guest account" : "Guest profile (no login)"} · {otherStays.length} other booking{otherStays.length === 1 ? "" : "s"}
                    </p>
                    {user.note && <p className="mt-1 font-medium text-neutral-800">Note: {user.note}</p>}
                    <Link href={`${ADMIN}/users?guest=${user.id}`} className="mt-1 inline-block font-semibold text-sky-700 hover:underline">
                      Open guest profile
                    </Link>
                  </div>
                )}
              </Card>
            </div>

            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
                  <Receipt className="size-4 text-sky-600" /> Folio
                </h2>
                {live && (
                  <div className="flex gap-2">
                    <button onClick={() => setModal("charge")} className={hbtn.small}>
                      <Plus className="size-3.5" /> Charge / discount
                    </button>
                    {due > 0 && (
                      <button onClick={() => setPayKind("payment")} className={cn(hbtn.small, "border-emerald-200 text-emerald-700")}>
                        <Wallet className="size-3.5" /> Payment
                      </button>
                    )}
                  </div>
                )}
              </div>

              <FolioHeading>Stay</FolioHeading>
              <ul className="divide-y divide-neutral-100">
                <FolioLine
                  label="Room charge"
                  detail={`${b.roomName} · ${taka(b.pricePerNight)} × ${b.nights} night${b.nights > 1 ? "s" : ""}${b.rooms > 1 ? ` × ${b.rooms} rooms` : ""}`}
                  amount={b.subtotal}
                />
                {b.discount && (
                  <FolioLine
                    label={`Discount${b.discount.kind === "percent" ? ` (${b.discount.value}%)` : ""}`}
                    detail={[b.discount.reason, b.discount.by].filter(Boolean).join(" · ")}
                    amount={-b.discount.amount}
                  />
                )}
                <FolioLine label={`Service charge (${db.settings.serviceFeeRate}%)`} amount={b.serviceFee} quiet />
                <FolioLine label={`VAT (${db.settings.vatRate}%)`} amount={b.tax} quiet />
              </ul>

              {b.charges.length > 0 && (
                <>
                  <FolioHeading>Extras</FolioHeading>
                  <ul className="divide-y divide-neutral-100">
                    {b.charges.map((c) => (
                      <FolioLine
                        key={c.id}
                        label={c.description}
                        detail={
                          <>
                            {chargeLabels[c.category]} · {format(new Date(c.at), "dd MMM, h:mm a")} · {c.by}
                            {live && (
                              <button
                                onClick={() => {
                                  if (!confirm(`Remove "${c.description}"?`)) return;
                                  const r = removeCharge(b.id, c.id);
                                  if (!r.ok) toast.error(r.error);
                                }}
                                aria-label={`Remove ${c.description}`}
                                className="ml-2 inline-flex items-center gap-1 whitespace-nowrap rounded-sm font-medium text-neutral-500 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                              >
                                <Trash2 className="size-3" aria-hidden /> Remove
                              </button>
                            )}
                          </>
                        }
                        amount={c.amount}
                      />
                    ))}
                  </ul>
                </>
              )}

              <dl className="mt-3 space-y-1.5 rounded-lg bg-neutral-50 px-4 py-3 text-sm">
                {b.charges.length > 0 && (
                  <>
                    <div className="flex justify-between text-neutral-600">
                      <dt>Stay</dt>
                      <dd className="tabular-nums">{taka(b.total)}</dd>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <dt>Extras</dt>
                      <dd className="tabular-nums">{taka(total - b.total)}</dd>
                    </div>
                  </>
                )}
                <div className={cn("flex items-baseline justify-between", b.charges.length > 0 && "border-t border-neutral-200 pt-2")}>
                  <dt className="font-semibold text-neutral-900">Total</dt>
                  <dd className="text-lg font-bold tabular-nums text-neutral-900">{taka(total)}</dd>
                </div>
              </dl>

              <div className="mt-6 flex items-baseline justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Payments</h3>
                {b.payments.length > 0 && <span className="text-xs text-neutral-500">{taka(paid)} received</span>}
              </div>
              {b.payments.length === 0 ? (
                <p className="mt-2 rounded-md border border-dashed border-neutral-200 px-3 py-4 text-center text-sm text-neutral-500">No payments yet.</p>
              ) : (
                <ul className="mt-1 divide-y divide-neutral-100">
                  {b.payments.map((p) => {
                    const refund = p.kind === "refund";
                    return (
                      <li key={p.id} className="flex items-start gap-3 py-3">
                        <span
                          aria-hidden
                          className={cn(
                            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                            p.void ? "bg-neutral-100 text-neutral-400" : refund ? "bg-violet-50 text-violet-600" : "bg-emerald-50 text-emerald-600"
                          )}
                        >
                          {refund ? <Undo2 className="size-4" /> : <Wallet className="size-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className={cn("text-sm font-medium", p.void ? "text-neutral-500 line-through" : "text-neutral-900")}>{payLabels[p.method]}</span>
                            <span
                              className={cn(
                                "rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                                refund ? "bg-violet-50 text-violet-700" : p.kind === "deposit" ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700"
                              )}
                            >
                              {paymentKindLabels[p.kind]}
                            </span>
                            {p.void && <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold text-rose-700">Voided</span>}
                          </p>
                          {p.ref && <p className="mt-0.5 truncate font-mono text-xs text-neutral-600">{p.ref}</p>}
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {formatDateTime(p.at)} · {p.by}
                            {p.note ? ` · ${p.note}` : ""}
                          </p>
                          {p.void && (
                            <p className="mt-0.5 text-xs text-rose-700">
                              Voided by {p.void.by}: {p.void.reason}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className={cn("text-sm font-semibold tabular-nums", p.void ? "text-neutral-400 line-through" : refund ? "text-violet-700" : "text-neutral-900")}>
                            {refund ? "−" : ""}
                            {taka(p.amount)}
                          </span>
                          {!p.void && canVoid && (
                            <button
                              onClick={() => {
                                const reason = prompt(`Void ${taka(p.amount)} ${p.kind}? It stays on the folio for the audit trail.\n\nReason:`);
                                if (!reason) return;
                                const r = voidPayment(b.id, p.id, reason);
                                if (r.ok) toast.success("Payment voided");
                                else toast.error(r.error);
                              }}
                              className="-mr-1.5 rounded px-1.5 py-0.5 text-xs font-medium text-neutral-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                            >
                              Void
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <p className="text-sm text-neutral-500">{credit > 0 ? "Refund due to guest" : due > 0 ? "Balance due" : "Balance"}</p>
              <p className={cn("mt-1 text-3xl font-bold tabular-nums", credit > 0 ? "text-violet-700" : due > 0 ? "text-rose-600" : "text-emerald-600")}>
                {taka(credit > 0 ? credit : due)}
              </p>
              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Folio total</dt>
                  <dd className="tabular-nums">{taka(total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Paid (net)</dt>
                  <dd className="tabular-nums">{taka(paid)}</dd>
                </div>
                {!live && (
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Cancellation fee kept</dt>
                    <dd className="tabular-nums">{taka(b.cancellationFee ?? 0)}</dd>
                  </div>
                )}
              </dl>
              <PaymentState b={b} />
              {live && due > 0 && (
                <button onClick={() => setPayKind("payment")} className={cn(hbtn.primary, "mt-4 h-11 w-full text-base")}>
                  <Wallet className="size-4" /> Collect payment
                </button>
              )}
              {upcoming && (
                <p className={cn("mt-4 rounded-md p-3 text-xs", terms.free ? "bg-emerald-50 text-emerald-800" : "bg-neutral-100 text-neutral-700")}>
                  {terms.free ? `Free cancellation until ${format(new Date(terms.freeUntil), "dd MMM, h:mm a")}.` : `Late cancellation — policy keeps ${taka(terms.fee)}.`}
                </p>
              )}
              {!live && b.cancelReason && <p className="mt-4 rounded-md bg-neutral-50 p-3 text-xs text-neutral-600">Reason: {b.cancelReason}</p>}
            </Card>

            <Card>
              <h2 className="font-semibold text-neutral-900">Staff note</h2>
              <p className="text-xs text-neutral-500">Only visible to staff.</p>
              <textarea
                value={note ?? b.internalNote ?? ""}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => {
                  if (note === null || note === (b.internalNote ?? "")) return;
                  setInternalNote(b.id, note);
                  toast.success("Note saved");
                }}
                rows={3}
                placeholder="e.g. VIP — upgrade if possible"
                className={cn(textareaClass, "mt-3")}
              />
            </Card>

            <Card>
              <h2 className="font-semibold text-neutral-900">Activity</h2>
              <ol className="mt-4 space-y-4 border-l border-neutral-200 pl-4">
                {[...b.log].reverse().map((e, i) => (
                  <li key={i} className="relative">
                    <span className={cn("absolute -left-[21px] top-1 size-2.5 rounded-full ring-4 ring-white", i === 0 ? "bg-sky-500" : "bg-neutral-300")} />
                    <p className="text-sm text-neutral-800">{e.text}</p>
                    <p className="text-xs text-neutral-400">
                      {formatDateTime(e.at)} · {e.by}
                    </p>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      </div>

      {payKind && <PaymentModal booking={b} kind={payKind} onClose={() => setPayKind(null)} />}
      {rooms && (
        <RoomsModal
          booking={b}
          mode={rooms}
          onClose={() => {
            setRooms(null);
            if (resumeCheckIn) {
              setResumeCheckIn(false);
              setModal("checkin");
            }
          }}
        />
      )}
      {modal === "checkin" && (
        <CheckInModal
          booking={b}
          onClose={() => setModal(null)}
          onAssign={() => {
            setModal(null);
            setResumeCheckIn(true);
            setRooms("assign");
          }}
        />
      )}
      {modal === "charge" && <ChargeModal booking={b} open onClose={() => setModal(null)} />}
      {modal === "extend" && <ExtendStayModal booking={b} onClose={() => setModal(null)} />}
      {modal === "stay" &&
        (b.status === "checked-in" ? <ExtendStayModal booking={b} onClose={() => setModal(null)} /> : <ChangeStayModal booking={b} open onClose={() => setModal(null)} />)}
      {modal === "cancel" && <CancelModal booking={b} open onClose={() => setModal(null)} />}
      {modal === "cancelRoom" && <CancelRoomModal booking={b} open onClose={() => setModal(null)} />}
      {modal === "guest" && <GuestModal booking={b} open onClose={() => setModal(null)} />}
      {modal === "checkout" && (
        <CheckoutModal
          booking={b}
          open
          onClose={() => setModal(null)}
          onCollect={() => {
            setModal(null);
            setPayKind("payment");
          }}
        />
      )}
    </>
  );
}

/** Paid or not, said plainly, with the latest payment that went through. */
function PaymentState({ b }: { b: Booking }) {
  if (!isLive(b)) return null;
  const due = dueOf(b);
  const credit = creditOf(b);
  const received = paidOf(b) + refundedOf(b);
  const last = b.payments.filter((p) => !p.void && p.kind !== "refund").sort((x, y) => x.at.localeCompare(y.at)).at(-1);
  const state =
    credit > 0
      ? { label: "Refund due", tone: "bg-violet-50 text-violet-700 ring-violet-200" }
      : due === 0
        ? { label: "Paid in full", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" }
        : received > 0
          ? { label: "Partially paid", tone: "bg-sky-50 text-sky-700 ring-sky-200" }
          : { label: "Not paid yet", tone: "bg-neutral-100 text-neutral-700 ring-neutral-300" };
  return (
    <div className="mt-4 border-t border-neutral-100 pt-3">
      <span className={cn("inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", state.tone)}>{state.label}</span>
      <p className="mt-2 text-xs text-neutral-500">
        {last ? (
          <>
            Last payment <b className="font-semibold text-neutral-700">{taka(last.amount)}</b> · {payLabels[last.method]} · {formatDateTime(last.at)}
          </>
        ) : (
          "No payment received yet."
        )}
      </p>
    </div>
  );
}

type StepState = "done" | "part" | "now" | "warn" | "todo";

const stepStyles: Record<StepState, { dot: string; title: string; note: string; label: string }> = {
  done: { dot: "border-emerald-600 bg-emerald-600 text-white", title: "text-neutral-900", note: "text-neutral-500", label: "done" },
  part: { dot: "border-sky-600 bg-white text-sky-700", title: "text-neutral-900", note: "text-sky-800", label: "in progress" },
  now: { dot: "border-sky-600 bg-sky-600 text-white ring-4 ring-sky-100", title: "text-sky-800", note: "text-neutral-600", label: "current step" },
  warn: { dot: "border-rose-600 bg-rose-600 text-white ring-4 ring-rose-100", title: "text-rose-800", note: "text-rose-700", label: "needs attention" },
  todo: { dot: "border-neutral-300 bg-white text-neutral-500", title: "text-neutral-500", note: "text-neutral-500", label: "not started" },
};

/** Where the booking is in the front-desk process — booked, paid, checked in, checked out. */
function ProcessSteps({ db, b }: { db: HotelDB; b: Booking }) {
  const today = todayKey();
  const { checkInTime, checkOutTime } = db.settings;
  const due = dueOf(b);
  const credit = creditOf(b);
  const paid = paidOf(b);

  if (b.status === "cancelled" || b.status === "no-show")
    return (
      <p className="mt-4 rounded-md border border-neutral-200 bg-white p-3 text-sm text-neutral-700">
        <b>{b.status === "cancelled" ? "Cancelled" : "No-show"}</b>
        {b.cancelReason ? ` — ${b.cancelReason}.` : "."}
        {credit > 0 ? ` Refund due: ${taka(credit)}.` : ""}
      </p>
    );

  const inHouse = b.status === "checked-in";
  const out = b.status === "checked-out";
  const arriving = isArrival(b, today);
  const blockers = arriving ? checkInBlockers(db, b) : [];
  const time = (iso: string) => `${dateLabel(hotelDayOf(iso), "dd MMM")}, ${hotelTime(iso)}`;

  const steps: { label: string; state: StepState; detail: string }[] = [
    {
      label: "Booked",
      state: b.status === "pending" ? "now" : "done",
      detail: b.status === "pending" ? "Waiting for confirmation" : `${sourceLabels[b.source]} · ${dateLabel(hotelDayOf(b.createdAt), "dd MMM")}`,
    },
    {
      label: "Payment",
      state: due === 0 ? "done" : paid > 0 ? "part" : "todo",
      detail: credit > 0 ? `Refund due ${taka(credit)}` : due === 0 ? "Paid in full" : paid > 0 ? `${taka(paid)} paid · ${taka(due)} due` : `Not paid · ${taka(due)} due`,
    },
    {
      label: "Check-in",
      state: inHouse || out ? "done" : arriving ? (blockers.length ? "warn" : "now") : "todo",
      detail: b.checkedInAt ? `Arrived ${time(b.checkedInAt)}` : arriving ? (blockers.length ? blockers[0].text : "Room ready — check in now") : `${dateLabel(b.checkIn, "EEE dd MMM")} from ${checkInTime}`,
    },
    {
      label: "Check-out",
      state: out ? "done" : inHouse ? (b.checkOut < today ? "warn" : "now") : "todo",
      detail: b.checkedOutAt ? `Left ${time(b.checkedOutAt)}` : `${dateLabel(b.checkOut, "EEE dd MMM")} by ${checkOutTime}`,
    },
  ];

  return (
    <ol className="mt-4 flex flex-col rounded-md border border-neutral-200 bg-white p-4 md:flex-row md:gap-4 md:px-5">
      {steps.map((st, i) => {
        const s = stepStyles[st.state];
        const last = i === steps.length - 1;
        // The connector after a step fills in once that step is finished.
        const line = st.state === "done" ? "bg-emerald-500" : "bg-neutral-200";
        return (
          <li
            key={st.label}
            aria-current={st.state === "now" || st.state === "warn" ? "step" : undefined}
            className={cn("relative flex gap-3", last ? "md:flex-none" : "pb-5 md:flex-1 md:pb-0")}
          >
            {!last && <span aria-hidden className={cn("absolute bottom-1 left-4 top-9 w-0.5 -translate-x-1/2 rounded-full md:hidden", line)} />}
            <span aria-hidden className={cn("flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold", s.dot)}>
              {st.state === "done" ? <Check className="size-4" strokeWidth={3} /> : st.state === "warn" ? <AlertTriangle className="size-4" /> : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex h-8 items-center gap-3">
                <span className={cn("whitespace-nowrap text-sm font-semibold", s.title)}>
                  {st.label}
                  <span className="sr-only">, {s.label}</span>
                </span>
                {!last && <span aria-hidden className={cn("hidden h-0.5 flex-1 rounded-full md:block", line)} />}
              </div>
              <p className={cn("-mt-1 text-xs leading-snug", s.note)}>{st.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function FolioHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-neutral-500">{children}</h3>;
}

/** One folio line: what it is, a smaller detail underneath, and the amount. Negative amounts are credits. */
function FolioLine({ label, detail, amount, quiet }: { label: string; detail?: React.ReactNode; amount: number; quiet?: boolean }) {
  return (
    <li className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className={cn("text-sm", quiet ? "text-neutral-600" : "text-neutral-800")}>{label}</p>
        {detail && <p className="mt-0.5 text-xs text-neutral-500">{detail}</p>}
      </div>
      <span className={cn("shrink-0 text-sm tabular-nums", amount < 0 ? "text-emerald-700" : quiet ? "text-neutral-600" : "font-medium text-neutral-900")}>
        {amount < 0 ? "−" : ""}
        {taka(Math.abs(amount))}
      </span>
    </li>
  );
}

type InfoRow = { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode; href?: string };

/** Label | value rows with dividers — the same table look for the stay and the guest. */
function InfoTable({ rows }: { rows: InfoRow[] }) {
  return (
    <table className="mt-4 w-full table-fixed text-sm">
      <tbody className="divide-y divide-neutral-100 border-y border-neutral-100">
        {rows.map(({ icon: Icon, label, value, href }) => (
          <tr key={label} className="align-top">
            <th scope="row" className="w-36 whitespace-nowrap py-2.5 pr-3 text-left font-normal text-neutral-500">
              <span className="inline-flex items-center gap-2">
                <Icon className="size-4 shrink-0 text-neutral-400" />
                {label}
              </span>
            </th>
            <td className="py-2.5 font-medium text-neutral-900 wrap-break-word">
              {href ? (
                <a href={href} className="text-sky-700 hover:underline">
                  {value}
                </a>
              ) : (
                value
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
