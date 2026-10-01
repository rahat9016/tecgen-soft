"use client";

import Link from "next/link";
import { CalendarClock, Heart, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import { formatTaka, type Gadget } from "@/src/data/gadgets";
import { addToCart, toggleWishlist, useGadgetDB } from "@/src/lib/gadget-store/store";
import { cn } from "@/src/lib/utils";

export default function GadgetCard({ item }: { item: Gadget }) {
  const { wishlist } = useGadgetDB();
  const wished = wishlist.includes(item.id);
  const save = item.originalPrice ? item.originalPrice - item.price : 0;
  const href = `/gadgets/product/${item.slug}`;
  const outOfStock = !item.preOrder && item.stock === 0;

  const onAdd = () => {
    addToCart(item.id);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:border-orange-300 hover:shadow-lg">
      <div className="relative">
        <Link href={href} className="relative block aspect-square overflow-hidden rounded-xl bg-neutral-50">
          {item.preOrder ? (
            <span className="absolute left-2 top-2 z-10 rounded-md bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              PRE-ORDER
            </span>
          ) : item.isNew ? (
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
        </Link>
        <button
          onClick={() => toggleWishlist(item.id)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow-sm transition hover:text-rose-500"
        >
          <Heart className={cn("size-4", wished && "fill-rose-500 text-rose-500")} />
        </button>
      </div>

      <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-neutral-400">{item.brand}</p>
      <h3 className="mt-0.5 line-clamp-2 min-h-10 text-sm font-medium text-neutral-800">
        <Link href={href} className="hover:text-orange-500">
          {item.name}
        </Link>
      </h3>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className="font-bold text-neutral-900">{formatTaka(item.price)}</span>
        {item.originalPrice && (
          <span className="text-xs text-neutral-400 line-through">{formatTaka(item.originalPrice)}</span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        {item.preOrder ? (
          <span className="flex min-w-0 items-center gap-1.5 text-violet-700">
            <CalendarClock className="size-3.5 shrink-0" />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="text-[10px] text-neutral-500">Deposit</span>
              <span className="truncate text-xs font-semibold">{formatTaka(item.preOrder.deposit)}</span>
            </span>
          </span>
        ) : outOfStock ? (
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">Out of stock</span>
        ) : save > 0 ? (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            Save {formatTaka(save)}
          </span>
        ) : (
          <span />
        )}
        {item.preOrder ? (
          <Link
            href={href}
            className="shrink-0 whitespace-nowrap rounded-full bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-violet-700"
          >
            Pre-order
          </Link>
        ) : (
          <button
            onClick={onAdd}
            disabled={outOfStock}
            aria-label={`Add ${item.name} to cart`}
            className="flex size-8 items-center justify-center rounded-full bg-neutral-900 text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag className="size-4" />
          </button>
        )}
      </div>
    </article>
  );
}
