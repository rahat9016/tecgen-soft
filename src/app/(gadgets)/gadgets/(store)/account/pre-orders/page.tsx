"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { orderDue, useGadgetDB } from "@/src/lib/gadget-store/store";
import { daysUntil, formatDate, formatTaka } from "@/src/lib/gadget-store/format";
import { EmptyState, StatusBadge } from "@/src/components/gadgets/shared";

export default function AccountPreOrdersPage() {
  const db = useGadgetDB();
  const mine = db.orders.filter((o) => o.customerId === db.currentUserId && o.type === "preorder");

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">My pre-orders</h1>
      <p className="mt-1 text-sm text-neutral-500">Reserved devices ship first on launch day.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {mine.map((o) => {
          const item = o.items[0];
          const days = o.releaseDate ? daysUntil(o.releaseDate) : 0;
          return (
            <Link
              key={o.id}
              href={`/gadgets/account/orders/${o.id}`}
              className="flex gap-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-4 transition hover:border-violet-300"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" className="size-24 rounded-xl bg-white object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900">#{o.id}</span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-1 line-clamp-1 font-medium text-neutral-800">{item.name}</p>
                {item.variant && <p className="text-xs text-neutral-500">{item.variant}</p>}
                <p className="mt-2 flex items-center gap-1.5 text-xs text-violet-700">
                  <CalendarClock className="size-3.5" /> Launch {o.releaseDate ? formatDate(o.releaseDate) : "TBA"}
                  {days > 0 && ` · ${days} days to go`}
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  Deposit paid {formatTaka(o.paid)} · Due {formatTaka(orderDue(o))}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {mine.length === 0 && (
        <EmptyState
          icon={CalendarClock}
          title="No pre-orders yet"
          text="Reserve upcoming flagships before launch."
          action={
            <Link href="/gadgets/pre-order" className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white">
              See upcoming devices
            </Link>
          }
        />
      )}
    </div>
  );
}
