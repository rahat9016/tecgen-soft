"use client";

import Link from "next/link";
import { ArrowLeft, Copy, Mail, MapPin, MessageSquare, Phone, Printer, ReceiptText, TrendingUp, Wallet } from "lucide-react";
import { toast } from "react-toastify";
import { orderDue, useGadgetDB } from "@/src/lib/gadget-store/store";
import { formatDate, formatDateTime, formatTaka, paymentLabels, statusLabels } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import OrderTracker from "../OrderTracker";
import { StatusBadge } from "../shared";
import Invoice from "./Invoice";
import { btn, Card, StatCard } from "./kit";
import { PaymentBadge, ReceivePayment, StatusActions, statusDot } from "./orderActions";

export default function AdminOrderDetail({ id }: { id: string }) {
  const db = useGadgetDB();
  const order = db.orders.find((o) => o.id === id);

  if (!order) {
    return (
      <Card className="py-14 text-center">
        <p className="font-medium text-neutral-900">Order {id} not found</p>
        <Link href="/gadgets/admin/orders" className="mt-2 inline-block text-sm text-orange-600 hover:underline">
          Back to orders
        </Link>
      </Card>
    );
  }

  const cancelled = order.status === "cancelled";
  const due = cancelled ? 0 : orderDue(order);
  const back = order.type === "preorder" ? "/gadgets/admin/pre-orders" : "/gadgets/admin/orders";
  const profit = order.items.reduce((s, l) => s + (l.price - l.cost) * l.qty, 0);
  const units = order.items.reduce((s, l) => s + l.qty, 0);
  const customerOrders = db.orders.filter((o) => o.customerId === order.customerId);
  const done = order.status === "delivered" || cancelled;

  return (
    <>
      <div className="mb-6 print:hidden">
        <Link href={back} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-orange-600">
          <ArrowLeft className="size-4" /> {order.type === "preorder" ? "Pre-orders" : "Orders"}
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold text-neutral-900">
              Order {order.id}
              <button
                onClick={() => navigator.clipboard?.writeText(order.id).then(() => toast.success("Order ID copied"))}
                aria-label="Copy order ID"
                className={btn.ghost}
              >
                <Copy className="size-4" />
              </button>
              <StatusBadge status={order.status} />
              {order.type === "preorder" && (
                <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                  Pre-order{order.releaseDate && ` · launch ${formatDate(order.releaseDate)}`}
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Placed {formatDateTime(order.createdAt)} · {units} {units === 1 ? "unit" : "units"} ·{" "}
              {paymentLabels[order.paymentMethod]}
            </p>
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
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4 print:hidden">
        <StatCard label="Order total" value={formatTaka(order.total)} hint={`Delivery ${formatTaka(order.deliveryFee)}`} icon={ReceiptText} />
        <StatCard label="Paid" value={formatTaka(order.paid)} icon={Wallet} tone="green" />
        <StatCard
          label="Due"
          value={cancelled ? "—" : formatTaka(due)}
          hint={due ? "To collect" : cancelled ? "Order cancelled" : "Fully paid"}
          icon={Wallet}
          tone={due ? "rose" : "neutral"}
        />
        <StatCard label="Gross profit" value={formatTaka(profit)} hint={`${Math.round((profit / Math.max(1, order.subtotal)) * 100)}% margin`} icon={TrendingUp} tone="orange" />
      </div>

      <div className="grid gap-6 [&>*]:min-w-0 xl:grid-cols-[1fr_360px] print:hidden">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">Fulfilment</h2>
              {!done && <span className="text-xs text-neutral-500">Move the order forward as it progresses</span>}
            </div>
            <OrderTracker order={order} />
            {!done && <StatusActions order={order} className="mt-6 border-t border-neutral-100 pt-5" />}
          </Card>

          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <h2 className="font-semibold text-neutral-900">Items</h2>
              <span className="text-sm text-neutral-500">{order.items.length} products</span>
            </div>
            <ul className="divide-y divide-neutral-100">
              {order.items.map((l, i) => (
                <li key={i} className="flex items-center gap-4 px-6 py-4 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.image} alt="" className="size-14 shrink-0 rounded-xl border border-neutral-100 bg-neutral-50 object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/gadgets/admin/products/${l.productId}`} className="font-medium text-neutral-900 hover:text-orange-600">
                      {l.name}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      {l.variant ? `${l.variant} · ` : ""}
                      {formatTaka(l.price)} × {l.qty}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Cost {formatTaka(l.cost)} · margin {formatTaka((l.price - l.cost) * l.qty)}
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums text-neutral-900">{formatTaka(l.price * l.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-neutral-100 bg-neutral-50/60 px-6 py-4 text-sm">
              <Row k="Subtotal" v={formatTaka(order.subtotal)} />
              {order.discount > 0 && <Row k="Discount" v={`−${formatTaka(order.discount)}`} />}
              <Row k="Delivery" v={order.deliveryFee ? formatTaka(order.deliveryFee) : "Free"} />
              <Row k="Total" v={formatTaka(order.total)} strong />
            </dl>
            {order.note && (
              <p className="m-4 mt-0 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                <b>Customer note:</b> {order.note}
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-neutral-900">Activity</h2>
            <ol className="relative space-y-5 before:absolute before:inset-y-1 before:left-[5px] before:w-px before:bg-neutral-200">
              {[...order.timeline].reverse().map((t, i) => (
                <li key={i} className="relative flex gap-4 pl-6 text-sm">
                  <span className={cn("absolute left-0 top-1 size-3 rounded-full ring-4 ring-white", statusDot[t.status])} />
                  <div>
                    <p className="font-medium text-neutral-900">{statusLabels[t.status]}</p>
                    <p className="text-xs text-neutral-500">{formatDateTime(t.at)}</p>
                    {t.note && <p className="mt-1 rounded-lg bg-neutral-50 px-3 py-1.5 text-neutral-700">{t.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">Payment</h2>
              <PaymentBadge order={order} />
            </div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Row k="Method" v={paymentLabels[order.paymentMethod]} />
              <Row k="Total" v={formatTaka(order.total)} />
              <Row k="Paid" v={formatTaka(order.paid)} />
              <Row k="Due" v={cancelled ? "—" : formatTaka(due)} strong={due > 0} />
            </dl>
            {order.total > 0 && !cancelled && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (order.paid / order.total) * 100)}%` }} />
              </div>
            )}
            <ReceivePayment order={order} className="mt-4 border-t border-neutral-100 pt-4" />
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-600">
                {order.customer.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-neutral-900">{order.customer.name}</p>
                <p className="text-xs text-neutral-500">
                  {customerOrders.length} {customerOrders.length === 1 ? "order" : "orders"} ·{" "}
                  {formatTaka(customerOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.paid, 0))} paid
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-sm text-neutral-600">
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-neutral-400" />
                <a href={`tel:${order.customer.phone}`} className="hover:text-orange-600">
                  {order.customer.phone}
                </a>
              </p>
              {order.customer.email && (
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-neutral-400" />
                  <a href={`mailto:${order.customer.email}`} className="truncate hover:text-orange-600">
                    {order.customer.email}
                  </a>
                </p>
              )}
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-400" />
                {order.customer.address}, {order.customer.city}
              </p>
            </div>
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
