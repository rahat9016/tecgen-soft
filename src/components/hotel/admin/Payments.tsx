"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarDays, ChevronDown, FileText, Search, Undo2, Wallet, X } from "lucide-react";
import { can } from "@/src/lib/hotel-store/auth";
import { dateLabel, formatDateTime, payLabels, paymentKindLabels, rangeLabel, shiftDay, shortRange, taka, todayKey } from "@/src/lib/hotel-store/format";
import { ledger } from "@/src/lib/hotel-store/reports";
import { creditOf, dueOf, folioTotal, paidOf, refundedOf, useCurrentStaff, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Booking, PaymentKind, PayMethod } from "@/src/lib/hotel-store/types";
import { useT } from "@/src/lib/hotel-store/i18n";
import { cn } from "@/src/lib/utils";
import { PaymentModal } from "./BookingModals";
import { ChoiceGroup, FilterChips, FilterPopover, type FilterChip } from "./filters";
import { MoneyCard } from "./MoneyCard";
import { Empty, focusRing, hbtn, Pager, StatusBadge, tableCardClass, Tabs, usePagination } from "./ui";

type Tab = "transactions" | "outstanding" | "refunds";
type Range = "today" | "7d" | "30d" | "month" | "all";

const rangeStart = (r: Range, today: string) =>
  r === "today" ? today : r === "7d" ? shiftDay(today, -6) : r === "30d" ? shiftDay(today, -29) : r === "month" ? `${today.slice(0, 8)}01` : "";

const rangeLabels: Record<Range, string> = { today: "Today", "7d": "Last 7 days", "30d": "Last 30 days", month: "This month", all: "All time" };
const DEFAULT_RANGE: Range = "30d";

