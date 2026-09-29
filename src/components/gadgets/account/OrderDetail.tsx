"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CircleCheckBig, MessageCircle, PackageX } from "lucide-react";
import { cancelOwnOrder, orderDue, sendChat, useGadgetDB } from "@/src/lib/gadget-store/store";
import { formatDateTime, formatTaka, paymentLabels } from "@/src/lib/gadget-store/format";
import OrderTracker from "../OrderTracker";
import { EmptyState, StatusBadge } from "../shared";

export default function OrderDetail({ id }: { id: string }) {
  const db = useGadgetDB();
  const params = useSearchParams();
  const order = db.orders.find((o) => o.id === id && o.customerId === db.currentUserId);

  if (!order) {
    return <EmptyState icon={PackageX} title="Order not found" action={<Link href="/gadgets/account/orders" className="text-sm text-orange-500">Back to orders</Link>} />;
  }

  const due = orderDue(order);
  const back = order.type === "preorder" ? "/gadgets/account/pre-orders" : "/gadgets/account/orders";

  return (
    <div className="space-y-6">
      {params.get("placed") && (
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-5 text-emerald-800">
          <CircleCheckBig className="mt-0.5 size-6 shrink-0" />
          <div>
            <p className="font-semibold">
              {order.type === "preorder" ? "Pre-order confirmed!" : "Order placed successfully!"}
            </p>
            <p className="text-sm">
              Your order number is <b>#{order.id}</b>. We&apos;ll call {order.customer.phone} to confirm.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={back} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-orange-500">
            <ArrowLeft className="size-4" /> Back
          </Link>
          <h1 className="mt-2 flex flex-wrap items-center gap-3 text-2xl font-bold text-neutral-900">
            Order #{order.id} <StatusBadge status={order.status} />
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/gadgets/account/messages"
            onClick={() => sendChat(db.currentUserId, "customer", `Hi, I have a question about order #${order.id}.`)}
            className="flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm hover:border-orange-400"
          >
            <MessageCircle className="size-4" /> Ask about this order
          </Link>
          {order.status === "pending" && (
            <button
              onClick={() => {
                if (confirm("Cancel this order?")) cancelOwnOrder(order.id);
              }}
              className="h-10 rounded-full border border-rose-200 px-4 text-sm text-rose-600 hover:bg-rose-50"
            >
              Cancel order
            </button>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-100 p-6">
        <h2 className="mb-5 font-semibold text-neutral-900">Tracking</h2>
        <OrderTracker order={order} />
      </section>

      <div className="grid gap-6 [&>*]:min-w-0 md:grid-cols-[1fr_300px]">
        <section className="rounded-2xl border border-neutral-100 p-6">
          <h2 className="font-semibold text-neutral-900">Items</h2>
          <ul className="mt-4 divide-y divide-neutral-100">
            {order.items.map((l) => (
              <li key={l.productId + (l.variant ?? "")} className="flex gap-3 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.image} alt="" className="size-14 rounded-lg bg-neutral-50 object-cover" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium text-neutral-900">{l.name}</p>
                  <p className="text-xs text-neutral-500">
                    {l.variant ? `${l.variant} · ` : ""}
                    {formatTaka(l.price)} × {l.qty}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatTaka(l.price * l.qty)}</p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-neutral-50 p-5 text-sm">
            <h2 className="font-semibold text-neutral-900">Payment</h2>
            <dl className="mt-3 space-y-1.5">
              <Row label="Subtotal" value={formatTaka(order.subtotal)} />
              <Row label="Delivery" value={order.deliveryFee ? formatTaka(order.deliveryFee) : "Free"} />
              <Row label="Total" value={formatTaka(order.total)} bold />
              <Row label="Paid" value={formatTaka(order.paid)} />
              {due > 0 && order.status !== "cancelled" && <Row label="Due" value={formatTaka(due)} accent />}
              <Row label="Method" value={paymentLabels[order.paymentMethod]} />
            </dl>
          </section>
          <section className="rounded-2xl bg-neutral-50 p-5 text-sm">
            <h2 className="font-semibold text-neutral-900">Delivery to</h2>
            <p className="mt-2 text-neutral-700">{order.customer.name}</p>
            <p className="text-neutral-500">{order.customer.phone}</p>
            <p className="text-neutral-500">
              {order.customer.address}, {order.customer.city}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-neutral-900" : ""} ${accent ? "font-semibold text-orange-600" : ""}`}>
      <dt className={bold || accent ? "" : "text-neutral-500"}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
