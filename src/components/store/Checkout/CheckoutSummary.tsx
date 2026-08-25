"use client";

import { useAppSelector } from "@/src/lib/redux/hooks";
import { getCartTotals, FREE_DELIVERY_THRESHOLD } from "@/src/lib/cartTotals";

export default function CheckoutSummary() {
  const items = useAppSelector((state) => state.cart.items);
  const { subtotal, delivery, total } = getCartTotals(items);

  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-6">
      <h3 className="text-base font-semibold text-neutral-900">অর্ডার সারাংশ</h3>

      <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.name} className="size-full object-cover" />
              <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-emerald-800 text-[9px] font-bold text-white">
                {item.qty}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-xs font-medium text-neutral-800">{item.name}</p>
            </div>
            <p className="shrink-0 text-xs font-semibold text-neutral-800">
              ৳{(item.price * item.qty).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm">
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
    </div>
  );
}