const kindTone = (k: PaymentKind) => (k === "refund" ? "bg-violet-50 text-violet-700" : k === "deposit" ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700");

export default function Payments() {
  const t = useT();
  const db = useHotelDB();
  const staff = useCurrentStaff();
  const params = useSearchParams();
  const initial = params.get("tab");
  const [tab, setTab] = useState<Tab>(initial === "refunds" || initial === "outstanding" ? initial : "transactions");
  const [range, setRange] = useState<Range>(DEFAULT_RANGE);
  const [method, setMethod] = useState<"any" | PayMethod>("any");
  const [kind, setKind] = useState<"any" | PaymentKind>("any");
  const [q, setQ] = useState("");
  const [action, setAction] = useState<{ booking: Booking; kind: PaymentKind } | null>(null);
  // Booking whose payment history is open in the side panel; looked up live so new payments show at once.
  const [historyId, setHistoryId] = useState<string | null>(null);
  const today = todayKey();
  const canRefund = can(staff?.role, "payments.refund");

  const rows = useMemo(() => ledger(db), [db]);
  const from = rangeStart(range, today);
  const inRange = rows.filter((r) => !from || r.day >= from);
  const filtered = inRange.filter((r) => {
    if (method !== "any" && r.method !== method) return false;
    if (kind !== "any" && r.kind !== kind) return false;
    const n = q.trim().toLowerCase();
    return !n || [r.booking.code, r.booking.guest.name, r.ref ?? "", r.by].some((v) => v.toLowerCase().includes(n));
  });
  const page = usePagination(filtered, 20);

  const net = (list: typeof rows) => list.reduce((s, r) => s + r.signed, 0);
  const monthRows = rows.filter((r) => r.day >= `${today.slice(0, 8)}01`);
  // Upcoming stays owe their balance at check-in, so only in-house and departed guests count as outstanding.
  const outstanding = db.bookings.filter((b) => dueOf(b) > 0 && (b.status === "checked-in" || b.status === "checked-out"));
  const outstandingSorted = [...outstanding].sort((a, b) => {
    const rank = (x: Booking) => (x.status === "checked-out" ? 0 : 1);
    return rank(a) - rank(b) || a.checkIn.localeCompare(b.checkIn);
  });
  const refunds = db.bookings.filter((b) => creditOf(b) > 0).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const chips = [
    range !== DEFAULT_RANGE && { key: "range", label: t(rangeLabels[range]), clear: () => setRange(DEFAULT_RANGE) },
    method !== "any" && { key: "method", label: t(payLabels[method]), clear: () => setMethod("any") },
    kind !== "any" && { key: "kind", label: t(paymentKindLabels[kind]), clear: () => setKind("any") },
  ].filter(Boolean) as FilterChip[];
  const clearFilters = () => {
    setRange(DEFAULT_RANGE);
    setMethod("any");
    setKind("any");
  };
  const clearAll = () => {
    clearFilters();
    setQ("");
  };

  const bookingCell = (b: Booking) => (
    <td className="px-4 py-3">
      <button type="button" onClick={() => setHistoryId(b.id)} className="rounded-sm font-mono font-semibold text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
        {b.code}
      </button>
      <p className="text-xs text-neutral-500">{b.guest.name}</p>
    </td>
  );

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <MoneyCard index={0} label="Collected today" value={net(rows.filter((r) => r.day === today))} hint="Net of refunds" icon="wallet" tone="green" />
        <MoneyCard index={1} label="This month" value={net(monthRows)} hint={t("{n} transactions", { n: monthRows.filter((r) => !r.void).length })} icon="calendar" tone="sky" />
        <MoneyCard index={2} label="Outstanding" value={outstanding.reduce((s, b) => s + dueOf(b), 0)} hint={t("{n} unpaid folios", { n: outstanding.length })} icon="bill" tone="rose" />
        <MoneyCard index={3} label="Refunds due" value={refunds.reduce((s, b) => s + creditOf(b), 0)} hint={t(refunds.length === 1 ? "{n} booking" : "{n} bookings", { n: refunds.length })} icon="refund" tone="violet" />
      </div>

      <div className={tableCardClass}>
        <Tabs
          fit
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "transactions", label: "Transactions", count: inRange.length },
            { value: "outstanding", label: "Outstanding", count: outstanding.length },
            { value: "refunds", label: "Refunds due", count: refunds.length, dot: refunds.length ? "bg-violet-500" : undefined },
          ]}
        />

        {tab === "transactions" && (
          <div className="border-b border-neutral-100 p-3 sm:px-4">
            <div className="flex items-center gap-2">
              <label className="relative min-w-0 flex-1 sm:max-w-96">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("Search payments")}
                  aria-label={t("Search payments")}
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </label>
              {/* Wide screens have room for the three filters inline; smaller ones fold them behind one button. */}
              <div className="ml-auto hidden items-center gap-2 lg:flex">
                <FilterSelect label="Date range" icon={CalendarDays} value={range} onChange={setRange} options={(Object.keys(rangeLabels) as Range[]).map((r) => ({ value: r, label: rangeLabels[r] }))} active={range !== DEFAULT_RANGE} />
                <FilterSelect
                  label="Method"
                  value={method}
                  onChange={setMethod}
                  options={[{ value: "any", label: "All methods" }, ...(Object.keys(payLabels) as PayMethod[]).map((m) => ({ value: m, label: payLabels[m] }))]}
                  active={method !== "any"}
                />
                <FilterSelect
                  label="Type"
                  value={kind}
                  onChange={setKind}
                  options={[{ value: "any", label: "All types" }, ...(Object.keys(paymentKindLabels) as PaymentKind[]).map((k) => ({ value: k, label: paymentKindLabels[k] }))]}
                  active={kind !== "any"}
                />
              </div>
              <FilterPopover active={chips.length} applyLabel={t("Show {n} results", { n: filtered.length })} onClear={clearFilters} className="lg:hidden">
                <ChoiceGroup label="Date range" value={range} onChange={setRange} options={(Object.keys(rangeLabels) as Range[]).map((r) => ({ value: r, label: t(rangeLabels[r]) }))} />
                <ChoiceGroup
                  label="Method"
                  value={method}
                  onChange={setMethod}
                  options={[{ value: "any", label: t("All") }, ...(Object.keys(payLabels) as PayMethod[]).map((m) => ({ value: m, label: t(payLabels[m]) }))]}
                />
                <ChoiceGroup
                  label="Type"
                  value={kind}
                  onChange={setKind}
                  options={[{ value: "any", label: t("All") }, ...(Object.keys(paymentKindLabels) as PaymentKind[]).map((k) => ({ value: k, label: t(paymentKindLabels[k]) }))]}
                />
              </FilterPopover>
            </div>
            {(chips.length > 0 || !!q.trim()) && <FilterChips count={filtered.length} chips={chips} onClear={clearAll} className="mt-2" />}
          </div>
        )}

        {tab === "transactions" &&
          (filtered.length === 0 ? (
            <Empty icon={Wallet} title="No transactions" text="Nothing matches this range and filters." />
          ) : (
            <>
              {/* Phones and tablets: one tappable row per payment instead of a sideways-scrolling table. */}
              <ul className="divide-y divide-neutral-100 lg:hidden">
                {page.rows.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setHistoryId(r.booking.id)}
                      className={cn("flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-sky-50/60", focusRing, "focus-visible:ring-inset focus-visible:ring-offset-0", r.void && "opacity-50")}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-neutral-900">{r.booking.guest.name}</p>
                        <p className="mt-0.5 truncate text-[13px] text-neutral-500">
                          {format(new Date(r.at), "dd MMM, h:mm a")} · {t(payLabels[r.method])}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={cn("font-semibold tabular-nums", r.kind === "refund" ? "text-violet-700" : "text-neutral-900", r.void && "line-through")}>
                          {r.kind === "refund" ? "−" : ""}
                          {taka(r.amount)}
                        </p>
                        {r.void ? (
                          <span className="text-[11px] font-semibold text-rose-600">{t("Voided")}</span>
                        ) : (
                          <span className={cn("rounded px-1.5 py-px text-[11px] font-semibold", kindTone(r.kind))}>{t(paymentKindLabels[r.kind])}</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[880px] text-sm">
                  <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-4 py-3">{t("Date")}</th>
                      <th className="px-4 py-3">{t("Booking")}</th>
                      <th className="px-4 py-3">{t("Type")}</th>
                      <th className="px-4 py-3">{t("Method")}</th>
                      <th className="px-4 py-3">{t("Reference")}</th>
                      <th className="px-4 py-3">{t("By")}</th>
                      <th className="px-4 py-3 text-right">{t("Amount")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {page.rows.map((r) => (
                      <tr key={r.id} className={cn(r.void && "opacity-50")}>
                        <td className="px-4 py-3 text-neutral-600">{format(new Date(r.at), "dd MMM, h:mm a")}</td>
                        {bookingCell(r.booking)}
                        <td className="px-4 py-3">
                          <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", kindTone(r.kind))}>
                            {t(paymentKindLabels[r.kind])}
                          </span>
                          {r.void && <span className="ml-1.5 text-xs text-rose-600">{t("Voided")}</span>}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">{t(payLabels[r.method])}</td>
                        <td className="max-w-48 truncate px-4 py-3 font-mono text-xs text-neutral-500">{r.ref ?? "—"}</td>
                        <td className="px-4 py-3 text-neutral-600">{r.by}</td>
                        <td className={cn("px-4 py-3 text-right font-semibold tabular-nums", r.kind === "refund" ? "text-violet-700" : "text-neutral-900", r.void && "line-through")}>
                          {r.kind === "refund" ? "−" : ""}
                          {taka(r.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pager {...page} noun="transactions" />
            </>
          ))}

        {tab === "outstanding" &&
          (outstandingSorted.length === 0 ? (
            <Empty icon={FileText} title="Nothing outstanding" text="Every in-house and departed guest has settled." />
          ) : (
            <>
              <ul className="divide-y divide-neutral-100 lg:hidden">
                {outstandingSorted.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 px-4 py-3">
                    <button type="button" onClick={() => setHistoryId(b.id)} className={cn("min-w-0 flex-1 rounded-sm text-left", focusRing)}>
                      <p className="truncate font-semibold text-neutral-900">{b.guest.name}</p>
                      <p className="mt-1 flex min-w-0 items-center gap-2 text-[13px] text-neutral-500">
                        <StatusBadge status={b.status} className="shrink-0" />
                        <span className="truncate">{shortRange(b.checkIn, b.checkOut)}</span>
                      </p>
                    </button>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <p className="font-semibold tabular-nums text-rose-600">{taka(dueOf(b))}</p>
                      <button onClick={() => setAction({ booking: b, kind: "payment" })} className={cn(hbtn.small, "border-emerald-200 text-emerald-700")}>
                        {t("Collect")}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-4 py-3">{t("Booking")}</th>
                      <th className="px-4 py-3">{t("Status")}</th>
                      <th className="px-4 py-3">{t("Stay")}</th>
                      <th className="px-4 py-3 text-right">{t("Total")}</th>
                      <th className="px-4 py-3 text-right">{t("Paid")}</th>
                      <th className="px-4 py-3 text-right">{t("Due")}</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {outstandingSorted.map((b) => (
                      <tr key={b.id}>
                        {bookingCell(b)}
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} />
                          {b.status === "checked-out" && <p className="mt-0.5 text-[11px] text-rose-600">{t("Left without settling")}</p>}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">{rangeLabel(b.checkIn, b.checkOut)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{taka(folioTotal(b))}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{taka(paidOf(b))}</td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-rose-600">{taka(dueOf(b))}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setAction({ booking: b, kind: "payment" })} className={cn(hbtn.small, "border-emerald-200 text-emerald-700")}>
                            {t("Collect")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ))}

        {tab === "refunds" &&
          (refunds.length === 0 ? (
            <Empty icon={Undo2} title="No refunds due" text="Cancelled and overpaid bookings needing money back show up here." />
          ) : (
            <>
              <ul className="divide-y divide-neutral-100 lg:hidden">
                {refunds.map((b) => {
                  const first = b.payments.find((p) => !p.void && p.kind !== "refund");
                  return (
                    <li key={b.id} className="flex items-center gap-3 px-4 py-3">
                      <button type="button" onClick={() => setHistoryId(b.id)} className={cn("min-w-0 flex-1 rounded-sm text-left", focusRing)}>
                        <p className="truncate font-semibold text-neutral-900">{b.guest.name}</p>
                        <p className="mt-1 flex min-w-0 items-center gap-2 text-[13px] text-neutral-500">
                          <StatusBadge status={b.status} className="shrink-0" />
                          {first && <span className="truncate">{t(payLabels[first.method])}</span>}
                        </p>
                      </button>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <p className="font-semibold tabular-nums text-violet-700">{taka(creditOf(b))}</p>
                        {canRefund ? (
                          <button onClick={() => setAction({ booking: b, kind: "refund" })} className={cn(hbtn.small, "border-violet-200 text-violet-700")}>
                            {t("Refund")}
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-400">{t("Manager only")}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-4 py-3">{t("Booking")}</th>
                      <th className="px-4 py-3">{t("Status")}</th>
                      <th className="px-4 py-3">{t("Paid via")}</th>
                      <th className="px-4 py-3 text-right">{t("Paid")}</th>
                      <th className="px-4 py-3 text-right">{t("Fee kept")}</th>
                      <th className="px-4 py-3 text-right">{t("To refund")}</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {refunds.map((b) => {
                      const first = b.payments.find((p) => !p.void && p.kind !== "refund");
                      return (
                        <tr key={b.id}>
                          {bookingCell(b)}
                          <td className="px-4 py-3">
                            <StatusBadge status={b.status} />
                            <p className="mt-0.5 text-[11px] text-neutral-500">{dateLabel(b.checkIn, "dd MMM yyyy")}</p>
                          </td>
                          <td className="px-4 py-3 text-neutral-700">
                            {first ? t(payLabels[first.method]) : "—"}
                            {first?.ref && <p className="font-mono text-[11px] text-neutral-400">{first.ref}</p>}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">{taka(paidOf(b))}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{taka(b.cancellationFee ?? 0)}</td>
                          <td className="px-4 py-3 text-right font-semibold tabular-nums text-violet-700">{taka(creditOf(b))}</td>
                          <td className="px-4 py-3 text-right">
                            {canRefund ? (
                              <button onClick={() => setAction({ booking: b, kind: "refund" })} className={cn(hbtn.small, "border-violet-200 text-violet-700")}>
                                {t("Refund")}
                              </button>
                            ) : (
                              <span className="text-xs text-neutral-400">{t("Manager only")}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ))}
      </div>

      {historyId && (() => {
        const hb = db.bookings.find((b) => b.id === historyId);
        return hb ? (
          <PaymentHistory
            b={hb}
            canRefund={canRefund}
            onClose={() => setHistoryId(null)}
            onAction={(kind) => setAction({ booking: hb, kind })}
            busy={!!action}
          />
        ) : null;
      })()}
      {action && <PaymentModal booking={db.bookings.find((b) => b.id === action.booking.id) ?? action.booking} kind={action.kind} onClose={() => setAction(null)} />}
    </div>
  );
}

/** A select that turns blue while it narrows the list. */
function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  active,
  icon: Icon,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  active: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const t = useT();
  return (
    <label className="relative">
      <span className="sr-only">{t(label)}</span>
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          "h-10 appearance-none rounded-md border bg-white pr-9 text-sm outline-none transition focus:ring-2 focus:ring-sky-100",
          Icon ? "pl-9" : "pl-3",
          active ? "border-sky-500 bg-sky-50 font-medium text-sky-900" : "border-neutral-300 text-neutral-800 hover:border-sky-400"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.label)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden />
    </label>
  );
}

/** Side panel with every payment on one booking, and the refund or collect action — no trip to the booking page. */
function PaymentHistory({
  b,
  canRefund,
  onClose,
  onAction,
  busy,
}: {
  b: Booking;
  canRefund: boolean;
  onClose: () => void;
  onAction: (k: PaymentKind) => void;
  /** A refund or collect dialog is open on top; Escape belongs to it. */
  busy: boolean;
}) {
  const t = useT();
  const due = dueOf(b);
  const credit = creditOf(b);
  const paid = paidOf(b);
  const refunded = refundedOf(b);
  const payments = [...b.payments].sort((x, y) => y.at.localeCompare(x.at));

  useEffect(() => {
    if (busy) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  return (
    <div className="fixed inset-0 z-50 print:hidden" role="dialog" aria-modal="true" aria-label={`${t("Payment history")} · ${b.code}`}>
      <button aria-label={t("Close")} onClick={onClose} className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[1px]" />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
        <header className="flex items-start justify-between gap-3 border-b border-neutral-100 px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-sm font-semibold text-sky-700">{b.code}</p>
            <h2 className="truncate text-lg font-semibold text-neutral-900">{b.guest.name}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-neutral-500">
              <StatusBadge status={b.status} />
              {rangeLabel(b.checkIn, b.checkOut)} · {b.roomName}
            </p>
          </div>
          <button onClick={onClose} aria-label={t("Close")} className={cn(hbtn.icon, "shrink-0")}>
            <X className="size-5" />
          </button>
        </header>

        <div className="grid grid-cols-3 gap-px border-b border-neutral-100 bg-neutral-100 text-center">
          {[
            [t("Total"), taka(folioTotal(b)), "text-neutral-900"],
            [t("Paid"), taka(paid), "text-emerald-700"],
            credit > 0 ? [t("To refund"), taka(credit), "text-violet-700"] : [t("Balance"), taka(due), due > 0 ? "text-rose-600" : "text-neutral-900"],
          ].map(([k, v, tone]) => (
            <div key={k} className="bg-white px-3 py-3">
              <p className="text-xs text-neutral-500">{k}</p>
              <p className={cn("mt-0.5 font-semibold tabular-nums", tone)}>{v}</p>
            </div>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("Payment history")}</h3>
            {refunded > 0 && <span className="text-xs text-violet-700">{t("{amount} refunded", { amount: taka(refunded) })}</span>}
          </div>
          {payments.length === 0 ? (
            <p className="mt-3 rounded-md border border-dashed border-neutral-200 px-3 py-6 text-center text-sm text-neutral-500">{t("No payments yet.")}</p>
          ) : (
            <ol className="relative mt-3 space-y-4 border-l border-neutral-200 pl-5">
              {payments.map((p) => {
                const refund = p.kind === "refund";
                return (
                  <li key={p.id} className="relative">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-[27px] top-0.5 flex size-3.5 items-center justify-center rounded-full ring-4 ring-white",
                        p.void ? "bg-neutral-300" : refund ? "bg-violet-500" : "bg-emerald-500"
                      )}
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-1.5 text-sm">
                          <span className={cn("font-medium", p.void ? "text-neutral-400 line-through" : "text-neutral-900")}>{t(payLabels[p.method])}</span>
                          <span className={cn("rounded px-1.5 py-px text-[11px] font-semibold", kindTone(p.kind))}>
                            {t(paymentKindLabels[p.kind])}
                          </span>
                          {p.void && <span className="rounded bg-rose-50 px-1.5 py-px text-[11px] font-semibold text-rose-700">{t("Voided")}</span>}
                        </p>
                        {p.ref && <p className="truncate font-mono text-xs text-neutral-500">{p.ref}</p>}
                        <p className="text-xs text-neutral-500">
                          {formatDateTime(p.at)} · {p.by}
                        </p>
                        {p.void && <p className="text-xs text-rose-700">{p.void.reason}</p>}
                      </div>
                      <span className={cn("shrink-0 text-sm font-semibold tabular-nums", p.void ? "text-neutral-400 line-through" : refund ? "text-violet-700" : "text-neutral-900")}>
                        {refund ? "−" : ""}
                        {taka(p.amount)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {(credit > 0 && canRefund) || due > 0 ? (
          <footer className="border-t border-neutral-100 p-4">
            {credit > 0 && canRefund ? (
              <button onClick={() => onAction("refund")} className={cn(hbtn.primary, "h-11 w-full bg-violet-600 hover:bg-violet-700")}>
                <Undo2 className="size-4" /> {t("Refund")} {taka(credit)}
              </button>
            ) : (
              <button onClick={() => onAction("payment")} className={cn(hbtn.primary, "h-11 w-full")}>
                <Wallet className="size-4" /> {t("Collect")} {taka(due)}
              </button>
            )}
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
