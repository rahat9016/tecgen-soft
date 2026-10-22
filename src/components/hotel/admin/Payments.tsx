"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarDays, ChevronDown, FileText, Search, Undo2, Wallet, X } from "lucide-react";
import { can } from "@/src/lib/hotel-store/auth";
import { dateLabel, formatDateTime, payLabels, paymentKindLabels, rangeLabel, shiftDay, taka, todayKey } from "@/src/lib/hotel-store/format";
import { ledger } from "@/src/lib/hotel-store/reports";
import { creditOf, dueOf, folioTotal, paidOf, refundedOf, useCurrentStaff, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Booking, PaymentKind, PayMethod } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { PaymentModal } from "./BookingModals";
import { MoneyCard } from "./MoneyCard";
import { Empty, hbtn, Pager, StatusBadge, tableCardClass, Tabs, usePagination } from "./ui";

type Tab = "transactions" | "outstanding" | "refunds";
type Range = "today" | "7d" | "30d" | "month" | "all";

const rangeStart = (r: Range, today: string) =>
  r === "today" ? today : r === "7d" ? shiftDay(today, -6) : r === "30d" ? shiftDay(today, -29) : r === "month" ? `${today.slice(0, 8)}01` : "";

export default function Payments() {
  const db = useHotelDB();
  const staff = useCurrentStaff();
  const params = useSearchParams();
  const initial = params.get("tab");
  const [tab, setTab] = useState<Tab>(initial === "refunds" || initial === "outstanding" ? initial : "transactions");
  const [range, setRange] = useState<Range>("30d");
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
  const depositsHeld = db.bookings.filter((b) => (b.status === "confirmed" || b.status === "pending") && b.checkIn > today).reduce((s, b) => s + paidOf(b), 0);

  const rangeOptions: { value: Range; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "month", label: "This month" },
    { value: "all", label: "All time" },
  ];

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
      <div className="mb-4 grid grid-cols-2 gap-4 xl:grid-cols-5">
        <MoneyCard index={0} label="Collected today" value={net(rows.filter((r) => r.day === today))} hint="Net of refunds" icon="wallet" tone="green" />
        <MoneyCard index={1} label="This month" value={net(monthRows)} hint={`${monthRows.filter((r) => !r.void).length} transactions`} icon="calendar" tone="sky" />
        <MoneyCard index={2} label="Outstanding" value={outstanding.reduce((s, b) => s + dueOf(b), 0)} hint={`${outstanding.length} folios with a balance`} icon="bill" tone="rose" />
        <MoneyCard index={3} label="Refunds due" value={refunds.reduce((s, b) => s + creditOf(b), 0)} hint={`${refunds.length} booking${refunds.length === 1 ? "" : "s"}`} icon="refund" tone="violet" />
        <MoneyCard index={4} label="Advance deposits held" value={depositsHeld} hint="Paid on future stays" icon="vault" tone="slate" />
      </div>

      <div className={tableCardClass}>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "transactions", label: "Transactions", count: inRange.length },
            { value: "outstanding", label: "Outstanding", count: outstanding.length },
            { value: "refunds", label: "Refunds due", count: refunds.length, dot: refunds.length ? "bg-violet-500" : undefined },
          ]}
        />

        {tab === "transactions" && (
          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 p-3 sm:px-4">
            {tab === "transactions" && (
              <>
                <label className="relative min-w-56 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden />
                  <input
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search booking, guest or TrxID"
                    aria-label="Search payments"
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
                <FilterSelect label="Method" value={method} onChange={setMethod} options={[{ value: "any", label: "All methods" }, ...(Object.keys(payLabels) as PayMethod[]).map((m) => ({ value: m, label: payLabels[m] }))]} />
                <FilterSelect label="Type" value={kind} onChange={setKind} options={[{ value: "any", label: "All types" }, ...(Object.keys(paymentKindLabels) as PaymentKind[]).map((k) => ({ value: k, label: paymentKindLabels[k] }))]} />
              </>
            )}
            <div className="ml-auto">
              <FilterSelect label="Date range" icon={CalendarDays} value={range} onChange={setRange} options={rangeOptions} />
            </div>
          </div>
        )}

        {tab === "transactions" &&
          (filtered.length === 0 ? (
            <Empty icon={Wallet} title="No transactions" text="Nothing matches this range and filters." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-sm">
                  <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Booking</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">By</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {page.rows.map((r) => (
                      <tr key={r.id} className={cn(r.void && "opacity-50")}>
                        <td className="px-4 py-3 text-neutral-600">{format(new Date(r.at), "dd MMM, h:mm a")}</td>
                        {bookingCell(r.booking)}
                        <td className="px-4 py-3">
                          <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", r.kind === "refund" ? "bg-violet-50 text-violet-700" : r.kind === "deposit" ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700")}>
                            {paymentKindLabels[r.kind]}
                          </span>
                          {r.void && <span className="ml-1.5 text-xs text-rose-600">Voided</span>}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">{payLabels[r.method]}</td>
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Booking</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Stay</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Due</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {outstandingSorted.map((b) => (
                    <tr key={b.id}>
                      {bookingCell(b)}
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                        {b.status === "checked-out" && <p className="mt-0.5 text-[11px] text-rose-600">Left without settling</p>}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{rangeLabel(b.checkIn, b.checkOut)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{taka(folioTotal(b))}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{taka(paidOf(b))}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-rose-600">{taka(dueOf(b))}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setAction({ booking: b, kind: "payment" })} className={cn(hbtn.small, "border-emerald-200 text-emerald-700")}>
                          Collect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {tab === "refunds" &&
          (refunds.length === 0 ? (
            <Empty icon={Undo2} title="No refunds due" text="Cancelled and overpaid bookings needing money back show up here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Booking</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Paid via</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Fee kept</th>
                    <th className="px-4 py-3 text-right">To refund</th>
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
                          {first ? payLabels[first.method] : "—"}
                          {first?.ref && <p className="font-mono text-[11px] text-neutral-400">{first.ref}</p>}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{taka(paidOf(b))}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{taka(b.cancellationFee ?? 0)}</td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-violet-700">{taka(creditOf(b))}</td>
                        <td className="px-4 py-3 text-right">
                          {canRefund ? (
                            <button onClick={() => setAction({ booking: b, kind: "refund" })} className={cn(hbtn.small, "border-violet-200 text-violet-700")}>
                              Refund
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-400">Manager only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
  icon: Icon,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  icon?: React.ComponentType<{ className?: string }>;
}) {
  // An "any" choice means the filter is off; selects without one (like the date range) are never highlighted.
  const active = options.some((o) => o.value === "any") && value !== "any";
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          "h-10 appearance-none rounded-lg border bg-white pr-9 text-sm outline-none transition focus:ring-2 focus:ring-sky-100",
          Icon ? "pl-9" : "pl-3",
          active ? "border-sky-500 bg-sky-50 font-medium text-sky-900" : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
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
    <div className="fixed inset-0 z-50 print:hidden" role="dialog" aria-modal="true" aria-label={`Payment history for ${b.code}`}>
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[1px]" />
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
          <button onClick={onClose} aria-label="Close" className={cn(hbtn.icon, "shrink-0")}>
            <X className="size-5" />
          </button>
        </header>

        <div className="grid grid-cols-3 gap-px border-b border-neutral-100 bg-neutral-100 text-center">
          {[
            ["Total", taka(folioTotal(b)), "text-neutral-900"],
            ["Paid", taka(paid), "text-emerald-700"],
            credit > 0 ? ["To refund", taka(credit), "text-violet-700"] : ["Balance", taka(due), due > 0 ? "text-rose-600" : "text-neutral-900"],
          ].map(([k, v, tone]) => (
            <div key={k} className="bg-white px-3 py-3">
              <p className="text-xs text-neutral-500">{k}</p>
              <p className={cn("mt-0.5 font-semibold tabular-nums", tone)}>{v}</p>
            </div>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Payment history</h3>
            {refunded > 0 && <span className="text-xs text-violet-700">{taka(refunded)} refunded</span>}
          </div>
          {payments.length === 0 ? (
            <p className="mt-3 rounded-md border border-dashed border-neutral-200 px-3 py-6 text-center text-sm text-neutral-500">No payments yet.</p>
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
                          <span className={cn("font-medium", p.void ? "text-neutral-400 line-through" : "text-neutral-900")}>{payLabels[p.method]}</span>
                          <span className={cn("rounded px-1.5 py-px text-[11px] font-semibold", refund ? "bg-violet-50 text-violet-700" : p.kind === "deposit" ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700")}>
                            {paymentKindLabels[p.kind]}
                          </span>
                          {p.void && <span className="rounded bg-rose-50 px-1.5 py-px text-[11px] font-semibold text-rose-700">Voided</span>}
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
                <Undo2 className="size-4" /> Refund {taka(credit)}
              </button>
            ) : (
              <button onClick={() => onAction("payment")} className={cn(hbtn.primary, "h-11 w-full")}>
                <Wallet className="size-4" /> Collect {taka(due)}
              </button>
            )}
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
