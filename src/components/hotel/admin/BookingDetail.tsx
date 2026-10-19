"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  BedDouble,
  CalendarCog,
  CalendarPlus,
  Check,
  Clock3,
  Globe2,
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
  Repeat,
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
import { CancelModal, ChangeStayModal, ChargeModal, CheckInModal, CheckoutModal, GuestModal, PaymentModal, RoomsModal } from "./BookingModals";
import ExtendStayModal from "./ExtendStayModal";
import { ADMIN, Card, Empty, hbtn, PayBadge, StatusBadge, textareaClass } from "./ui";

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
  const [modal, setModal] = useState<"charge" | "stay" | "extend" | "cancel" | "checkout" | "checkin" | "guest" | null>(
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
      {live && due > 0 && (
        <button onClick={() => setPayKind("payment")} className={hbtn.outline}>
          <Wallet className="size-4" /> Record payment
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
      {(upcoming || b.status === "checked-in") && (
        <button onClick={() => setRooms("assign")} className={hbtn.outline}>
          <Repeat className="size-4" /> {unitList.length ? "Change room" : "Assign room"}
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
    {
      icon: BedDouble,
      label: b.rooms > 1 ? "Rooms" : "Room",
      value: (
        <>
          {unitList.length > 0 && <b className="text-base text-neutral-900">{unitList.join(", ")}</b>}
          <span className="text-neutral-600">
            {unitList.length ? " · " : ""}
            {b.roomName}
            {b.rooms > 1 ? ` ×${b.rooms}` : ""}
          </span>
          {missing > 0 && <span className="block text-xs font-medium text-rose-700">{missing === b.rooms ? "Not assigned yet" : `${missing} not assigned yet`}</span>}
        </>
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
    { icon: Tag, label: "Rate", value: `${taka(b.pricePerNight)} / night` },
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
          <Link
            href={back}
            className="inline-flex items-center gap-1 rounded-sm text-sm text-neutral-600 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <ArrowLeft className="size-4" /> Bookings
          </Link>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-neutral-500">{b.code}</span>
                <StatusBadge status={b.status} />
                <PayBadge booking={b} />
                <span className="rounded-md bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">{sourceLabels[b.source]}</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold text-neutral-900">{b.guest.name}</h1>
              <p className="text-sm text-neutral-500">
                {b.roomName}
                {b.rooms > 1 ? ` ×${b.rooms}` : ""} · {dateLabel(b.checkIn, "EEE dd MMM")} → {dateLabel(b.checkOut, "EEE dd MMM yyyy")} · {b.nights} night{b.nights > 1 ? "s" : ""}
              </p>
              {b.commission && (
                <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 rounded-md bg-violet-50 px-2.5 py-1 text-xs text-violet-800">
                  Commission <b className="tabular-nums">{taka(b.commission.amount)}</b>
                  {b.commission.kind === "percent" && ` (${b.commission.value}%)`} to {b.commission.name}
                  <span className="text-violet-600">· {b.commission.to === "agency" ? "Agency" : "Person"}</span>
                  {b.commission.phone && <span className="text-violet-600">· {b.commission.phone}</span>}
                </p>
              )}
              {linked.length > 0 && (
                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                  <span className="rounded-md bg-violet-50 px-2 py-0.5 font-semibold text-violet-700">Group booking</span>
                  Booked together with
                  {linked.map((x) => (
                    <Link key={x.id} href={`${ADMIN}/bookings/${x.id}`} className="rounded-md border border-neutral-200 bg-white px-2 py-0.5 font-medium text-sky-700 hover:border-sky-300">
                      {x.code} · {x.roomName}
                      {x.rooms > 1 ? ` ×${x.rooms}` : ""}
                    </Link>
                  ))}
                </p>
              )}
            </div>
            {actions}
          </div>
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
                  {(upcoming || b.status === "checked-in") && (
                    <button onClick={() => setRooms("assign")} className={hbtn.small}>
                      {b.status === "checked-in" ? "Move room" : unitList.length ? "Change rooms" : "Assign rooms"}
                    </button>
                  )}
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

              <table className="mt-4 w-full text-sm">
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="py-2.5 text-neutral-700">
                      Room charge · {taka(b.pricePerNight)} × {b.nights} night{b.nights > 1 ? "s" : ""}
                      {b.rooms > 1 ? ` × ${b.rooms} rooms` : ""}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{taka(b.subtotal)}</td>
                    <td className="w-8" />
                  </tr>
                  {b.discount && (
                    <tr>
                      <td className="py-2.5 text-neutral-700">
                        Discount{b.discount.kind === "percent" ? ` (${b.discount.value}%)` : ""}
                        <span className="ml-1.5 text-xs text-neutral-400">
                          {b.discount.reason} · {b.discount.by}
                        </span>
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-emerald-700">−{taka(b.discount.amount)}</td>
                      <td />
                    </tr>
                  )}
                  <tr>
                    <td className="py-2.5 text-neutral-700">Service charge ({db.settings.serviceFeeRate}%)</td>
                    <td className="py-2.5 text-right tabular-nums">{taka(b.serviceFee)}</td>
                    <td />
                  </tr>
                  <tr>
                    <td className="py-2.5 text-neutral-700">VAT ({db.settings.vatRate}%)</td>
                    <td className="py-2.5 text-right tabular-nums">{taka(b.tax)}</td>
                    <td />
                  </tr>
                  {b.charges.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2.5 text-neutral-700">
                        {c.description}
                        <span className="ml-1.5 text-xs text-neutral-400">
                          {chargeLabels[c.category]} · {format(new Date(c.at), "dd MMM h:mm a")} · {c.by}
                        </span>
                      </td>
                      <td className={cn("py-2.5 text-right tabular-nums", c.amount < 0 && "text-emerald-700")}>{taka(c.amount)}</td>
                      <td className="text-right">
                        {live && (
                          <button
                            onClick={() => {
                              if (!confirm(`Remove "${c.description}"?`)) return;
                              const r = removeCharge(b.id, c.id);
                              if (!r.ok) toast.error(r.error);
                            }}
                            aria-label={`Remove ${c.description}`}
                            className={hbtn.iconDanger}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="py-3 text-neutral-900">Total</td>
                    <td className="py-3 text-right tabular-nums text-neutral-900">{taka(total)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>

              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">Payments</h3>
              {b.payments.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-500">No payments yet.</p>
              ) : (
                <ul className="mt-2 divide-y divide-neutral-100 text-sm">
                  {b.payments.map((p) => (
                    <li key={p.id} className={cn("flex items-center gap-3 py-2.5", p.void && "opacity-50")}>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs font-semibold",
                          p.kind === "refund" ? "bg-violet-50 text-violet-700" : p.kind === "deposit" ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700"
                        )}
                      >
                        {paymentKindLabels[p.kind]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-neutral-800", p.void && "line-through")}>
                          {payLabels[p.method]}
                          {p.ref && <span className="ml-1.5 font-mono text-xs text-neutral-500">{p.ref}</span>}
                        </span>
                        <span className="block text-xs text-neutral-400">
                          {formatDateTime(p.at)} · {p.by}
                          {p.note ? ` · ${p.note}` : ""}
                          {p.void && ` · voided by ${p.void.by}: ${p.void.reason}`}
                        </span>
                      </span>
                      <span className={cn("font-semibold tabular-nums", p.kind === "refund" ? "text-violet-700" : "text-neutral-900")}>
                        {p.kind === "refund" ? "−" : ""}
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
                          className="text-xs text-neutral-400 hover:text-rose-600"
                        >
                          Void
                        </button>
                      )}
                    </li>
                  ))}
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

const stepDot: Record<StepState, string> = {
  done: "bg-emerald-600 text-white",
  part: "bg-sky-100 text-sky-700 ring-2 ring-sky-500",
  now: "bg-sky-600 text-white ring-4 ring-sky-100",
  warn: "bg-rose-50 text-rose-700 ring-2 ring-rose-400",
  todo: "bg-neutral-100 text-neutral-500",
};

/** Where the booking is in the front-desk process — booked, paid, checked in, checked out — and the next thing to do. */
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

  const next =
    b.status === "pending"
      ? "Confirm the booking."
      : out
        ? due > 0
          ? `Collect the ${taka(due)} still owed.`
          : "Stay complete."
        : inHouse
          ? b.checkOut < today
            ? "Past the check-out date — extend the stay or check the guest out."
            : due > 0
              ? `Collect ${taka(due)} before check-out on ${dateLabel(b.checkOut, "EEE dd MMM")}.`
              : `Check out on ${dateLabel(b.checkOut, "EEE dd MMM")} by ${checkOutTime}.`
          : arriving
            ? blockers.length
              ? `Sort this out before check-in: ${blockers.map((k) => k.text).join(" ")}`
              : `Check the guest in${due > 0 ? ` — ${taka(due)} can be collected now or at check-out` : ""}.`
            : due > 0
              ? `Collect ${taka(due)} now, or at check-in on ${dateLabel(b.checkIn, "EEE dd MMM")}.`
              : `Guest arrives ${dateLabel(b.checkIn, "EEE dd MMM")} — nothing to do until then.`;

  return (
    <div className="mt-4 rounded-md border border-neutral-200 bg-white p-4">
      <ol className="grid gap-4 sm:grid-cols-4">
        {steps.map((st, i) => (
          <li key={st.label} className="flex items-start gap-3">
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold", stepDot[st.state])}>
              {st.state === "done" ? <Check className="size-4" aria-label="Done" /> : i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-neutral-900">{st.label}</span>
              <span className={cn("block text-xs", st.state === "warn" ? "text-rose-700" : "text-neutral-500")}>{st.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className={cn("mt-4 rounded-md px-3 py-2 text-sm", blockers.length || (inHouse && b.checkOut < today) ? "bg-rose-50 text-rose-800" : "bg-sky-50 text-sky-900")}>
        <b>Next:</b> {next}
      </p>
    </div>
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
