"use client";

import { useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { useGadgetDB } from "@/src/lib/gadget-store/store";
import type { OrderStatus } from "@/src/lib/gadget-store/types";
import { statusLabels } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import OrderRow from "@/src/components/gadgets/account/OrderRow";
import { EmptyState } from "@/src/components/gadgets/shared";

const filters: ("all" | OrderStatus)[] = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AccountOrdersPage() {
  const db = useGadgetDB();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const mine = db.orders.filter((o) => o.customerId === db.currentUserId && o.type === "regular");
  const shown = filter === "all" ? mine : mine.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Order history</h1>
      <div className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium",
              filter === f ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600"
            )}
          >
            {f === "all" ? "All" : statusLabels[f]} ({f === "all" ? mine.length : mine.filter((o) => o.status === f).length})
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {shown.map((o) => (
          <OrderRow key={o.id} order={o} />
        ))}
        {shown.length === 0 && (
          <EmptyState
            icon={Package}
            title="No orders here"
            action={
              <Link href="/gadgets/shop" className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white">
                Shop now
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
