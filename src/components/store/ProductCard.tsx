"use client";

import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import type { Product } from "@/src/data/products";
import { productIconMap } from "@/src/lib/productIcons";
import { useAppDispatch } from "@/src/lib/redux/hooks";
import { addItem } from "@/src/lib/redux/features/cart/cartSlice";
import { cn } from "@/src/lib/utils";

const badgeStyles: Record<string, string> = {
  "20% OFF": "bg-orange-500",
  "15% OFF": "bg-sky-500",
  "10% OFF": "bg-violet-500",
  NEW: "bg-emerald-600",
};

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const Icon = productIconMap[product.icon];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(
      addItem({
        item: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          icon: product.icon,
          color: product.color,
        },
      })
    );
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col rounded-xl border border-neutral-100 bg-white p-3 transition-shadow hover:shadow-lg"
    >
      <div className={cn("relative flex aspect-square items-center justify-center rounded-lg", product.color)}>
        {product.badge && (
          <span
            className={cn(
              "absolute left-2 top-2 rounded-md px-2 py-0.5 text-[11px] font-semibold text-white",
              badgeStyles[product.badge]
            )}
          >
            {product.badge}
          </span>
        )}
        <Icon className="size-16 opacity-80 transition-transform group-hover:scale-110" strokeWidth={1.5} />
      </div>

      <h3 className="mt-3 line-clamp-1 text-sm font-medium text-neutral-800">
        {product.name}
      </h3>

      <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        {product.rating} ({product.reviewCount})
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="font-semibold text-emerald-900">
            ৳{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-neutral-400 line-through">
              ৳{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          aria-label="Add to cart"
          className="flex size-8 items-center justify-center rounded-full border border-emerald-700 text-emerald-800 hover:bg-emerald-800 hover:text-white"
        >
          <ShoppingCart className="size-4" />
        </button>
      </div>
    </Link>
  );
}
