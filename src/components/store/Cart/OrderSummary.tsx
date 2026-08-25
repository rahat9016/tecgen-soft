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
      <h3 className="text-base font-semibold text-neutral-900">অর্ডার সারাংশ</h3>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>সাবটোটাল</span>
          <span>৳{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>ডেলিভারি চার্জ</span>
          <span>{delivery === 0 ? "ফ্রি" : `৳${delivery}`}</span>
        </div>
        {delivery > 0 && (
          <p className="text-xs text-emerald-700">
            ৳{FREE_DELIVERY_THRESHOLD}+ অর্ডারে ফ্রি ডেলিভারি পান
          </p>
        )}
      </div>

      <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-base font-bold text-neutral-900">
        <span>মোট</span>
        <span>৳{total.toLocaleString()}</span>
      </div>

      <Button asChild className="mt-6 w-full bg-emerald-800 hover:bg-emerald-900 text-white">
        <Link href="/ecommerce/checkout">চেকআউটে যান</Link>
      </Button>
    </div>
  );
}
