"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Heart,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "react-toastify";
import { formatTaka } from "@/src/data/gadgets";
import {
  cartDetails,
  FREE_DELIVERY_MIN,
  setCartQty,
  toggleWishlist,
  useGadgetDB,
  useHydrated,
} from "@/src/lib/gadget-store/store";
import { EmptyState, PageLoader } from "@/src/components/gadgets/shared";

const trust = [
  { icon: BadgeCheck, label: "100% original with official warranty" },
  { icon: Truck, label: "Inside Dhaka delivery within 24 hours" },
  { icon: RotateCcw, label: "7-day easy replacement" },
];

export default function GadgetCartPage() {
  const db = useGadgetDB();
  const hydrated = useHydrated();
  const { lines, subtotal, count } = cartDetails(db);

  if (!hydrated) return <PageLoader />;

  const savings = lines.reduce(
    (s, l) => s + (l.product.originalPrice ? (l.product.originalPrice - l.product.price) * l.qty : 0),
    0
  );
  const freeDelivery = subtotal >= FREE_DELIVERY_MIN;
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_MIN) * 100);

  const moveToWishlist = (key: string, productId: string, name: string) => {
    if (!db.wishlist.includes(productId)) toggleWishlist(productId);
    setCartQty(key, 0);
    toast.success(`${name} moved to wishlist`);
  };

  return (
    <div className="container mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">Shopping Cart</h1>
          {lines.length > 0 && (
            <p className="mt-1 text-sm text-neutral-500">
              {count} {count === 1 ? "item" : "items"} in your cart
            </p>
          )}
        </div>
        {lines.length > 0 && (
          <Link
            href="/gadgets/shop"
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-orange-500"
          >
            <ArrowLeft className="size-4" /> Continue shopping
          </Link>
        )}
      </div>

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
        <div className="mt-6 grid items-start gap-6 [&>*]:min-w-0 lg:grid-cols-[1fr_380px] lg:gap-8">
          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Truck className="size-4.5" />
                </span>
                <p className="text-sm text-neutral-700">
                  {freeDelivery ? (
                    <>
                      You&apos;ve unlocked <b className="text-emerald-600">free delivery</b> on this order.
                    </>
                  ) : (
                    <>
                      Add <b className="text-neutral-900">{formatTaka(FREE_DELIVERY_MIN - subtotal)}</b> more for{" "}
                      <b className="text-emerald-600">free delivery</b>.
                    </>
                  )}
                </p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              {lines.map((l) => {
                const href = `/gadgets/product/${l.product.slug}`;
                const maxQty = l.product.stock || 1;
                return (
                  <li key={l.key} className="flex gap-4 p-4 sm:gap-5 sm:p-5">
                    <Link
                      href={href}
                      className="shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={l.product.image} alt="" className="size-24 object-cover sm:size-28" />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                            {l.product.brand}
                          </p>
                          <Link
                            href={href}
                            className="mt-0.5 line-clamp-2 font-medium text-neutral-900 hover:text-orange-500"
                          >
                            {l.product.name}
                          </Link>
                          {l.variant && <p className="mt-0.5 text-xs text-neutral-500">{l.variant}</p>}
                          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-sm">
                            <span className="text-neutral-600">{formatTaka(l.product.price)}</span>
                            {l.product.originalPrice && (
                              <span className="text-xs text-neutral-400 line-through">
                                {formatTaka(l.product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="hidden shrink-0 text-right text-lg font-bold text-neutral-900 sm:block">
                          {formatTaka(l.product.price * l.qty)}
                        </p>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                        <div className="flex h-9 items-center rounded-full border border-neutral-200 bg-white">
                          <button
                            onClick={() => setCartQty(l.key, l.qty - 1)}
                            aria-label="Decrease quantity"
                            className="flex size-9 items-center justify-center rounded-full text-neutral-600 hover:text-orange-500"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                            {l.qty}
                          </span>
                          <button
                            onClick={() => setCartQty(l.key, Math.min(maxQty, l.qty + 1))}
                            disabled={l.qty >= maxQty}
                            aria-label="Increase quantity"
                            className="flex size-9 items-center justify-center rounded-full text-neutral-600 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        <p className="text-base font-bold text-neutral-900 sm:hidden">
                          {formatTaka(l.product.price * l.qty)}
                        </p>

                        <div className="flex w-full items-center gap-4 sm:w-auto">
                          <button
                            onClick={() => moveToWishlist(l.key, l.product.id, l.product.name)}
                            className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-orange-500"
                          >
                            <Heart className="size-3.5" /> Save for later
                          </button>
                          <button
                            onClick={() => setCartQty(l.key, 0)}
                            className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-rose-600"
                          >
                            <Trash2 className="size-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-36">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">Order Summary</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Subtotal ({count} {count === 1 ? "item" : "items"})</dt>
                  <dd className="font-medium text-neutral-900">{formatTaka(subtotal + savings)}</dd>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Discount</dt>
                    <dd className="font-medium text-emerald-600">−{formatTaka(savings)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Delivery</dt>
                  <dd className={freeDelivery ? "font-medium text-emerald-600" : "text-neutral-700"}>
                    {freeDelivery ? "Free" : "Calculated at checkout"}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex items-baseline justify-between border-t border-dashed border-neutral-200 pt-5">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="text-2xl font-bold text-neutral-900">{formatTaka(subtotal)}</span>
              </div>
              {savings > 0 && (
                <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
                  You&apos;re saving {formatTaka(savings)} on this order
                </p>
              )}
              <Link
                href="/gadgets/checkout"
                className="group mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-orange-500 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600"
              >
                <Lock className="size-4" /> Proceed to Checkout
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="mt-4 text-center text-[11px] text-neutral-400">
                bKash · Nagad · Card · 0% EMI · Cash on Delivery
              </p>
            </div>

            <ul className="space-y-3 rounded-2xl bg-[#efefef] p-5">
              {trust.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-neutral-700">
                  <Icon className="size-4.5 shrink-0 text-neutral-500" />
                  {label}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}
