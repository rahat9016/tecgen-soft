"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, Download, Landmark, Plus, Scale, Trash2, Wallet } from "lucide-react";
import { toast } from "react-toastify";
import { addExpense, deleteExpense, useGadgetDB } from "@/src/lib/gadget-store/store";
import { computeLedger } from "@/src/lib/gadget-store/accounts";
import type { ExpenseCategory } from "@/src/lib/gadget-store/types";
import { formatDate, formatTaka, paymentLabels } from "@/src/lib/gadget-store/format";
import { AdminHeader, btn, Card, daysAgoStart, Modal, Pills, StatCard } from "@/src/components/gadgets/admin/kit";
import { RankBars } from "@/src/components/gadgets/admin/charts";
import { Field, inputClass } from "@/src/components/gadgets/shared";

type Range = "month" | "7" | "30" | "90";
const expenseCategories: ExpenseCategory[] = ["Rent", "Salary", "Utility", "Marketing", "Purchase", "Transport", "Other"];

function rangeStart(r: Range) {
  if (r === "month") {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  }
  return daysAgoStart(Number(r));
}

export default function AccountsPage() {
  const db = useGadgetDB();
  const [range, setRange] = useState<Range>("30");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "Utility" as ExpenseCategory,
    amount: "",
    note: "",
  });

  const L = useMemo(() => computeLedger(db, rangeStart(range)), [db, range]);

  const receivables = [
    ...L.saleOrders.filter((o) => o.total > o.paid).map((o) => ({ id: o.id, href: `/gadgets/admin/orders/${o.id}`, who: o.customer.name, date: o.createdAt, due: o.total - o.paid, kind: "Online order" })),
    ...L.memos.filter((m) => m.total > m.paid).map((m) => ({ id: m.id, href: `/gadgets/admin/cash-memo/${m.id}`, who: m.customerName || "Walk-in", date: m.createdAt, due: m.total - m.paid, kind: "Cash memo" })),
  ].sort((a, b) => b.due - a.due);

  const pl: [string, number, "add" | "sub" | "total"][] = [
    ["Online sales", L.onlineSales, "add"],
    ["Counter sales (cash memos)", L.counterSales, "add"],
    ["Net sales", L.sales, "total"],
    ["Cost of goods sold", -L.costOfGoods, "sub"],
    ["Gross profit", L.grossProfit, "total"],
    ...L.expenseByCategory.map(([c, v]) => [`${c} expense`, -v, "sub"] as [string, number, "sub"]),
    ["Net profit", L.netProfit, "total"],
  ];

  const exportCsv = () => {
    const rows = [
      ["Date", "Type", "Reference", "Party / Note", "Method", "Amount", "Received", "Due"],
      ...L.saleOrders.map((o) => [o.createdAt.slice(0, 10), "Online order", o.id, o.customer.name, paymentLabels[o.paymentMethod], o.total, o.paid, o.total - o.paid]),
      ...L.preOrders.map((o) => [o.createdAt.slice(0, 10), "Pre-order deposit", o.id, o.customer.name, paymentLabels[o.paymentMethod], o.paid, o.paid, 0]),
      ...L.memos.map((m) => [m.createdAt.slice(0, 10), "Cash memo", m.id, m.customerName || "Walk-in", paymentLabels[m.paymentMethod], m.total, m.paid, m.total - m.paid]),
      ...L.expenses.map((e) => [e.date.slice(0, 10), `Expense: ${e.category}`, e.id, e.note, "", -e.amount, -e.amount, 0]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `gadgethub-ledger-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AdminHeader
        title="Accounts"
        subtitle="Profit & loss, cash flow, dues and expenses"
        actions={
          <>
            <Pills<Range>
              value={range}
              onChange={setRange}
              options={[
                { value: "month", label: "This month" },
                { value: "7", label: "7 days" },
                { value: "30", label: "30 days" },
                { value: "90", label: "90 days" },
              ]}
            />
            <button onClick={exportCsv} className={btn.outline}>
              <Download className="size-4" /> Export CSV
            </button>
            <button onClick={() => setOpen(true)} className={btn.primary}>
              <Plus className="size-4" /> Add expense
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ArrowUpCircle} tone="orange" label="Net sales" value={formatTaka(L.sales)} hint={`Gross margin ${(L.grossMargin * 100).toFixed(1)}%`} />
        <StatCard icon={ArrowDownCircle} tone="rose" label="Expenses" value={formatTaka(L.totalExpenses)} hint={`${L.expenses.length} entries`} />
        <StatCard icon={Scale} tone={L.netProfit >= 0 ? "green" : "rose"} label="Net profit" value={formatTaka(L.netProfit)} hint={L.sales ? `${((L.netProfit / L.sales) * 100).toFixed(1)}% of sales` : undefined} />
        <StatCard icon={Wallet} label="Cash position" value={formatTaka(L.collected + L.advances - L.totalExpenses)} hint="Collected + advances − expenses" />
      </div>

      <div className="mt-6 grid gap-6 [&>*]:min-w-0 xl:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-neutral-900">Profit & loss statement</h2>
          <table className="mt-4 w-full text-sm">
            <tbody>
              {pl.map(([label, value, kind]) => (
                <tr key={label} className={kind === "total" ? "border-t border-neutral-200 font-semibold text-neutral-900" : "text-neutral-600"}>
                  <td className={`py-2 ${kind === "sub" || kind === "add" ? "pl-4" : ""}`}>{label}</td>
                  <td className={`py-2 text-right tabular-nums ${kind === "total" && value < 0 ? "text-rose-600" : ""}`}>{formatTaka(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-neutral-500">
            Pre-order deposits ({formatTaka(L.advances)}) are held as customer advances, not sales, until delivery. Delivery charges included in online sales: {formatTaka(L.deliveryIncome)}.
          </p>
        </Card>

        <Card>
          <h2 className="font-semibold text-neutral-900">Cash flow</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {(
              [
                ["Collected from sales", L.collected, "text-emerald-700"],
                ["Pre-order advances", L.advances, "text-violet-700"],
                ["Paid out (expenses)", -L.totalExpenses, "text-rose-600"],
                ["Receivable (due)", L.receivable, "text-amber-600"],
              ] as const
            ).map(([k, v, c]) => (
              <div key={k} className="rounded-xl bg-neutral-50 p-3">
                <dt className="text-xs text-neutral-500">{k}</dt>
                <dd className={`mt-1 text-lg font-bold tabular-nums ${c}`}>{formatTaka(v)}</dd>
              </div>
            ))}
          </dl>
          <h3 className="mb-3 mt-6 flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <Landmark className="size-4" /> Collections by payment method
          </h3>
          <RankBars rows={L.byMethod.map(([m, v]) => [paymentLabels[m], v])} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 [&>*]:min-w-0 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-neutral-900">Receivables</h2>
          <ul className="divide-y divide-neutral-100">
            {receivables.slice(0, 10).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div>
                  <Link href={r.href} className="font-medium text-neutral-900 hover:text-orange-600">
                    {r.id}
                  </Link>
                  <p className="text-xs text-neutral-500">
                    {r.kind} · {r.who} · {formatDate(r.date)}
                  </p>
                </div>
                <span className="font-semibold tabular-nums text-rose-600">{formatTaka(r.due)}</span>
              </li>
            ))}
            {receivables.length === 0 && <li className="py-3 text-sm text-neutral-500">No outstanding dues.</li>}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-neutral-900">Expenses</h2>
          <ul className="max-h-96 divide-y divide-neutral-100 overflow-y-auto">
            {L.expenses.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="w-20 shrink-0 rounded-lg bg-neutral-100 px-2 py-1 text-center text-xs font-medium text-neutral-700">{e.category}</span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-neutral-900">{e.note || e.category}</p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(e.date)}
                  </p>
                </div>
                <span className="font-semibold tabular-nums">{formatTaka(e.amount)}</span>
                <button
                  className={btn.ghostDanger}
                  aria-label="Delete expense"
                  onClick={() => confirm("Delete this expense?") && deleteExpense(e.id)}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
            {L.expenses.length === 0 && <li className="py-3 text-sm text-neutral-500">No expenses in this period.</li>}
          </ul>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add expense">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const amount = Math.round(Number(form.amount));
            if (!amount || amount <= 0) return toast.error("Enter an amount");
            addExpense({ ...form, amount, date: new Date(`${form.date}T12:00:00`).toISOString() });
            toast.success("Expense added");
            setOpen(false);
            setForm((f) => ({ ...f, amount: "", note: "" }));
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field label="Date">
            <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Amount (৳)">
            <input type="number" min={1} required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })} className={inputClass}>
              {expenseCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Note" className="sm:col-span-2">
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputClass} placeholder="e.g. October electricity bill" />
          </Field>
          <button className={`${btn.primary} sm:col-span-2`}>Save expense</button>
        </form>
      </Modal>
    </>
  );
}
