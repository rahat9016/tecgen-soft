"use client";

import Link from "next/link";
import { ExternalLink, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { orderDue } from "@/src/lib/gadget-store/store";
import type { Order } from "@/src/lib/gadget-store/types";
import { formatDate, formatDateTime, formatTaka, paymentLabels, statusLabels } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import { StatusBadge } from "../shared";
import OrderProgress from "../account/OrderProgress";
import { btn, Drawer } from "./kit";
import { PaymentBadge, ReceivePayment, StatusActions, statusDot } from "./orderActions";

export default function AdminOrderQuickView({ order, onClose }: { order: Order | null; onClose: () => void }) {
  if (!order) return null;
  const due = order.status === "cancelled" ? 0 : orderDue(order);
  const last = order.timeline.slice(-4).reverse();

  return (
    <Drawer
      open
      onClose={onClose}
      title={
        <>
          <p className="flex flex-wrap items-center gap-2 text-lg font-bold text-neutral-900">
            {order.id} <StatusBadge status={order.status} />
            {order.type === "preorder" && (
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">Pre-order</span>
            )}
          </p>
          <p className="text-xs text-neutral-500">
            Placed {formatDateTime(order.createdAt)}
            {order.releaseDate && ` · launch ${formatDate(order.releaseDate)}`}
          </p>
        </>
      }
      footer={
        <div className="flex gap-2">
          <Link href={`/gadgets/admin/chat?c=${order.customerId}`} className={btn.outline}>
            <MessageSquare className="size-4" /> Chat
          </Link>
          <Link href={`/gadgets/admin/orders/${order.id}`} className={cn(btn.dark, "flex-1")}>
            Open full details <ExternalLink className="size-4" />
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        <section>
          <OrderProgress order={order} />
          <StatusActions order={order} className="mt-4" />
        </section>

        <section className="grid grid-cols-3 gap-2 text-center">
          {[
            { k: "Total", v: formatTaka(order.total), c: "text-neutral-900" },
            { k: "Paid", v: formatTaka(order.paid), c: "text-emerald-600" },
            { k: "Due", v: formatTaka(due), c: due ? "text-rose-600" : "text-neutral-400" },
          ].map((x) => (
            <div key={x.k} className="rounded-xl bg-neutral-50 p-3">
              <p className="text-[11px] uppercase tracking-wide text-neutral-500">{x.k}</p>
              <p className={cn("mt-0.5 font-bold tabular-nums", x.c)}>{x.v}</p>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">Payment</h3>
            <PaymentBadge order={order} />
          </div>
          <p className="text-sm text-neutral-600">{paymentLabels[order.paymentMethod]}</p>
          <ReceivePayment order={order} className="mt-3" />
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">
            Items <span className="font-normal text-neutral-400">({order.items.reduce((s, l) => s + l.qty, 0)})</span>
          </h3>
          <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
            {order.items.map((l, i) => (
              <li key={i} className="flex items-center gap-3 p-3 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.image} alt="" className="size-11 shrink-0 rounded-lg bg-neutral-50 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium text-neutral-900">{l.name}</p>
                  <p className="text-xs text-neutral-500">
                    {l.variant ? `${l.variant} · ` : ""}
                    {formatTaka(l.price)} × {l.qty}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">{formatTaka(l.price * l.qty)}</p>
              </li>
            ))}
          </ul>
          {order.note && <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Note: {order.note}</p>}
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">Customer</h3>
          <div className="space-y-1.5 rounded-xl border border-neutral-200 p-4 text-sm">
            <p className="font-medium text-neutral-900">{order.customer.name}</p>
            <p className="flex items-center gap-2 text-neutral-600">
              <Phone className="size-3.5 text-neutral-400" />
              <a href={`tel:${order.customer.phone}`} className="hover:text-orange-600">
                {order.customer.phone}
              </a>
            </p>
            {order.customer.email && (
              <p className="flex items-center gap-2 text-neutral-600">
                <Mail className="size-3.5 text-neutral-400" /> {order.customer.email}
              </p>
            )}
            <p className="flex items-start gap-2 text-neutral-600">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-neutral-400" />
              {order.customer.address}, {order.customer.city}
            </p>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">Recent activity</h3>
          <ol className="space-y-3">
            {last.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", statusDot[t.status])} />
                <div>
                  <p className="font-medium text-neutral-900">{statusLabels[t.status]}</p>
                  <p className="text-xs text-neutral-500">
                    {formatDateTime(t.at)}
                    {t.note ? ` — ${t.note}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Drawer>
  );
}
