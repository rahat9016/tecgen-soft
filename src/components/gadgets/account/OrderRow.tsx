import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Order } from "@/src/lib/gadget-store/types";
import { formatDate, formatTaka } from "@/src/lib/gadget-store/format";
import { orderDue } from "@/src/lib/gadget-store/store";
import { StatusBadge } from "../shared";
import OrderProgress from "./OrderProgress";

export default function OrderRow({ order }: { order: Order }) {
  const first = order.items[0];
  const more = order.items.length - 1;
  const units = order.items.reduce((s, l) => s + l.qty, 0);
  const due = order.status === "cancelled" ? 0 : orderDue(order);

  return (
    <Link
      href={`/gadgets/account/orders/${order.id}`}
      className="group block rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-md sm:p-5"
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={first.image} alt="" className="size-16 rounded-xl border border-neutral-100 bg-neutral-50 object-cover sm:size-20" />
          {more > 0 && (
            <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] font-bold text-white ring-2 ring-white">
              +{more}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900">#{order.id}</span>
            <StatusBadge status={order.status} />
            {order.type === "preorder" && (
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">Pre-order</span>
            )}
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-neutral-700">
            {first.name}
            {more > 0 ? ` + ${more} more` : ""}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">
            {formatDate(order.createdAt)} · {units} {units === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-bold text-neutral-900">{formatTaka(order.total)}</p>
          {due > 0 && <p className="mt-0.5 text-[11px] font-medium text-orange-600">{formatTaka(due)} due</p>}
          <ChevronRight className="ml-auto mt-1 size-4 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
        </div>
      </div>
      <OrderProgress order={order} className="mt-4 border-t border-neutral-100 pt-3" />
    </Link>
  );
}
