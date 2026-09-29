import { Check, CircleX, Package, PackageCheck, ShieldCheck, Truck, Warehouse } from "lucide-react";
import type { Order } from "@/src/lib/gadget-store/types";
import { formatDate, formatDateTime, statusFlow, statusLabels } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";

const icons = {
  pending: Package,
  confirmed: ShieldCheck,
  processing: Warehouse,
  shipped: Truck,
  delivered: PackageCheck,
};

const hints = {
  pending: "We received your order",
  confirmed: "Order verified by our team",
  processing: "Packed at the warehouse",
  shipped: "Handed to the courier",
  delivered: "Delivered to you",
};

export default function OrderTracker({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    const at = order.timeline.find((t) => t.status === "cancelled");
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700">
        <CircleX className="size-6 shrink-0" />
        <div>
          <p className="font-semibold">Order cancelled</p>
          <p className="text-sm">
            {at ? formatDateTime(at.at) : ""} {at?.note ? `— ${at.note}` : ""}
          </p>
        </div>
      </div>
    );
  }

  const current = statusFlow.indexOf(order.status);

  return (
    <div>
      {order.type === "preorder" && order.status !== "delivered" && order.releaseDate && (
        <p className="mb-4 rounded-xl bg-violet-50 px-4 py-2.5 text-sm text-violet-800">
          Pre-order — ships after launch on <b>{formatDate(order.releaseDate)}</b>.
        </p>
      )}
      <ol className="grid gap-4 sm:grid-cols-5 sm:gap-0">
        {statusFlow.map((s, i) => {
          const Icon = icons[s as keyof typeof icons];
          const done = i <= current;
          const at = order.timeline.find((t) => t.status === s)?.at;
          return (
            <li key={s} className="relative flex gap-3 sm:flex-col sm:items-center sm:text-center">
              {i > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute hidden h-0.5 sm:block sm:left-[-50%] sm:right-[50%] sm:top-5",
                    i <= current ? "bg-orange-500" : "bg-neutral-200"
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                  done ? "bg-orange-500 text-white" : "bg-neutral-100 text-neutral-400",
                  i === current && "shadow-lg shadow-orange-200"
                )}
              >
                {done && i < current ? <Check className="size-5" /> : <Icon className="size-5" />}
              </span>
              <div className="sm:mt-2">
                <p className={cn("text-sm font-semibold", done ? "text-neutral-900" : "text-neutral-400")}>
                  {statusLabels[s]}
                </p>
                <p className="text-xs text-neutral-500">{at ? formatDateTime(at) : hints[s as keyof typeof hints]}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
