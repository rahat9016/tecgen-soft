"use client";

import { useState } from "react";
import { PackageSearch, Search } from "lucide-react";
import { useGadgetDB, useHydrated } from "@/src/lib/gadget-store/store";
import { formatDateTime, formatTaka } from "@/src/lib/gadget-store/format";
import OrderTracker from "@/src/components/gadgets/OrderTracker";
import { EmptyState, Field, inputClass, StatusBadge } from "@/src/components/gadgets/shared";

const digits = (s: string) => s.replace(/\D/g, "");

export default function TrackOrderPage() {
  const db = useGadgetDB();
  const hydrated = useHydrated();
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [query, setQuery] = useState<{ id: string; phone: string } | null>(null);

  const order = query
    ? db.orders.find(
        (o) =>
          o.id.toLowerCase() === query.id.trim().toLowerCase().replace(/^#/, "") &&
          digits(o.customer.phone).endsWith(digits(query.phone).slice(-10))
      )
    : undefined;

  const mine = db.orders.filter((o) => o.customerId === db.currentUserId && o.status !== "delivered" && o.status !== "cancelled");

  return (
    <div className="container mt-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">Track your order</h1>
      <p className="mt-1 text-sm text-neutral-500">Enter the order number from your confirmation SMS and the phone used at checkout.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery({ id, phone });
        }}
        className="mt-6 grid gap-4 rounded-2xl border border-neutral-100 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <Field label="Order number">
          <input required value={id} onChange={(e) => setId(e.target.value)} placeholder="GH-10035" className={inputClass} />
        </Field>
        <Field label="Phone number">
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className={inputClass} />
        </Field>
        <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white hover:bg-orange-600">
          <Search className="size-4" /> Track
        </button>
      </form>

      {hydrated && !query && mine.length > 0 && (
        <p className="mt-4 text-sm text-neutral-500">
          Your active orders:{" "}
          {mine.map((o, i) => (
            <button
              key={o.id}
              onClick={() => {
                setId(o.id);
                setPhone(o.customer.phone);
                setQuery({ id: o.id, phone: o.customer.phone });
              }}
              className="font-medium text-orange-600 hover:underline"
            >
              {o.id}
              {i < mine.length - 1 ? ", " : ""}
            </button>
          ))}
        </p>
      )}

      {query && (
        <div className="mt-8">
          {order ? (
            <div className="space-y-6 rounded-2xl border border-neutral-100 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-lg font-bold text-neutral-900">
                    #{order.id} <StatusBadge status={order.status} />
                  </p>
                  <p className="text-sm text-neutral-500">
                    Placed {formatDateTime(order.createdAt)} · {order.items.length} item(s) · {formatTaka(order.total)}
                  </p>
                </div>
              </div>
              <OrderTracker order={order} />
              {order.timeline.length > 0 && (
                <ul className="space-y-2 border-t border-neutral-100 pt-4 text-sm">
                  {[...order.timeline].reverse().map((t, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-36 shrink-0 text-neutral-400">{formatDateTime(t.at)}</span>
                      <span className="text-neutral-700">
                        <b className="capitalize">{t.status}</b>
                        {t.note ? ` — ${t.note}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <EmptyState icon={PackageSearch} title="No order found" text="Check the order number and phone number, then try again." />
          )}
        </div>
      )}
    </div>
  );
}
