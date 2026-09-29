"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, MessageSquare, ShoppingCart, UserPlus } from "lucide-react";
import { useGadgetDB } from "@/src/lib/gadget-store/store";
import { formatDate, formatTaka } from "@/src/lib/gadget-store/format";
import { AdminHeader, btn, SearchInput, Table, td, th } from "@/src/components/gadgets/admin/kit";

export default function CustomersPage() {
  const db = useGadgetDB();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return db.customers
      .map((c) => {
        const orders = db.orders.filter((o) => o.customerId === c.id && o.status !== "cancelled");
        return {
          c,
          count: orders.length,
          spent: orders.reduce((s, o) => s + o.paid, 0),
          due: orders.reduce((s, o) => s + Math.max(0, o.total - o.paid), 0),
          last: orders[0]?.createdAt,
        };
      })
      .filter(({ c }) => !term || `${c.name} ${c.phone} ${c.email} ${c.city}`.toLowerCase().includes(term))
      .sort((a, b) => b.spent - a.spent);
  }, [db, q]);

  return (
    <>
      <AdminHeader title="Customers" subtitle={`${db.customers.length} registered customers`} actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Search customers" />
            <Link href="/gadgets/admin/orders/new" className={btn.primary}>
              <UserPlus className="size-4" /> Order for new customer
            </Link>
          </>
        } />
      <Table>
        <thead className="bg-neutral-50">
          <tr>
            <th className={th}>Customer</th>
            <th className={th}>City</th>
            <th className={th}>Joined</th>
            <th className={`${th} text-right`}>Orders</th>
            <th className={`${th} text-right`}>Paid</th>
            <th className={`${th} text-right`}>Due</th>
            <th className={th}>Last order</th>
            <th className={th} />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map(({ c, count, spent, due, last }) => (
            <tr key={c.id} className="hover:bg-neutral-50">
              <td className={td}>
                <p className="font-medium text-neutral-900">{c.name}</p>
                <p className="text-xs text-neutral-500">
                  {c.phone} · {c.email}
                </p>
              </td>
              <td className={td}>{c.city}</td>
              <td className={td}>{formatDate(c.joinedAt)}</td>
              <td className={`${td} text-right tabular-nums`}>{count}</td>
              <td className={`${td} text-right font-semibold tabular-nums`}>{formatTaka(spent)}</td>
              <td className={`${td} text-right tabular-nums ${due ? "text-rose-600" : "text-neutral-400"}`}>{formatTaka(due)}</td>
              <td className={td}>{last ? formatDate(last) : "—"}</td>
              <td className={`${td} whitespace-nowrap text-right`}>
                <Link href={`/gadgets/admin/orders/new?c=${c.id}`} className={btn.ghost} aria-label={`New order for ${c.name}`} title="New order">
                  <ShoppingCart className="size-4" />
                </Link>
                <Link href={`/gadgets/admin/orders/new?type=preorder&c=${c.id}`} className={btn.ghost} aria-label={`New pre-order for ${c.name}`} title="New pre-order">
                  <CalendarClock className="size-4" />
                </Link>
                <Link href={`/gadgets/admin/chat?c=${c.id}`} className={btn.ghost} aria-label={`Chat with ${c.name}`}>
                  <MessageSquare className="size-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
