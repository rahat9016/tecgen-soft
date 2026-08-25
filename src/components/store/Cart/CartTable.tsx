"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import { removeItem, updateQty } from "@/src/lib/redux/features/cart/cartSlice";

export default function CartTable() {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();

  return (
    <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-100">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-4">
          <Link
            href={`/product/${item.slug}`}
            className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.name} className="size-full object-cover" />
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              href={`/product/${item.slug}`}
              className="line-clamp-1 text-sm font-medium text-neutral-800 hover:text-emerald-800"
            >
              {item.name}
            </Link>
            <p className="mt-1 text-sm font-semibold text-emerald-900">
              ৳{item.price.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center rounded-md border border-neutral-200">
            <button
              onClick={() => dispatch(updateQty({ id: item.id, qty: item.qty - 1 }))}
              className="flex size-8 items-center justify-center text-neutral-600 hover:bg-neutral-50"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
            <button
              onClick={() => dispatch(updateQty({ id: item.id, qty: item.qty + 1 }))}
              className="flex size-8 items-center justify-center text-neutral-600 hover:bg-neutral-50"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <p className="w-24 shrink-0 text-right text-sm font-semibold text-neutral-800">
            ৳{(item.price * item.qty).toLocaleString()}
          </p>

          <button
            onClick={() => dispatch(removeItem(item.id))}
            aria-label="Remove item"
            className="text-neutral-400 hover:text-rose-500"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
