"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/src/data/products";
import ProductCard from "@/src/components/store/ProductCard";

export default function ProductCarousel({
  title,
  items,
}: {
  title: string;
  items: Product[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth ?? 200;
    el.scrollBy({ left: dir * (cardWidth + 16) * 2, behavior: "smooth" });
  };

  return (
    <div className="mt-10 first:mt-0">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
        <div className="flex items-center gap-2">
          <Link href="/ecommerce#products" className="text-sm font-medium text-emerald-800 hover:underline">
            View All →
          </Link>
          <button
            onClick={() => scrollByAmount(-1)}
            aria-label="Scroll left"
            className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 hover:text-emerald-800"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scrollByAmount(1)}
            aria-label="Scroll right"
            className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 hover:text-emerald-800"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-6 flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((product) => (
          <div
            key={product.id}
            className="w-[45vw] shrink-0 snap-start sm:w-[220px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
