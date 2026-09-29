"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Printer } from "lucide-react";
import { toast } from "react-toastify";
import { orderDue, recordOrderPayment, setOrderStatus, useGadgetDB } from "@/src/lib/gadget-store/store";
import type { OrderStatus } from "@/src/lib/gadget-store/types";
import { formatDateTime, formatTaka, paymentLabels, statusFlow, statusLabels } from "@/src/lib/gadget-store/format";
import OrderTracker from "../OrderTracker";
import { StatusBadge } from "../shared";
import Invoice from "./Invoice";
import { btn, Card } from "./kit";

export default function AdminOrderDetail({ id }: { id: string }) {
  const db = useGadgetDB();
  const order = db.orders.find((o) => o.id === id);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  if (!order) {
    return (
      <p className="text-sm text-neutral-500">
        Order not found. <Link href="/gadgets/admin/orders" className="text-orange-600">Back to orders</Link>
      </p>
    );
  }

  const due = orderDue(order);
  const idx = statusFlow.indexOf(order.status);
  const next: OrderStatus | undefined = order.status === "cancelled" ? undefined : statusFlow[idx + 1];
  const back = order.type === "preorder" ? "/gadgets/admin/pre-orders" : "/gadgets/admin/orders";
  const profit = order.items.reduce((s, l) => s + (l.price - l.cost) * l.qty, 0);

  const advance = (s: OrderStatus) => {
    setOrderStatus(order.id, s, note || undefined);
    setNote("");
    toast.success(`Order ${order.id} marked ${statusLabels[s]}`);
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <Link href={back} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-orange-600">
            <ArrowLeft className="size-4" /> Back
          </Link>
          <h1 className="mt-2 flex flex-wrap items-center gap-3 text-2xl font-bold text-neutral-900">
            {order.id} <StatusBadge status={order.status} />
            {order.type === "preorder" && (
              <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">Pre-order · launch {order.releaseDate}</span>
            )}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/gadgets/admin/chat?c=${order.customerId}`} className={btn.outline}>
            <MessageSquare className="size-4" /> Chat
          </Link>
          <button onClick={() => window.print()} className={btn.dark}>
            <Printer className="size-4" /> Print invoice
          </button>
        </div>
      </div>

      <div className="grid gap-6 [&>*]:min-w-0 xl:grid-cols-[1fr_340px] print:hidden">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-5 font-semibold text-neutral-900">Fulfilment</h2>
            <OrderTracker order={order} />
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-5">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note for timeline (optional) e.g. courier tracking no."
                  className="h-10 min-w-60 flex-1 rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-orange-400"
                />
                {next && (
                  <button onClick={() => advance(next)} className={btn.primary}>
                    Mark as {statusLabels[next]}
                  </button>
                )}
                <button
                  onClick={() => confirm(`Cancel order ${order.id}?`) && advance("cancelled")}
                  className="inline-flex h-10 items-center rounded-xl border border-rose-200 px-4 text-sm text-rose-600 hover:bg-rose-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold text-neutral-900">Items</h2>
            <ul className="mt-3 divide-y divide-neutral-100">
              {order.items.map((l, i) => (
                <li key={i} className="flex items-center gap-3 py-3 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.image} alt="" className="size-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{l.name}</p>
                    <p className="text-xs text-neutral-500">
                      {l.variant ? `${l.variant} · ` : ""}
                      {formatTaka(l.price)} × {l.qty} · cost {formatTaka(l.cost)}
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums">{formatTaka(l.price * l.qty)}</p>
                </li>
              ))}
            </ul>
            {order.note && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Customer note: {order.note}</p>}
          </Card>

          <Card>
            <h2 className="font-semibold text-neutral-900">Activity</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {[...order.timeline].reverse().map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-36 shrink-0 text-neutral-400">{formatDateTime(t.at)}</span>
                  <span>
                    <b>{statusLabels[t.status]}</b>
                    {t.note ? ` — ${t.note}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold text-neutral-900">Payment</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Row k="Method" v={paymentLabels[order.paymentMethod]} />
              <Row k="Subtotal" v={formatTaka(order.subtotal)} />
              <Row k="Delivery" v={formatTaka(order.deliveryFee)} />
              <Row k="Total" v={formatTaka(order.total)} strong />
              <Row k="Paid" v={formatTaka(order.paid)} />
              <Row k="Due" v={formatTaka(due)} strong={due > 0} />
              <Row k="Gross profit" v={formatTaka(profit)} />
            </dl>
            {due > 0 && order.status !== "cancelled" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const n = Math.round(Number(amount));
                  if (!n || n <= 0) return;
                  recordOrderPayment(order.id, n);
                  setAmount("");
                  toast.success(`Payment of ${formatTaka(n)} recorded`);
                }}
                className="mt-4 flex gap-2 border-t border-neutral-100 pt-4"
              >
                <input
                  type="number"
                  min={1}
                  max={due}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Up to ${due}`}
                  aria-label="Payment amount"
                  className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-orange-400"
                />
                <button className={btn.dark}>Receive</button>
              </form>
            )}
          </Card>
          <Card>
            <h2 className="font-semibold text-neutral-900">Customer</h2>
            <p className="mt-2 text-sm font-medium text-neutral-900">{order.customer.name}</p>
            <p className="text-sm text-neutral-600">{order.customer.phone}</p>
            <p className="text-sm text-neutral-600">{order.customer.email}</p>
            <p className="mt-2 text-sm text-neutral-600">
              {order.customer.address}, {order.customer.city}
            </p>
          </Card>
        </div>
      </div>

      <div className="hidden print:block">
        <Invoice
          title="Invoice"
          number={order.id}
          date={order.createdAt}
          billTo={{ name: order.customer.name, phone: order.customer.phone, address: `${order.customer.address}, ${order.customer.city}` }}
          items={order.items}
          rows={[
            ["Subtotal", order.subtotal],
            ["Delivery", order.deliveryFee],
          ]}
          total={order.total}
          paid={order.paid}
        />
      </div>
    </>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "font-semibold text-neutral-900" : ""}`}>
      <dt className={strong ? "" : "text-neutral-500"}>{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}
