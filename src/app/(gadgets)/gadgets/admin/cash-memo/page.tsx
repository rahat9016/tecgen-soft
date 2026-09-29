"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, ReceiptText, Wallet } from "lucide-react";
import { useGadgetDB } from "@/src/lib/gadget-store/store";
import { formatDateTime, formatTaka, paymentLabels } from "@/src/lib/gadget-store/format";
import { AdminHeader, btn, daysAgoStart, Pills, SearchInput, StatCard, Table, td, th } from "@/src/components/gadgets/admin/kit";

type DueFilter = "all" | "due" | "paid";

export default function CashMemoListPage() {
  const db = useGadgetDB();
  const [due, setDue] = useState<DueFilter>("all");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return db.memos.filter(
      (m) =>
        (due === "all" || (due === "due" ? m.total > m.paid : m.total <= m.paid)) &&
        (!term || `${m.id} ${m.customerName} ${m.customerPhone}`.toLowerCase().includes(term))
    );
  }, [db.memos, due, q]);

  const todayStart = daysAgoStart(1);
  const today = db.memos.filter((m) => new Date(m.createdAt).getTime() >= todayStart);
  const totalDue = db.memos.reduce((s, m) => s + Math.max(0, m.total - m.paid), 0);

  return (
    <>
      <AdminHeader
        title="Cash Memo"
        subtitle="In-store counter sales"
        actions={
          <Link href="/gadgets/admin/cash-memo/new" className={btn.primary}>
            <Plus className="size-4" /> New cash memo
          </Link>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={ReceiptText} tone="orange" label="Today's counter sales" value={formatTaka(today.reduce((s, m) => s + m.total, 0))} hint={`${today.length} memos`} />
        <StatCard icon={Wallet} tone="green" label="Cash collected today" value={formatTaka(today.reduce((s, m) => s + m.paid, 0))} />
        <StatCard icon={Wallet} tone="rose" label="Outstanding due" value={formatTaka(totalDue)} hint={`${db.memos.filter((m) => m.total > m.paid).length} memos with balance`} />
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search memo, customer, phone" />
        <Pills<DueFilter>
          value={due}
          onChange={setDue}
          options={[
            { value: "all", label: "All" },
            { value: "due", label: "With due" },
            { value: "paid", label: "Fully paid" },
          ]}
        />
      </div>
      <Table>
        <thead className="bg-neutral-50">
          <tr>
            <th className={th}>Memo</th>
            <th className={th}>Date</th>
            <th className={th}>Customer</th>
            <th className={th}>Sold by</th>
            <th className={th}>Payment</th>
            <th className={`${th} text-right`}>Total</th>
            <th className={`${th} text-right`}>Due</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {shown.map((m) => (
            <tr key={m.id} className="hover:bg-neutral-50">
              <td className={td}>
                <Link href={`/gadgets/admin/cash-memo/${m.id}`} className="font-semibold text-neutral-900 hover:text-orange-600">
                  {m.id}
                </Link>
              </td>
              <td className={`${td} whitespace-nowrap`}>{formatDateTime(m.createdAt)}</td>
              <td className={td}>
                <p className="font-medium text-neutral-900">{m.customerName || "Walk-in"}</p>
                <p className="text-xs text-neutral-500">{m.customerPhone}</p>
              </td>
              <td className={td}>{m.soldBy}</td>
              <td className={td}>{paymentLabels[m.paymentMethod]}</td>
              <td className={`${td} text-right font-semibold tabular-nums`}>{formatTaka(m.total)}</td>
              <td className={`${td} text-right tabular-nums ${m.total > m.paid ? "text-rose-600" : "text-neutral-400"}`}>{formatTaka(Math.max(0, m.total - m.paid))}</td>
            </tr>
          ))}
          {shown.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-500">
                No memos match.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}
