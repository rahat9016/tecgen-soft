"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarClock, MessageSquare, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { useGadgetDB } from "@/src/lib/gadget-store/store";
import { computeLedger, dailySales } from "@/src/lib/gadget-store/accounts";
import { formatDateTime, formatTaka } from "@/src/lib/gadget-store/format";
import { AdminHeader, Card, daysAgoStart, Pills, StatCard, Table, td, th } from "@/src/components/gadgets/admin/kit";
import { RankBars, SalesBars } from "@/src/components/gadgets/admin/charts";
import { StatusBadge } from "@/src/components/gadgets/shared";

type Range = "7" | "30";

export default function AdminDashboard() {
  const db = useGadgetDB();
  const [range, setRange] = useState<Range>("30");
  const days = Number(range);

  const ledger = useMemo(() => computeLedger(db, daysAgoStart(days)), [db, days]);
  const daily = useMemo(() => dailySales(db, days), [db, days]);
  const lowStock = db.products.filter((p) => p.active && !p.preOrder && p.stock <= 8).sort((a, b) => a.stock - b.stock);
  const pending = db.orders.filter((o) => o.status === "pending");
  const unread = db.chats.filter((t) => t.adminUnread > 0);

  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle="Sales, orders and stock at a glance"
        actions={
          <Pills<Range>
            value={range}
            onChange={setRange}
            options={[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
            ]}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TrendingUp} tone="orange" label="Total sales" value={formatTaka(ledger.sales)} hint={`Online ${formatTaka(ledger.onlineSales)} · Counter ${formatTaka(ledger.counterSales)}`} />
        <StatCard icon={Wallet} tone="green" label="Net profit" value={formatTaka(ledger.netProfit)} hint={`Gross margin ${(ledger.grossMargin * 100).toFixed(1)}%`} />
        <StatCard icon={ShoppingCart} label="Orders" value={ledger.saleOrders.length + ledger.memos.length} hint={`${ledger.saleOrders.length} online · ${ledger.memos.length} cash memos`} />
        <StatCard icon={CalendarClock} tone="violet" label="Pre-order advances" value={formatTaka(ledger.advances)} hint={`${ledger.preOrders.length} active pre-orders`} />
      </div>

      <div className="mt-6 grid gap-6 [&>*]:min-w-0 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-semibold text-neutral-900">Daily sales</h2>
            <p className="text-xs text-neutral-500">Online + counter, ৳</p>
          </div>
          <SalesBars data={daily} />
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold text-neutral-900">Sales by category</h2>
          <RankBars rows={ledger.categorySales.slice(0, 7)} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 [&>*]:min-w-0 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Latest orders</h2>
            <Link href="/gadgets/admin/orders" className="text-sm text-orange-600 hover:underline">
              All orders
            </Link>
          </div>
          <Table className="border-0">
            <thead>
              <tr>
                <th className={th}>Order</th>
                <th className={th}>Customer</th>
                <th className={th}>Placed</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {db.orders.slice(0, 6).map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50">
                  <td className={td}>
                    <Link href={`/gadgets/admin/orders/${o.id}`} className="font-semibold text-neutral-900 hover:text-orange-600">
                      {o.id}
                    </Link>
                  </td>
                  <td className={td}>{o.customer.name}</td>
                  <td className={td}>{formatDateTime(o.createdAt)}</td>
                  <td className={td}>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className={`${td} text-right font-semibold tabular-nums`}>{formatTaka(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold text-neutral-900">Needs attention</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/gadgets/admin/orders?status=pending" className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2.5 text-amber-800">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="size-4" /> Pending orders
                  </span>
                  <b>{pending.length}</b>
                </Link>
              </li>
              <li>
                <Link href="/gadgets/admin/chat" className="flex items-center justify-between rounded-xl bg-sky-50 px-3 py-2.5 text-sky-800">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="size-4" /> Unread chats
                  </span>
                  <b>{unread.length}</b>
                </Link>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2.5 text-rose-800">
                <span className="flex items-center gap-2">
                  <Wallet className="size-4" /> Receivable (due)
                </span>
                <b>{formatTaka(ledger.receivable)}</b>
              </li>
            </ul>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
                <AlertTriangle className="size-4 text-amber-500" /> Low stock
              </h2>
              <Link href="/gadgets/admin/products?stock=low" className="text-sm text-orange-600 hover:underline">
                Manage
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-neutral-100">
              {lowStock.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" className="size-9 rounded-lg object-cover" />
                  <Link href={`/gadgets/admin/products/${p.id}`} className="line-clamp-1 flex-1 text-sm text-neutral-700 hover:text-orange-600">
                    {p.name}
                  </Link>
                  <span className={`text-sm font-semibold tabular-nums ${p.stock === 0 ? "text-rose-600" : "text-amber-600"}`}>
                    {p.stock} left
                  </span>
                </li>
              ))}
              {lowStock.length === 0 && <li className="py-2 text-sm text-neutral-500">All products well stocked.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
