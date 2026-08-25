"use client";

import { useState } from "react";
import type { Product } from "@/src/data/products";
import { productIconMap } from "@/src/lib/productIcons";
import { cn } from "@/src/lib/utils";

export default function Gallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const Icon = productIconMap[product.icon];
  const thumbs = [0, 1, 2, 3];

  return (
    <div>
      <div className={cn("flex aspect-square items-center justify-center rounded-2xl", product.color)}>
        <Icon className="size-40" strokeWidth={1} key={active} />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {thumbs.map((i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-lg border-2",
              product.color,
              active === i ? "border-emerald-800" : "border-transparent opacity-70"
            )}
          >
            <Icon className="size-10" strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </div>
  );
}
