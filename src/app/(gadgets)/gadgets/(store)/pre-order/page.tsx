"use client";

import Link from "next/link";
import { BadgePercent, CalendarClock, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { useGadgetDB, useHydrated } from "@/src/lib/gadget-store/store";
import { daysUntil, formatDate, formatTaka } from "@/src/lib/gadget-store/format";
import { EmptyState } from "@/src/components/gadgets/shared";

const steps = [
  { icon: CalendarClock, title: "Reserve", text: "Pick your model, colour and storage." },
  { icon: BadgePercent, title: "Pay deposit", text: "Secure it with a small refundable deposit." },
  { icon: Truck, title: "Launch-day delivery", text: "Priority dispatch the day stock lands." },
  { icon: Undo2, title: "Change of mind?", text: "Full refund until your device ships." },
];

export default function PreOrderPage() {
  const { products } = useGadgetDB();
  const hydrated = useHydrated();
  const upcoming = products
    .filter((p) => p.active && p.preOrder)
    .sort((a, b) => a.preOrder!.releaseDate.localeCompare(b.preOrder!.releaseDate));

  return (
    <div className="container mt-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-950 via-violet-900 to-fuchsia-900 px-6 py-12 text-white sm:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">Pre-order</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Be the first to own what&apos;s next.
        </h1>
        <p className="mt-4 max-w-xl text-violet-100/80">
          Reserve upcoming phones, watches, laptops and more with a refundable deposit and get them on launch day — with official warranty and 0% EMI.
        </p>
      </section>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3 rounded-2xl border border-neutral-100 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-900">{title}</p>
              <p className="text-xs text-neutral-500">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-2xl font-bold text-neutral-900">
        Open for <span className="text-violet-600">pre-order</span>
      </h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {upcoming.map((p) => {
          const days = daysUntil(p.preOrder!.releaseDate);
          return (
            <article key={p.id} className="grid overflow-hidden rounded-3xl border border-neutral-100 sm:grid-cols-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} className="aspect-square size-full object-cover" />
              <div className="flex flex-col p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">{p.brand}</p>
                <h3 className="mt-1 text-xl font-bold text-neutral-900">{p.name}</h3>
                <p className="mt-2 text-sm text-neutral-500">Launch {formatDate(p.preOrder!.releaseDate)}</p>
                {hydrated && days > 0 && (
                  <p className="mt-2 w-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    {days} days to launch
                  </p>
                )}
                <dl className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Price</dt>
                    <dd className="font-bold">{formatTaka(p.price)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Deposit</dt>
                    <dd className="font-semibold text-violet-700">{formatTaka(p.preOrder!.deposit)}</dd>
                  </div>
                </dl>
                <Link
                  href={`/gadgets/product/${p.slug}`}
                  className="mt-auto flex h-11 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 max-sm:mt-5"
                >
                  Choose & pre-order
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      {upcoming.length === 0 && (
        <EmptyState icon={ShieldCheck} title="No pre-orders open right now" text="Check back before the next launch." />
      )}
    </div>
  );
}
