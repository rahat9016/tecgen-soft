"use client";

import Link from "next/link";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { getCartTotals, FREE_DELIVERY_THRESHOLD } from "@/src/lib/cartTotals";
import { Button } from "@/src/components/ui/button";

export default function OrderSummary() {
  const items = useAppSelector((state) => state.cart.items);
  const { subtotal, delivery, total } = getCartTotals(items);

  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-6">
      <h3 className="text-base font-semibold text-neutral-900">Order Summary</h3>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span>৳{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Delivery Charge</span>
          <span>{delivery === 0 ? "Free" : `৳${delivery}`}</span>
        </div>
        {delivery > 0 && (
          <p className="text-xs text-emerald-700">
            Get free delivery on orders over ৳{FREE_DELIVERY_THRESHOLD}
          </p>
        )}
      </div>

      <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-base font-bold text-neutral-900">
        <span>Total</span>
        <span>৳{total.toLocaleString()}</span>
      </div>

      <Button asChild className="mt-6 w-full bg-emerald-800 hover:bg-emerald-900 text-white">
        <Link href="/ecommerce/checkout">Proceed to Checkout</Link>
      </Button>
    </div>
  );
}
