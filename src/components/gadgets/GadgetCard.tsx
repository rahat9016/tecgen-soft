"use client";

import { ShoppingBag } from "lucide-react";
import { formatTaka, type Gadget } from "@/src/data/gadgets";
import { useGadgetCart } from "./GadgetCart";

export default function GadgetCard({ item }: { item: Gadget }) {
  const { add } = useGadgetCart();
  const save = item.originalPrice ? item.originalPrice - item.price : 0;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-neutral-100 bg-white p-3 transition hover:border-orange-200 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-50">
        {item.isNew ? (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-white">
            NEW
          </span>
        ) : (
          save > 0 && (
            <span className="absolute left-2 top-2 z-10 rounded-md bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              -{Math.round((save / item.originalPrice!) * 100)}%
            </span>
          )
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-neutral-400">{item.brand}</p>
      <h3 className="mt-0.5 line-clamp-2 min-h-10 text-sm font-medium text-neutral-800">{item.name}</h3>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className="font-bold text-neutral-900">{formatTaka(item.price)}</span>
        {item.originalPrice && (
          <span className="text-xs text-neutral-400 line-through">{formatTaka(item.originalPrice)}</span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        {save > 0 ? (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            Save {formatTaka(save)}
          </span>
        ) : (
          <span />
        )}
        <button
          onClick={() => add(item)}
          aria-label={`Add ${item.name} to cart`}
          className="flex size-8 items-center justify-center rounded-full bg-neutral-900 text-white transition hover:bg-orange-500"
        >
          <ShoppingBag className="size-4" />
        </button>
      </div>
    </article>
  );
}
