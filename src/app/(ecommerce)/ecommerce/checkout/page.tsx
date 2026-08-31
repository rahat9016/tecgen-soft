"use client";

import { useAppSelector } from "@/src/lib/redux/hooks";
import CheckoutForm from "@/src/components/store/Checkout/CheckoutForm";
import CheckoutSummary from "@/src/components/store/Checkout/CheckoutSummary";
import EmptyCart from "@/src/components/store/Cart/EmptyCart";

export default function CheckoutPage() {
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
      <h1 className="text-2xl font-bold text-neutral-900">Checkout</h1>
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">{hydrated && <CheckoutForm />}</div>
        <div>{hydrated && <CheckoutSummary />}</div>
      </div>
    </div>
  );
}
