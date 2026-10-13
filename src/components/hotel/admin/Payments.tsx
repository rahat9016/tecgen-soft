"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Banknote, Download, Hourglass, Receipt, Undo2, Wallet } from "lucide-react";
import { can } from "@/src/lib/hotel-store/auth";
import { dateLabel, downloadCsv, formatDateTime, payLabels, paymentKindLabels, rangeLabel, shiftDay, taka, todayKey } from "@/src/lib/hotel-store/format";
import { ledger } from "@/src/lib/hotel-store/reports";
import { creditOf, dueOf, folioTotal, paidOf, useCurrentStaff, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Booking, PaymentKind, PayMethod } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { PaymentModal } from "./BookingModals";
import { RankBars } from "./charts";
import { ADMIN, AdminHeader, Card, Empty, hbtn, Pager, SearchBox, Select, StatCard, StatusBadge, tableCardClass, Tabs, toolbarClass, usePagination } from "./ui";

type Tab = "transactions" | "outstanding" | "refunds" | "methods";
type Range = "today" | "7d" | "30d" | "month" | "all";

const rangeStart = (r: Range, today: string) =>
  r === "today" ? today : r === "7d" ? shiftDay(today, -6) : r === "30d" ? shiftDay(today, -29) : r === "month" ? `${today.slice(0, 8)}01` : "";

export default function Payments() {
  const db = useHotelDB();
  const staff = useCurrentStaff();
  const params = useSearchParams();
  const initial = params.get("tab");
  const [tab, setTab] = useState<Tab>(initial === "refunds" || initial === "outstanding" || initial === "methods" ? initial : "transactions");
  const [range, setRange] = useState<Range>("30d");
  const [method, setMethod] = useState<"any" | PayMethod>("any");
  const [kind, setKind] = useState<"any" | PaymentKind>("any");
  const [q, setQ] = useState("");
  const [action, setAction] = useState<{ booking: Booking; kind: PaymentKind } | null>(null);
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

  const byMethod = (Object.keys(payLabels) as PayMethod[])
    .map((m) => {
      const list = inRange.filter((r) => r.method === m && !r.void);
      return { label: payLabels[m], value: net(list), note: `${list.length} txn${list.length === 1 ? "" : "s"}` };
    })
    .filter((r) => r.value !== 0 || r.note !== "0 txns")
    .sort((a, b) => b.value - a.value);
  const byKind = (Object.keys(paymentKindLabels) as PaymentKind[]).map((k) => ({
    label: paymentKindLabels[k],
    value: inRange.filter((r) => r.kind === k && !r.void).reduce((s, r) => s + r.amount, 0),
  }));

  const exportCsv = () =>
    downloadCsv(`payments-${range}-${today}.csv`, [
      ["Date", "Booking", "Guest", "Type", "Method", "Reference", "Received by", "Amount", "Voided"],
      ...filtered.map((r) => [formatDateTime(r.at), r.booking.code, r.booking.guest.name, paymentKindLabels[r.kind], payLabels[r.method], r.ref ?? "", r.by, r.kind === "refund" ? -r.amount : r.amount, r.void ? `Yes — ${r.void.reason}` : ""]),
    ]);

  const rangeOptions: { value: Range; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "month", label: "This month" },
    { value: "all", label: "All time" },
  ];

  const bookingCell = (b: Booking) => (
    <td className="px-4 py-3">
      <Link href={`${ADMIN}/bookings/${b.id}`} className="font-mono font-semibold text-sky-700 hover:underline">
        {b.code}
      </Link>
      <p className="text-xs text-neutral-500">{b.guest.name}</p>
    </td>
  );

  return (
    <div>
      <AdminHeader
        title="Payments"
        subtitle="Every deposit, balance and refund across the hotel."
        actions={
          tab === "transactions" && (
            <button onClick={exportCsv} className={hbtn.outline}>
              <Download className="size-4" /> Export CSV
            </button>
          )
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-5">
        <StatCard label="Collected today" value={taka(net(rows.filter((r) => r.day === today)))} hint="Net of refunds" icon={Wallet} tone="green" />
        <StatCard label="This month" value={taka(net(monthRows))} hint={`${monthRows.filter((r) => !r.void).length} transactions`} icon={Banknote} tone="neutral" />
        <StatCard label="Outstanding" value={taka(outstanding.reduce((s, b) => s + dueOf(b), 0))} hint={`${outstanding.length} folios with a balance`} icon={Receipt} tone="orange" />
        <StatCard label="Refunds due" value={taka(refunds.reduce((s, b) => s + creditOf(b), 0))} hint={`${refunds.length} booking${refunds.length === 1 ? "" : "s"}`} icon={Undo2} tone="violet" />
        <StatCard label="Advance deposits held" value={taka(depositsHeld)} hint="Paid on future stays" icon={Hourglass} tone="neutral" />
      </div>

      <div className={tableCardClass}>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "transactions", label: "Transactions", count: inRange.length },
            { value: "outstanding", label: "Outstanding", count: outstanding.length },
            { value: "refunds", label: "Refunds due", count: refunds.length, dot: refunds.length ? "bg-violet-500" : undefined },
            { value: "methods", label: "By method" },
          ]}
        />

        {(tab === "transactions" || tab === "methods") && (
          <div className={toolbarClass}>
            <Select label="Date range" value={range} onChange={setRange} options={rangeOptions} />
            {tab === "transactions" && (
              <>
                <SearchBox value={q} onChange={setQ} placeholder="Search booking, guest, TrxID" />
                <Select label="Method" value={method} onChange={setMethod} options={[{ value: "any", label: "All methods" }, ...(Object.keys(payLabels) as PayMethod[]).map((m) => ({ value: m, label: payLabels[m] }))]} />
                <Select label="Type" value={kind} onChange={setKind} options={[{ value: "any", label: "All types" }, ...(Object.keys(paymentKindLabels) as PaymentKind[]).map((k) => ({ value: k, label: paymentKindLabels[k] }))]} />
                <span className="ml-auto text-sm text-neutral-600">
                  Net <b className="tabular-nums text-neutral-900">{taka(net(filtered))}</b>
                </span>
              </>
            )}
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
            <Empty icon={Receipt} title="Nothing outstanding" text="Every in-house and departed guest has settled." />
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

        {tab === "methods" && (
          <div className="grid gap-6 p-5 lg:grid-cols-2">
            <Card>
              <h3 className="mb-4 font-semibold text-neutral-900">Net by payment method</h3>
              {byMethod.length ? <RankBars rows={byMethod} /> : <p className="text-sm text-neutral-500">No payments in this range.</p>}
            </Card>
            <Card>
              <h3 className="mb-4 font-semibold text-neutral-900">By type</h3>
              <RankBars rows={byKind} />
            </Card>
          </div>
        )}
      </div>

      {action && <PaymentModal booking={db.bookings.find((b) => b.id === action.booking.id) ?? action.booking} kind={action.kind} onClose={() => setAction(null)} />}
    </div>
  );
}
