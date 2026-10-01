import type { Order } from "@/src/lib/gadget-store/types";
import { statusFlow, statusLabels } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";

/** Compact segmented bar showing how far an order is through pending → delivered. */
export default function OrderProgress({ order, className }: { order: Order; className?: string }) {
  if (order.status === "cancelled") {
    return <p className={cn("text-xs font-medium text-rose-600", className)}>Order cancelled</p>;
  }
  const current = statusFlow.indexOf(order.status);
  const done = order.status === "delivered";
  return (
    <div className={className}>
      <div className="flex gap-1" aria-hidden>
        {statusFlow.map((s, i) => (
          <span
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i <= current ? (done ? "bg-emerald-500" : "bg-orange-500") : "bg-neutral-200"
            )}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-neutral-500">
        Step {current + 1} of {statusFlow.length} · <span className="font-medium text-neutral-700">{statusLabels[order.status]}</span>
        {!done && current + 1 < statusFlow.length && <> · next: {statusLabels[statusFlow[current + 1]]}</>}
      </p>
    </div>
  );
}
