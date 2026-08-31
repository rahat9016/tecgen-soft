"use client";

import { useAppSelector } from "@/src/lib/redux/hooks";
import CartTable from "@/src/components/store/Cart/CartTable";
import OrderSummary from "@/src/components/store/Cart/OrderSummary";
import EmptyCart from "@/src/components/store/Cart/EmptyCart";

export default function CartPage() {
  const items = useAppSelector((state) => state.cart.items);
  const hydrated = useAppSelector((state) => state.cart.hydrated);

  if (hydrated && items.length === 0) {
    return (
      <div className="container">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold text-neutral-900">Shopping Cart</h1>
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">{hydrated && <CartTable />}</div>
        <div>
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
