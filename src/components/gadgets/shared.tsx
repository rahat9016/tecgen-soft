import { Loader2 } from "lucide-react";
import type { OrderStatus } from "@/src/lib/gadget-store/types";
import { statusLabels, statusStyles } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-60 items-center justify-center text-neutral-400">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-orange-50 text-orange-500">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-4 font-semibold text-neutral-900">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-neutral-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">{label}</span>
      {children}
    </label>
  );
}
