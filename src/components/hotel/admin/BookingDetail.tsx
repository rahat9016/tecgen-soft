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
  MoreVertical,
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
  confirmBooking,
  dueOf,
  folioTotal,
  groupOf,
  isLive,
  markNoShow,
  paidOf,
  removeCharge,
  setInternalNote,
  unitNumbers,
  useCurrentStaff,
  useHotelDB,
  voidPayment,
} from "@/src/lib/hotel-store/store";
import type { Booking, HotelDB, PaymentKind } from "@/src/lib/hotel-store/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { useT } from "@/src/lib/hotel-store/i18n";
import { cn } from "@/src/lib/utils";
import PrintableInvoice, { invoiceNumber, printWithTitle } from "@/src/components/hotel/Booking/PrintableInvoice";
import { CancelModal, CancelRoomModal, cancellableRooms, ChangeStayModal, ChargeModal, CheckInModal, CheckoutModal, GuestModal, PaymentModal, RoomsModal } from "./BookingModals";
import ExtendStayModal from "./ExtendStayModal";
import { ADMIN, Card, Empty, hbtn, StatusBadge, textareaClass } from "./ui";

export default function BookingDetail({ id }: { id: string }) {
  const t = useT();
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
            {t("Back to bookings")}
          </Link>
        </Empty>
      </Card>
    );
  }

  const role = staff?.role;
  const today = todayKey();
  const user = db.users.find((u) => u.id === b.userId);
  const linked = groupOf(db, b);
  // This bill plus its live linked bills (rooms of other types booked together), in room order.
  const group = [b, ...linked.filter(isLive)].sort((x, y) => x.code.localeCompare(y.code));
  const groupDue = group.reduce((n, x) => n + dueOf(x), 0);
  const multi = group.length > 1;
  const otherStays = user ? db.bookings.filter((x) => x.userId === user.id && x.id !== b.id) : [];
  const unitList = unitNumbers(db, b.unitIds);
  const due = dueOf(b);
  const paid = paidOf(b);
  const total = folioTotal(b);
  const settled = due === 0 && paid > 0;
  const live = isLive(b);
  const upcoming = b.status === "pending" || b.status === "confirmed";
  const canVoid = can(role, "payments.void");

  const startCheckIn = () => setModal("checkin");

  // Every action once, as data: phones show the main one as a button and the rest in one "Actions" menu;
  // wider screens show them all as a row of buttons.
  type Act = { key: string; label: string; icon: React.ComponentType<{ className?: string }>; run: () => void; kind: "primary" | "success" | "outline" | "danger" };
  const acts: Act[] = [
    ...(b.status === "pending"
      ? [
          {
            key: "confirm",
            label: t("Confirm booking"),
            icon: BadgeCheck,
            kind: "primary" as const,
            run: () => {
              const r = confirmBooking(b.id);
              if (r.ok) toast.success(t("{code} confirmed — the guest is notified", { code: b.code }));
              else toast.error(r.error);
            },
          },
        ]
      : []),
    ...(upcoming && b.checkIn <= today && b.checkOut > today ? [{ key: "checkin", label: t("Check in"), icon: LogIn, kind: "success" as const, run: startCheckIn }] : []),
    ...(b.status === "checked-in" ? [{ key: "checkout", label: t("Check out"), icon: LogOut, kind: "success" as const, run: () => setModal("checkout") }] : []),
    ...(upcoming || b.status === "checked-in"
      ? [{ key: "stay", label: b.status === "checked-in" ? t("Extend stay") : t("Change stay"), icon: CalendarCog, kind: "outline" as const, run: () => setModal("stay") }]
      : []),
    ...(upcoming ? [{ key: "extend", label: t("Extend stay"), icon: CalendarPlus, kind: "outline" as const, run: () => setModal("extend") }] : []),
    {
      key: "print",
      label: b.status === "checked-in" ? t("Interim bill") : t("Invoice"),
      icon: Printer,
      kind: "outline",
      run: () => printWithTitle(`${invoiceNumber(b.code)} - ${db.content.hotel.name}`),
    },
    ...(upcoming && b.checkIn <= today
      ? [
          {
            key: "noshow",
            label: t("No-show"),
            icon: UserX,
            kind: "outline" as const,
            run: () => {
              if (!confirm(t("Mark {name} as a no-show? The policy fee is kept and the room is released.", { name: b.guest.name }))) return;
              const r = markNoShow(b.id);
              if (r.ok) toast.success(t("Marked as no-show"));
              else toast.error(r.error);
            },
          },
        ]
      : []),
    ...(upcoming ? [{ key: "cancel", label: t("Cancel"), icon: Ban, kind: "danger" as const, run: () => setModal("cancel") }] : []),
  ];
  // Phones: every action behind one square icon button in the header, like the bookings filter button.
  const actionMenu = (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger aria-label={t("Actions")} className={cn(hbtn.outline, "relative size-10 shrink-0 px-0 sm:hidden", acts.some((a) => a.kind !== "outline" && a.kind !== "danger") && "border-sky-500 text-sky-700")}>
        <MoreVertical className="size-5" />
        {acts.some((a) => a.kind === "primary" || a.kind === "success") && <span aria-hidden className="absolute -right-1 -top-1 size-2.5 rounded-full bg-sky-600 ring-2 ring-white" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-60 rounded-md">
        {acts.map((a, i) => (
          <span key={a.key} className="contents">
            {a.kind === "danger" && i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onSelect={a.run}
              variant={a.kind === "danger" ? "destructive" : "default"}
              className={cn("cursor-pointer py-2.5", (a.kind === "primary" || a.kind === "success") && "font-semibold text-sky-800")}
            >
              <a.icon /> {a.label}
            </DropdownMenuItem>
          </span>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const actions = (
    <>
      <div className="hidden flex-wrap gap-2 sm:flex">
        {acts.map((a) => (
          <button key={a.key} onClick={a.run} className={hbtn[a.kind]}>
            <a.icon className="size-4" /> {a.label}
          </button>
        ))}
      </div>
    </>
  );

  const at = (iso: string) => `${dateLabel(hotelDayOf(iso), "dd MMM")}, ${hotelTime(iso)}`;
  const missing = b.rooms - unitList.length;
  const stayRows: InfoRow[] = [
    { icon: Hash, label: t("Booking"), value: <span className="font-mono">{b.code}</span> },
    {
      icon: BedDouble,
      label: b.rooms + linked.reduce((s, x) => s + x.rooms, 0) > 1 ? t("Rooms") : t("Room"),
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
                  <Link href={`${ADMIN}/bookings/${x.id}`} title={t("Open its bill")} className="ml-1.5 rounded-sm font-mono text-xs text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
                    {x.code}
                  </Link>
                )}
                {gap > 0 && <span className="block text-xs font-medium text-rose-700">{gap === x.rooms ? t("Not assigned yet") : t("{n} not assigned yet", { n: gap })}</span>}
              </li>
            );
          })}
        </ul>
      ),
    },
    {
      icon: LogIn,
      label: t("Check-in"),
      value: (
        <>
          {dateLabel(b.checkIn, "EEE, dd MMM yyyy")}
          <span className="block text-xs font-normal text-neutral-500">{b.checkedInAt ? t("Arrived {time}", { time: at(b.checkedInAt) }) : t("From {time}", { time: db.settings.checkInTime })}</span>
        </>
      ),
    },
    {
      icon: LogOut,
      label: t("Check-out"),
      value: (
        <>
          {dateLabel(b.checkOut, "EEE, dd MMM yyyy")}
          <span className="block text-xs font-normal text-neutral-500">{b.checkedOutAt ? t("Left {time}", { time: at(b.checkedOutAt) }) : t("Until {time}", { time: db.settings.checkOutTime })}</span>
        </>
      ),
    },
    { icon: Moon, label: t("Nights"), value: t(b.nights > 1 ? "{n} nights" : "{n} night", { n: b.nights }) },
    { icon: Users, label: t("Guests"), value: `${t(b.adults > 1 ? "{n} adults" : "{n} adult", { n: b.adults })}${b.children ? `, ${t(b.children > 1 ? "{n} children" : "{n} child", { n: b.children })}` : ""}` },
    { icon: Tag, label: t("Rate"), value: `${taka(b.pricePerNight)} / ${b.rooms > 1 ? `${t("room")} / ` : ""}${t("night")}` },
    ...(b.guest.note
      ? [
          {
            icon: StickyNote,
            label: t("Request"),
            value: (
              <>
                {b.guest.note}
                <span className="block text-xs font-normal text-neutral-500">{t("Guest request — not guaranteed")}</span>
              </>
            ),
          },
        ]
      : []),
  ];

  const guestRows: InfoRow[] = [
    { icon: UserRound, label: t("Name"), value: b.guest.name },
    { icon: Phone, label: t("Phone"), value: b.guest.phone, href: `tel:${b.guest.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: t("Email"), value: b.guest.email || "—", href: b.guest.email ? `mailto:${b.guest.email}` : undefined },
    { icon: Globe2, label: t("Country"), value: b.guest.country || "—" },
    { icon: IdCard, label: b.guest.idType === "passport" ? t("Passport") : "NID", value: b.guest.idNumber || t("Not given") },
    { icon: Clock3, label: t("Arrival"), value: b.guest.arrivalTime || t("Not given") },
    { icon: Plane, label: t("Airport pickup"), value: b.guest.airportPickup ? t("Requested") : t("No") },
  ];

  return (
    <>
      <PrintableInvoice booking={b} db={db} />
      <div className="space-y-2.5 sm:space-y-4 print:hidden">
        <Card className="p-4 sm:p-5">
          {/* Status, payment, room and dates are on the steps and cards below. */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {/* Back, title and (phones) the action menu share one row. */}
              <Link href={back} aria-label={t("Back to bookings")} className={cn(hbtn.outline, "size-10 shrink-0 px-0")}>
                <ArrowLeft className="size-4" />
              </Link>
              <div className="min-w-0">
                <h1 className="flex items-center gap-2 font-mono text-base font-bold text-sky-800">
                  {b.code} <StatusBadge status={b.status} className="font-sans" />
                </h1>
                <p className="truncate text-sm text-neutral-600">{b.guest.name}</p>
              </div>
              <div className="ml-auto sm:hidden">{actionMenu}</div>
            </div>
            {actions}
          </div>
          {b.commission && (
            <div>
              <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 rounded-md bg-violet-50 px-2.5 py-1 text-xs text-violet-800">
                {t("Commission")} <b className="tabular-nums">{taka(b.commission.amount)}</b>
                {b.commission.kind === "percent" && ` (${b.commission.value}%)`} → {b.commission.name}
                <span className="text-violet-600">· {b.commission.to === "agency" ? t("Agency") : t("Person")}</span>
                {b.commission.phone && <span className="text-violet-600">· {b.commission.phone}</span>}
              </p>
            </div>
          )}
          <ProcessSteps db={db} b={b} />
        </Card>

        <div className="grid items-start gap-2.5 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Container query: the cards sit side by side only when this column (not the viewport) is wide enough. */}
          <div className="@container min-w-0 space-y-2.5 sm:space-y-4">
            <div className="grid gap-2.5 sm:gap-4 @3xl:grid-cols-2">
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
                    <BedDouble className="size-4 text-sky-600" /> {t("Stay")}
                  </h2>
                  <div className="flex gap-2">
                    {/* Only while another room would be left — cancelling the last one is cancelling the booking. */}
                    {cancellableRooms(db, b).length > 1 && (
                      <button onClick={() => setModal("cancelRoom")} className={cn(hbtn.small, "text-rose-600 hover:border-rose-300 hover:text-rose-700")}>
                        {t("Cancel a room")}
                      </button>
                    )}
                    {(upcoming || b.status === "checked-in") && (
                      <button onClick={() => setRooms("assign")} className={hbtn.small}>
                        {b.status === "checked-in" ? t("Move room") : unitList.length ? t("Change rooms") : t("Assign rooms")}
                      </button>
                    )}
                  </div>
                </div>
                <InfoTable rows={stayRows} />
                {b.status === "checked-in" && b.checkOut < today && (
                  <p className="mt-3 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{t("Past check-out date — extend the stay or check the guest out.")}</p>
                )}
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
                    <UserRound className="size-4 text-sky-600" /> {t("Guest")}
                  </h2>
                  <button onClick={() => setModal("guest")} className={hbtn.small}>
                    {t("Edit")}
                  </button>
                </div>
                <InfoTable rows={guestRows} />
                {user && (
                  <div className="mt-4 rounded-md bg-neutral-50 p-3 text-xs text-neutral-600">
                    <p>
                      {user.passwordHash ? t("Registered guest account") : t("Guest profile (no login)")} · {t(otherStays.length === 1 ? "{n} other booking" : "{n} other bookings", { n: otherStays.length })}
                    </p>
                    {user.note && <p className="mt-1 font-medium text-neutral-800">{t("Note")}: {user.note}</p>}
                  </div>
                )}
              </Card>
            </div>

            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
                  <Receipt className="size-4 text-sky-600" /> {t("Folio")}
                </h2>
                {live && (
                  <div className="flex gap-2">
                    {/* Bill is settled: no more charges or discounts on it. */}
                    <button
                      onClick={() => setModal("charge")}
                      disabled={settled}
                      title={settled ? t("Bill is fully paid — no more charges or discounts") : undefined}
                      className={cn(hbtn.small, "disabled:cursor-not-allowed disabled:opacity-50")}
                    >
                      <Plus className="size-3.5" /> {t("Charge / discount")}
                    </button>
                    {due > 0 && (
                      <button onClick={() => setPayKind("payment")} className={cn(hbtn.small, "border-emerald-200 text-emerald-700")}>
                        <Wallet className="size-3.5" /> {t("Payment")}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <FolioHeading>{t("Stay")}</FolioHeading>
              <ul className="divide-y divide-neutral-100">
                <FolioLine
                  label={t("Room charge")}
                  detail={`${b.roomName} · ${taka(b.pricePerNight)} × ${t(b.nights > 1 ? "{n} nights" : "{n} night", { n: b.nights })}${b.rooms > 1 ? ` × ${t("{n} rooms", { n: b.rooms })}` : ""}`}
                  amount={b.subtotal}
                />
                {b.discount && (
                  <FolioLine
                    label={`${t("Discount")}${b.discount.kind === "percent" ? ` (${b.discount.value}%)` : ""}`}
                    detail={[b.discount.reason, b.discount.by].filter(Boolean).join(" · ")}
                    amount={-b.discount.amount}
                  />
                )}
                <FolioLine label={`${t("Service charge")} (${b.serviceFeeRate ?? db.settings.serviceFeeRate}%)`} amount={b.serviceFee} quiet />
                <FolioLine label={`VAT (${b.vatRate ?? db.settings.vatRate}%)`} amount={b.tax} quiet />
              </ul>

              {b.charges.length > 0 && (
                <>
                  <FolioHeading>{t("Extras")}</FolioHeading>
                  <ul className="divide-y divide-neutral-100">
                    {b.charges.map((c) => (
                      <FolioLine
                        key={c.id}
                        label={c.description}
                        detail={
                          <>
                            {t(chargeLabels[c.category])} · {format(new Date(c.at), "dd MMM, h:mm a")} · {c.by}
                            {live && (
                              <button
                                onClick={() => {
                                  if (!confirm(`${t("Remove")} "${c.description}"?`)) return;
                                  const r = removeCharge(b.id, c.id);
                                  if (!r.ok) toast.error(r.error);
                                }}
                                aria-label={`${t("Remove")} ${c.description}`}
                                className="ml-2 inline-flex items-center gap-1 whitespace-nowrap rounded-sm font-medium text-neutral-500 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                              >
                                <Trash2 className="size-3" aria-hidden /> {t("Remove")}
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
                      <dt>{t("Stay")}</dt>
                      <dd className="tabular-nums">{taka(b.total)}</dd>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <dt>{t("Extras")}</dt>
                      <dd className="tabular-nums">{taka(total - b.total)}</dd>
                    </div>
                  </>
                )}
                <div className={cn("flex items-baseline justify-between", b.charges.length > 0 && "border-t border-neutral-200 pt-2")}>
                  <dt className="font-semibold text-neutral-900">{t("Total")}</dt>
                  <dd className="text-lg font-bold tabular-nums text-neutral-900">{taka(total)}</dd>
                </div>
              </dl>

              <div className="mt-6 flex items-baseline justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("Payments")}</h3>
                {b.payments.length > 0 && <span className="text-xs text-neutral-500">{t("{amount} received", { amount: taka(paid) })}</span>}
              </div>
              {b.payments.length === 0 ? (
                <p className="mt-2 rounded-md border border-dashed border-neutral-200 px-3 py-4 text-center text-sm text-neutral-500">{t("No payments yet.")}</p>
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
                            <span className={cn("text-sm font-medium", p.void ? "text-neutral-500 line-through" : "text-neutral-900")}>{t(payLabels[p.method])}</span>
                            <span
                              className={cn(
                                "rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                                refund ? "bg-violet-50 text-violet-700" : p.kind === "deposit" ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700"
                              )}
                            >
                              {t(paymentKindLabels[p.kind])}
                            </span>
                            {p.void && <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold text-rose-700">{t("Voided")}</span>}
                          </p>
                          {p.ref && <p className="mt-0.5 truncate font-mono text-xs text-neutral-600">{p.ref}</p>}
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {formatDateTime(p.at)} · {p.by}
                            {p.note ? ` · ${p.note}` : ""}
                          </p>
                          {p.void && (
                            <p className="mt-0.5 text-xs text-rose-700">
                              {t("Voided by {name}", { name: p.void.by })}: {p.void.reason}
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
                                const reason = prompt(t("Void {amount}? It stays on the folio for the audit trail.\n\nReason:", { amount: taka(p.amount) }));
                                if (!reason) return;
                                const r = voidPayment(b.id, p.id, reason);
                                if (r.ok) toast.success(t("Payment voided"));
                                else toast.error(r.error);
                              }}
                              className="-mr-1.5 rounded px-1.5 py-0.5 text-xs font-medium text-neutral-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                            >
                              {t("Void")}
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

          {/* Below xl the right column dissolves into the grid so the balance can jump to the top on phones. */}
          <div className="contents xl:block xl:space-y-4">
            <Card className="order-first xl:order-none">
              {multi ? (
                <>
                  {/* Each room keeps its own bill: what each still owes, then the whole stay. */}
                  <ul className="-mt-2.5 divide-y divide-neutral-100 border-b border-neutral-100 text-sm">
                    {group.map((x) => {
                      const nums = unitNumbers(db, x.unitIds).join(", ");
                      const xPaid = paidOf(x);
                      return (
                        <li key={x.id} className="flex items-center justify-between gap-3 py-2.5">
                          <span className="min-w-0">
                            {x.id === b.id ? (
                              <b className="text-neutral-900">{t("Room")} {nums || "—"}</b>
                            ) : (
                              <Link href={`${ADMIN}/bookings/${x.id}`} title={x.code} className="font-semibold text-sky-700 hover:underline">
                                {t("Room")} {nums || x.code}
                              </Link>
                            )}
                            <span className="block truncate text-xs text-neutral-500">
                              {x.roomName}
                              {xPaid > 0 && ` · ${taka(xPaid)} ${t("paid")}`}
                            </span>
                          </span>
                          <span className={cn("shrink-0 font-semibold tabular-nums", dueOf(x) > 0 ? "text-neutral-900" : "text-emerald-600")}>
                            {dueOf(x) > 0 ? taka(dueOf(x)) : t("Paid")}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <dl className="mt-3 space-y-1.5 font-medium text-neutral-900">
                    <div className="flex justify-between">
                      <dt>{t("Total bill")}</dt>
                      <dd className="tabular-nums">{taka(group.reduce((n, x) => n + folioTotal(x), 0))}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>{t("Paid")}</dt>
                      <dd className="tabular-nums text-emerald-700">{taka(group.reduce((n, x) => n + paidOf(x), 0))}</dd>
                    </div>
                    <div className={cn("flex justify-between border-t border-neutral-200 pt-2 text-lg", groupDue > 0 ? "text-rose-600" : "text-emerald-600")}>
                      <dt>{groupDue > 0 ? t("Balance due") : t("Fully paid")}</dt>
                      <dd className="tabular-nums">{taka(groupDue)}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <>
                  <p className="text-sm text-neutral-500">{due > 0 ? t("Balance due") : t("Balance")}</p>
                  <p className={cn("mt-1 text-3xl font-bold tabular-nums", due > 0 ? "text-rose-600" : "text-emerald-600")}>{taka(due)}</p>
                  <dl className="mt-4 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">{t("Folio total")}</dt>
                      <dd className="tabular-nums">{taka(total)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">{t("Paid (net)")}</dt>
                      <dd className="tabular-nums">{taka(paid)}</dd>
                    </div>
                    {!live && (
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">{t("Cancellation fee kept")}</dt>
                        <dd className="tabular-nums">{taka(b.cancellationFee ?? 0)}</dd>
                      </div>
                    )}
                  </dl>
                </>
              )}
              {live && due > 0 && (
                <button onClick={() => setPayKind("payment")} className={cn(hbtn.primary, "mt-4 h-11 w-full text-base")}>
                  <Wallet className="size-4" /> {t("Collect payment")}{multi && unitList.length > 0 && ` · ${t("Room")} ${unitList.join(", ")}`}
                </button>
              )}
              {!live && b.cancelReason && <p className="mt-4 rounded-md bg-neutral-50 p-3 text-xs text-neutral-600">{t("Reason")}: {b.cancelReason}</p>}
            </Card>

            <Card>
              <h2 className="font-semibold text-neutral-900">{t("Staff note")}</h2>
              <p className="text-xs text-neutral-500">{t("Only visible to staff.")}</p>
              <textarea
                value={note ?? b.internalNote ?? ""}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => {
                  if (note === null || note === (b.internalNote ?? "")) return;
                  setInternalNote(b.id, note);
                  toast.success(t("Note saved"));
                }}
                rows={3}
                placeholder={t("e.g. VIP — upgrade if possible")}
                className={cn(textareaClass, "mt-3")}
              />
            </Card>

            <Card>
              <h2 className="font-semibold text-neutral-900">{t("Activity")}</h2>
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
  const t = useT();
  const today = todayKey();
  const { checkInTime, checkOutTime } = db.settings;
  const due = dueOf(b);
  const paid = paidOf(b);

  if (b.status === "cancelled" || b.status === "no-show")
    return (
      <p className="mt-4 rounded-md border border-neutral-200 bg-white p-3 text-sm text-neutral-700">
        <b>{b.status === "cancelled" ? t("Cancelled") : t("No-show")}</b>
        {b.cancelReason ? ` — ${b.cancelReason}.` : "."}
      </p>
    );

  const inHouse = b.status === "checked-in";
  const out = b.status === "checked-out";
  const arriving = isArrival(b, today);
  const blockers = arriving ? checkInBlockers(db, b) : [];
  const time = (iso: string) => `${dateLabel(hotelDayOf(iso), "dd MMM")}, ${hotelTime(iso)}`;

  const steps: { label: string; state: StepState; detail: string }[] = [
    {
      label: t("Booked"),
      state: b.status === "pending" ? "now" : "done",
      detail: b.status === "pending" ? t("Waiting for confirmation") : `${t(sourceLabels[b.source])} · ${dateLabel(hotelDayOf(b.createdAt), "dd MMM")}`,
    },
    {
      label: t("Payment"),
      state: due === 0 ? "done" : paid > 0 ? "part" : "todo",
      detail: due === 0 ? t("Paid in full") : paid > 0 ? `${taka(paid)} ${t("paid")} · ${t("{amount} due", { amount: taka(due) })}` : `${t("Not paid")} · ${t("{amount} due", { amount: taka(due) })}`,
    },
    {
      label: t("Check-in"),
      state: inHouse || out ? "done" : arriving ? (blockers.length ? "warn" : "now") : "todo",
      detail: b.checkedInAt ? t("Arrived {time}", { time: time(b.checkedInAt) }) : arriving ? (blockers.length ? t(blockers[0].text) : t("Room ready — check in now")) : `${dateLabel(b.checkIn, "EEE dd MMM")} · ${t("From {time}", { time: checkInTime })}`,
    },
    {
      label: t("Check-out"),
      state: out ? "done" : inHouse ? (b.checkOut < today ? "warn" : "now") : "todo",
      detail: b.checkedOutAt ? t("Left {time}", { time: time(b.checkedOutAt) }) : `${dateLabel(b.checkOut, "EEE dd MMM")} · ${t("Until {time}", { time: checkOutTime })}`,
    },
  ];

  const current = steps.find((st) => st.state === "now" || st.state === "warn" || st.state === "part") ?? steps.findLast((st) => st.state === "done") ?? steps[0];

  return (
    <>
      {/* Phones: just four dots in a row; the details are on the cards below. */}
      <div className="mt-4 border-t border-neutral-100 pt-4 md:hidden">
        <ol className="grid grid-cols-4">
          {steps.map((st, i) => {
            const s = stepStyles[st.state];
            const line = st.state === "done" ? "bg-emerald-500" : "bg-neutral-200";
            return (
              <li key={st.label} aria-current={st === current ? "step" : undefined} className="relative flex flex-col items-center text-center">
                {i < steps.length - 1 && <span aria-hidden className={cn("absolute left-1/2 top-3.5 h-0.5 w-full", line)} />}
                <span aria-hidden className={cn("relative flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold", s.dot)}>
                  {st.state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : st.state === "warn" ? <AlertTriangle className="size-3.5" /> : i + 1}
                </span>
                <span className={cn("mt-1.5 text-[11px] font-semibold leading-tight", s.title)}>
                  {st.label}
                  <span className="sr-only">, {t(s.label)}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

    <ol className="mt-4 hidden border-t border-neutral-100 pt-4 md:flex md:flex-row md:gap-4">
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
            <span aria-hidden className={cn("flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold", s.dot)}>
              {st.state === "done" ? <Check className="size-4" strokeWidth={3} /> : st.state === "warn" ? <AlertTriangle className="size-4" /> : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex h-8 items-center gap-3">
                <span className={cn("whitespace-nowrap text-sm font-semibold", s.title)}>
                  {st.label}
                  <span className="sr-only">, {t(s.label)}</span>
                </span>
                {!last && <span aria-hidden className={cn("hidden h-0.5 flex-1 rounded-full md:block", line)} />}
              </div>
              <p className={cn("-mt-1 text-xs leading-snug", s.note)}>{st.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
    </>
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
            <th scope="row" className="w-32 whitespace-nowrap py-2.5 pr-3 sm:w-36 text-left font-normal text-neutral-500">
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
