"use client";

import type { Product } from "@/src/data/products";

export default function Gallery({ product }: { product: Product }) {
  return (
    <div>
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-neutral-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="size-full object-cover"
        />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 border-emerald-800/60 bg-neutral-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={`${product.name} thumbnail ${i + 1}`}
              className="size-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
