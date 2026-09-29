import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Order } from "@/src/lib/gadget-store/types";
import { formatDate, formatTaka } from "@/src/lib/gadget-store/format";
import { StatusBadge } from "../shared";

export default function OrderRow({ order }: { order: Order }) {
  const first = order.items[0];
  const more = order.items.length - 1;
  return (
    <Link
      href={`/gadgets/account/orders/${order.id}`}
      className="flex items-center gap-4 rounded-2xl border border-neutral-100 p-4 transition hover:border-orange-200 hover:shadow-sm"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={first.image} alt="" className="size-16 shrink-0 rounded-xl bg-neutral-50 object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900">#{order.id}</span>
          <StatusBadge status={order.status} />
          {order.type === "preorder" && (
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">Pre-order</span>
          )}
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-neutral-600">
          {first.name}
          {more > 0 ? ` + ${more} more` : ""}
        </p>
        <p className="mt-0.5 text-xs text-neutral-400">{formatDate(order.createdAt)}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-neutral-900">{formatTaka(order.total)}</p>
        <ChevronRight className="ml-auto mt-1 size-4 text-neutral-400" />
      </div>
    </Link>
  );
}
