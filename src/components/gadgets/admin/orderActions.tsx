"use client";

import { useState } from "react";
import { ArrowRight, Ban, Wallet } from "lucide-react";
import { toast } from "react-toastify";
import { orderDue, recordOrderPayment, setOrderStatus } from "@/src/lib/gadget-store/store";
import type { Order, OrderStatus } from "@/src/lib/gadget-store/types";
import { formatTaka, statusFlow, statusLabels } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import { btn } from "./kit";

export type PaymentState = "paid" | "partial" | "unpaid" | "void";

export function paymentState(o: Order): PaymentState {
  if (o.status === "cancelled") return "void";
  if (o.paid >= o.total) return "paid";
  return o.paid > 0 ? "partial" : "unpaid";
}

const paymentStyles: Record<PaymentState, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  partial: "bg-amber-50 text-amber-700",
  unpaid: "bg-rose-50 text-rose-700",
  void: "bg-neutral-100 text-neutral-500",
};

export const paymentStateLabels: Record<PaymentState, string> = {
  paid: "Paid",
  partial: "Partially paid",
  unpaid: "Unpaid",
  void: "Void",
};

export function PaymentBadge({ order }: { order: Order }) {
  const s = paymentState(order);
  return (
    <span className={cn("inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", paymentStyles[s])}>
      {paymentStateLabels[s]}
    </span>
  );
}

export const statusDot: Record<OrderStatus, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-sky-500",
  processing: "bg-indigo-500",
  shipped: "bg-violet-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-rose-500",
};

export const nextStatus = (o: Order): OrderStatus | undefined =>
  o.status === "cancelled" ? undefined : statusFlow[statusFlow.indexOf(o.status) + 1];

/** Advance-to-next-status and cancel controls, with an optional timeline note. */
export function StatusActions({ order, className }: { order: Order; className?: string }) {
  const [note, setNote] = useState("");
  const next = nextStatus(order);
  if (!next) return null;

  const apply = (s: OrderStatus) => {
    setOrderStatus(order.id, s, note.trim() || undefined);
    setNote("");
    toast.success(`Order ${order.id} marked ${statusLabels[s]}`);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Timeline note (optional), e.g. courier tracking no."
        aria-label="Timeline note"
        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
      />
      <div className="flex flex-wrap gap-2">
        <button onClick={() => apply(next)} className={cn(btn.primary, "flex-1")}>
          Mark as {statusLabels[next]} <ArrowRight className="size-4" />
        </button>
        <button
          onClick={() => confirm(`Cancel order ${order.id}?`) && apply("cancelled")}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-600 hover:bg-rose-50"
        >
          <Ban className="size-4" /> Cancel order
        </button>
      </div>
    </div>
  );
}

/** Records a (partial) payment against an order's outstanding balance. */
export function ReceivePayment({ order, className }: { order: Order; className?: string }) {
  const [amount, setAmount] = useState("");
  const due = orderDue(order);
  if (due <= 0 || order.status === "cancelled") return null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const n = Math.round(Number(amount));
        if (!n || n <= 0) return toast.error("Enter an amount");
        if (n > due) return toast.error(`Amount can't exceed the due ${formatTaka(due)}`);
        recordOrderPayment(order.id, n);
        setAmount("");
        toast.success(`Payment of ${formatTaka(n)} recorded`);
      }}
      className={cn("space-y-2", className)}
    >
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          max={due}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Amount (max ${formatTaka(due)})`}
          aria-label="Payment amount"
          className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        <button className={btn.dark}>
          <Wallet className="size-4" /> Receive
        </button>
      </div>
      <button type="button" onClick={() => setAmount(String(due))} className="text-xs font-medium text-orange-600 hover:underline">
        Fill full due ({formatTaka(due)})
      </button>
    </form>
  );
}
