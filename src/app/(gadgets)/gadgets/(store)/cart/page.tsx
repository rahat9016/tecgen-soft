"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatTaka } from "@/src/data/gadgets";
import { cartDetails, setCartQty, useGadgetDB, useHydrated } from "@/src/lib/gadget-store/store";
import { EmptyState, PageLoader } from "@/src/components/gadgets/shared";

export default function GadgetCartPage() {
  const db = useGadgetDB();
  const hydrated = useHydrated();
  const { lines, subtotal, count } = cartDetails(db);

  if (!hydrated) return <PageLoader />;

  return (
    <div className="container mt-8">
      <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">Shopping Cart</h1>

      {lines.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            text="Browse the latest phones, audio and accessories."
            action={
              <Link href="/gadgets/shop" className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white">
                Start shopping
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-8 [&>*]:min-w-0 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100">
            {lines.map((l) => (
              <li key={l.key} className="flex gap-4 p-4">
                <Link href={`/gadgets/product/${l.product.slug}`} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.product.image} alt="" className="size-20 rounded-xl bg-neutral-50 object-cover sm:size-24" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/gadgets/product/${l.product.slug}`}
                    className="line-clamp-2 text-sm font-medium text-neutral-900 hover:text-orange-500"
                  >
                    {l.product.name}
                  </Link>
                  {l.variant && <p className="mt-0.5 text-xs text-neutral-500">{l.variant}</p>}
                  <p className="mt-1 text-sm font-bold text-neutral-900">{formatTaka(l.product.price)}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex h-9 items-center rounded-full border border-neutral-200">
                      <button
                        onClick={() => setCartQty(l.key, l.qty - 1)}
                        aria-label="Decrease quantity"
                        className="flex size-9 items-center justify-center text-neutral-600"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                      <button
                        onClick={() => setCartQty(l.key, Math.min(l.product.stock, l.qty + 1))}
                        aria-label="Increase quantity"
                        className="flex size-9 items-center justify-center text-neutral-600"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => setCartQty(l.key, 0)}
                      className="flex items-center gap-1 text-xs text-neutral-500 hover:text-rose-600"
                    >
                      <Trash2 className="size-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl bg-neutral-50 p-6">
            <h2 className="font-semibold text-neutral-900">Order Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Items ({count})</dt>
                <dd>{formatTaka(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Delivery</dt>
                <dd>{subtotal >= 20000 ? "Free" : "Calculated at checkout"}</dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 font-bold">
              <span>Subtotal</span>
              <span>{formatTaka(subtotal)}</span>
            </div>
            <Link
              href="/gadgets/checkout"
              className="mt-5 flex h-12 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Proceed to Checkout
            </Link>
            <Link href="/gadgets/shop" className="mt-3 block text-center text-sm text-neutral-600 hover:underline">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
