"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { orderDue, useGadgetDB } from "@/src/lib/gadget-store/store";
import type { OrderStatus } from "@/src/lib/gadget-store/types";
import { formatDateTime, formatTaka, paymentLabels, statusLabels } from "@/src/lib/gadget-store/format";
import { StatusBadge } from "../shared";
import { AdminHeader, Pills, SearchInput, Table, td, th } from "./kit";

type Filter = "all" | OrderStatus;

export default function AdminOrders({ preorders = false }: { preorders?: boolean }) {
  const db = useGadgetDB();
  const params = useSearchParams();
  const [status, setStatus] = useState<Filter>((params.get("status") as Filter) ?? "all");
  const [q, setQ] = useState("");

  const base = db.orders.filter((o) => (preorders ? o.type === "preorder" : o.type === "regular"));
  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return base.filter(
      (o) =>
        (status === "all" || o.status === status) &&
        (!term ||
          o.id.toLowerCase().includes(term) ||
          o.customer.name.toLowerCase().includes(term) ||
          o.customer.phone.replace(/\D/g, "").includes(term.replace(/\D/g, "") || "§"))
    );
  }, [base, status, q]);

  const statuses: Filter[] = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  return (
    <>
      <AdminHeader
        title={preorders ? "Pre-orders" : "Orders"}
        subtitle={
          preorders
            ? "Deposits received for upcoming launches. Deliver after launch to collect the balance."
            : "Online orders from the storefront"
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Pills<Filter>
          value={status}
          onChange={setStatus}
          options={statuses.map((s) => ({
            value: s,
            label: s === "all" ? "All" : statusLabels[s],
            count: s === "all" ? base.length : base.filter((o) => o.status === s).length,
          }))}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Search order, name or phone" />
      </div>
      <Table>
        <thead className="bg-neutral-50">
          <tr>
            <th className={th}>Order</th>
            <th className={th}>Customer</th>
            <th className={th}>Items</th>
            <th className={th}>{preorders ? "Launch" : "Placed"}</th>
            <th className={th}>Payment</th>
            <th className={th}>Status</th>
            <th className={`${th} text-right`}>Total</th>
            <th className={`${th} text-right`}>Due</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {shown.map((o) => (
            <tr key={o.id} className="hover:bg-neutral-50">
              <td className={td}>
                <Link href={`/gadgets/admin/orders/${o.id}`} className="font-semibold text-neutral-900 hover:text-orange-600">
                  {o.id}
                </Link>
              </td>
              <td className={td}>
                <p className="font-medium text-neutral-900">{o.customer.name}</p>
                <p className="text-xs text-neutral-500">
                  {o.customer.phone} · {o.customer.city}
                </p>
              </td>
              <td className={td}>
                <p className="line-clamp-1 max-w-56">{o.items.map((l) => `${l.name}${l.qty > 1 ? ` ×${l.qty}` : ""}`).join(", ")}</p>
              </td>
              <td className={`${td} whitespace-nowrap`}>{preorders && o.releaseDate ? o.releaseDate : formatDateTime(o.createdAt)}</td>
              <td className={td}>{paymentLabels[o.paymentMethod]}</td>
              <td className={td}>
                <StatusBadge status={o.status} />
              </td>
              <td className={`${td} text-right font-semibold tabular-nums`}>{formatTaka(o.total)}</td>
              <td className={`${td} text-right tabular-nums ${orderDue(o) && o.status !== "cancelled" ? "text-rose-600" : "text-neutral-400"}`}>
                {o.status === "cancelled" ? "—" : formatTaka(orderDue(o))}
              </td>
            </tr>
          ))}
          {shown.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-sm text-neutral-500">
                No orders match.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}
