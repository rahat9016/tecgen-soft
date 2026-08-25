"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Minus, Plus, ShoppingCart, Heart, Share2 } from "lucide-react";
import type { Product } from "@/src/data/products";
import { Button } from "@/src/components/ui/button";
import { useAppDispatch } from "@/src/lib/redux/hooks";
import { addItem } from "@/src/lib/redux/features/cart/cartSlice";
import { features } from "@/src/data/banners";

export default function ProductInfo({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"description" | "spec" | "reviews">("description");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const discount =
    product.originalPrice &&
    Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = () => {
    dispatch(
      addItem({
        item: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
        },
        qty,
      })
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/ecommerce/cart");
  };

  return (
    <div>
      <p className="text-xs text-neutral-500">{product.category}</p>
      <h1 className="mt-1 text-2xl font-bold text-neutral-900">{product.name}</h1>

      <div className="mt-2 flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1 text-amber-500">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          {product.rating}
        </span>
        <span className="text-neutral-400">({product.reviewCount} রিভিউ)</span>
        <span className="text-emerald-700">স্টকে আছে ({product.stock})</span>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl font-extrabold text-emerald-900">
          ৳{product.price.toLocaleString()}
        </span>
        {product.originalPrice && (
          <>
            <span className="text-lg text-neutral-400 line-through">
              ৳{product.originalPrice.toLocaleString()}
            </span>
            <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
              {discount}% ছাড়
            </span>
          </>
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-neutral-600">{product.description}</p>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center rounded-md border border-neutral-200">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex size-10 items-center justify-center text-neutral-600 hover:bg-neutral-50"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="flex size-10 items-center justify-center text-neutral-600 hover:bg-neutral-50"
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <Button
          onClick={handleAddToCart}
          className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white"
        >
          <ShoppingCart className="size-4" />
          কার্টে যোগ করুন
        </Button>
        <Button
          onClick={handleBuyNow}
          className="flex-1 bg-amber-400 hover:bg-amber-300 text-emerald-950"
        >
          এখনই কিনুন
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
        <button className="flex items-center gap-1.5 hover:text-emerald-800">
          <Heart className="size-4" /> Wishlist
        </button>
        <button className="flex items-center gap-1.5 hover:text-emerald-800">
          <Share2 className="size-4" /> Share
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4 sm:grid-cols-3">
        {features.slice(0, 3).map((f) => (
          <div key={f.title} className="flex items-center gap-2">
            <f.icon className="size-5 text-emerald-800 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-neutral-800">{f.title}</p>
              <p className="text-[11px] text-neutral-500">{f.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex gap-6 border-b border-neutral-200 text-sm font-medium">
          {(
            [
              ["description", "বিবরণ"],
              ["spec", "স্পেসিফিকেশন"],
              ["reviews", `রিভিউ (${product.reviewCount})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 pb-3 ${
                tab === key
                  ? "border-emerald-800 text-emerald-800"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="py-4 text-sm leading-relaxed text-neutral-600">
          {tab === "description" && <p>{product.description}</p>}
          {tab === "spec" && (
            <ul className="space-y-1.5">
              <li>ক্যাটেগরি: {product.category}</li>
              <li>স্টক: {product.stock} পিস</li>
              <li>রেটিং: {product.rating} / 5</li>
            </ul>
          )}
          {tab === "reviews" && <p>এখনও কোনো বিস্তারিত রিভিউ যোগ করা হয়নি।</p>}
        </div>
      </div>
    </div>
  );
}
