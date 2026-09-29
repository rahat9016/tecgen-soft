"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarClock, Plus } from "lucide-react";
import { orderDue, useGadgetDB } from "@/src/lib/gadget-store/store";
import type { OrderStatus } from "@/src/lib/gadget-store/types";
import { daysUntil, formatDate, formatDateTime, formatTaka, paymentLabels, statusLabels } from "@/src/lib/gadget-store/format";
import { StatusBadge } from "../shared";
import { AdminHeader, btn, Card, Pills, SearchInput, Table, td, th } from "./kit";

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

  // Reservations per upcoming product, so stock can be ordered from the supplier before launch.
  const reservations = useMemo(() => {
    if (!preorders) return [];
    const active = base.filter((o) => o.status !== "cancelled" && o.status !== "delivered");
    return db.products
      .filter((p) => p.preOrder)
      .map((p) => {
        const lines = active.flatMap((o) => o.items.filter((l) => l.productId === p.id).map((l) => ({ l, o })));
        return {
          p,
          units: lines.reduce((s, x) => s + x.l.qty, 0),
          orders: new Set(lines.map((x) => x.o.id)).size,
          deposits: [...new Set(lines.map((x) => x.o))].reduce((s, o) => s + o.paid, 0),
        };
      })
      .sort((a, b) => b.units - a.units || a.p.preOrder!.releaseDate.localeCompare(b.p.preOrder!.releaseDate));
  }, [preorders, base, db.products]);

  const statuses: Filter[] = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  return (
    <>
      <AdminHeader
        title={preorders ? "Pre-orders" : "Orders"}
        subtitle={
          preorders
            ? "Deposits received for upcoming launches. Deliver after launch to collect the balance."
            : "Online orders from the storefront and orders placed by staff"
        }
        actions={
          <Link
            href={preorders ? "/gadgets/admin/orders/new?type=preorder" : "/gadgets/admin/orders/new"}
            className={preorders ? `${btn.primary} bg-violet-600 hover:bg-violet-700` : btn.primary}
          >
            <Plus className="size-4" /> {preorders ? "New pre-order" : "New order"}
          </Link>
        }
      />
      {preorders && (
        <Card className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-neutral-900">
            <CalendarClock className="size-4 text-violet-600" /> Reservations by product
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {reservations.map(({ p, units, orders, deposits }) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-neutral-100 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-neutral-900">{p.name}</p>
                  <p className="text-xs text-neutral-500">
                    Launch {formatDate(p.preOrder!.releaseDate)} · {daysUntil(p.preOrder!.releaseDate)}d
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-600">
                    <b className="text-violet-700">{units} reserved</b> · {orders} orders · {formatTaka(deposits)} deposits
                  </p>
                </div>
                <Link
                  href={`/gadgets/admin/products/${p.id}`}
                  className="shrink-0 text-xs text-orange-600 hover:underline"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}
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
              <td className={`${td} whitespace-nowrap`}>{preorders && o.releaseDate ? formatDate(o.releaseDate) : formatDateTime(o.createdAt)}</td>
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
